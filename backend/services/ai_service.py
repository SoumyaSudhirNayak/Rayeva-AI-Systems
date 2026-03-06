"""
AI Service - Handles all Hugging Face Inference API interactions.
Isolated AI logic with retry mechanism, JSON validation, and logging.
"""

import os
import json
import logging
import time
from typing import Optional
import httpx
from pydantic import ValidationError
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.models.models import AILog
from backend.schemas.schemas import ProductMetadataAIResponse, B2BProposalAIResponse

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

logger = logging.getLogger(__name__)

def _reload_env() -> None:
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=True)


def _get_hf_api_key() -> Optional[str]:
    _reload_env()
    return os.getenv("HUGGINGFACE_API_KEY")


def _get_hf_model() -> str:
    _reload_env()
    return os.getenv("HUGGINGFACE_MODEL", "HuggingFaceH4/zephyr-7b-beta")

MAX_RETRIES = 3
HF_TEMPERATURE = 0.2
HF_MAX_NEW_TOKENS = 900
HF_TIMEOUT_SECONDS = 60
HF_FALLBACK_MODELS = [
    "Qwen/Qwen2.5-1.5B-Instruct:hf-inference",
    "microsoft/Phi-3-mini-4k-instruct:hf-inference",
    "HuggingFaceTB/SmolLM2-1.7B-Instruct:hf-inference",
]


def _log_ai_call(db: Session, module_name: str, prompt: str, raw_response: str, parsed_json: dict):
    """Log every AI interaction to the database."""
    try:
        log_entry = AILog(
            module_name=module_name,
            prompt=prompt,
            raw_response=raw_response,
            parsed_json=parsed_json
        )
        db.add(log_entry)
        db.commit()
        logger.info(f"AI call logged for module: {module_name}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log AI call: {e}")


def _call_huggingface(system_prompt: str, user_prompt: str, model: Optional[str] = None) -> str:
    api_key = _get_hf_api_key()
    if not api_key:
        raise RuntimeError("Hugging Face API key missing — set HUGGINGFACE_API_KEY in .env")

    selected_model = model or _get_hf_model()
    url = "https://router.huggingface.co/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    def _post(model_id: str) -> httpx.Response:
        payload = {
            "model": model_id,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": HF_TEMPERATURE,
            "max_tokens": HF_MAX_NEW_TOKENS,
            "response_format": {"type": "json_object"},
        }
        with httpx.Client(timeout=HF_TIMEOUT_SECONDS) as client:
            return client.post(url, headers=headers, json=payload)

    model_candidates = [selected_model]
    if ":" not in selected_model:
        model_candidates.append(f"{selected_model}:hf-inference")
    model_candidates.extend([m for m in HF_FALLBACK_MODELS if m not in model_candidates])

    last_error_text = None
    for model_id in model_candidates:
        resp = _post(model_id)
        if resp.status_code < 400:
            data = resp.json()
            if isinstance(data, dict) and data.get("error"):
                last_error_text = str(data.get("error"))
                continue
            try:
                return str(data["choices"][0]["message"]["content"])
            except Exception:
                last_error_text = f"Unexpected Hugging Face response format: {data}"
                continue

        last_error_text = resp.text
        if resp.status_code == 400:
            try:
                err = resp.json().get("error", {})
                if isinstance(err, dict) and err.get("code") == "model_not_supported":
                    continue
            except Exception:
                pass
        break

    raise RuntimeError(
        "Hugging Face request failed. "
        f"Model tried: {', '.join(model_candidates)}. "
        f"Last error: {last_error_text}"
    )


def _parse_strict_json_object(text: str) -> dict:
    candidate = (text or "").strip()
    if not candidate:
        raise json.JSONDecodeError("Empty response", "", 0)
    if not (candidate.startswith("{") and candidate.endswith("}")):
        raise json.JSONDecodeError("Response is not JSON-only", candidate, 0)
    return json.loads(candidate)


def _parse_json_with_retry(
    system_prompt: str,
    user_prompt: str,
    module_name: str,
    db: Session,
    validator_class=None
) -> dict:
    """
    Call OpenAI, parse JSON response, validate with Pydantic schema.
    Retries up to MAX_RETRIES times on malformed JSON.
    Logs every attempt.
    """
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"[{module_name}] Attempt {attempt}/{MAX_RETRIES}")

            retry_user_prompt = user_prompt
            if attempt > 1 and last_error:
                retry_user_prompt = "\n".join(
                    [
                        user_prompt.strip(),
                        "",
                        f"Previous attempt failed: {last_error}",
                        "Return ONLY a single valid JSON object matching the exact schema. No extra text.",
                    ]
                )

            raw_response = _call_huggingface(system_prompt, retry_user_prompt)

            parsed = _parse_strict_json_object(raw_response)

            if validator_class:
                validated = validator_class(**parsed)
                parsed = validated.model_dump()

            full_prompt = "\n".join(
                [
                    "SYSTEM:",
                    system_prompt.strip(),
                    "",
                    "USER:",
                    retry_user_prompt.strip(),
                ]
            )
            _log_ai_call(db, module_name, full_prompt, raw_response, parsed)

            return parsed

        except json.JSONDecodeError as e:
            last_error = f"JSON parse error on attempt {attempt}: {e}"
            logger.warning(last_error)
            full_prompt = "\n".join(
                [
                    "SYSTEM:",
                    system_prompt.strip(),
                    "",
                    "USER:",
                    user_prompt.strip(),
                ]
            )
            _log_ai_call(
                db,
                module_name,
                full_prompt,
                raw_response if "raw_response" in locals() else str(e),
                {"error": last_error},
            )
            time.sleep(0.6)

        except ValidationError as e:
            last_error = f"Schema validation error on attempt {attempt}: {e}"
            logger.warning(last_error)
            full_prompt = "\n".join(
                [
                    "SYSTEM:",
                    system_prompt.strip(),
                    "",
                    "USER:",
                    user_prompt.strip(),
                ]
            )
            _log_ai_call(
                db,
                module_name,
                full_prompt,
                raw_response if "raw_response" in locals() else str(e),
                {"error": last_error},
            )
            time.sleep(0.6)

        except Exception as e:
            last_error = f"Error on attempt {attempt}: {e}"
            logger.warning(last_error)
            full_prompt = "\n".join(
                [
                    "SYSTEM:",
                    system_prompt.strip(),
                    "",
                    "USER:",
                    user_prompt.strip(),
                ]
            )
            _log_ai_call(db, module_name, full_prompt, str(e), {"error": last_error})
            if "json_validate_failed" in str(e):
                time.sleep(0.6)
                continue
            raise RuntimeError(last_error)

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries. Last error: {last_error}")


def generate_product_metadata(name: str, description: str, db: Session) -> dict:
    """
    Generate product categories, SEO tags, and sustainability filters using AI.
    Returns validated JSON matching ProductMetadataAIResponse schema.
    """
    system_prompt = """You are an AI product categorization expert for a sustainable commerce platform.
Your job is to analyze product information and generate structured metadata.

You MUST respond with ONLY valid JSON in this exact format:
{
    "primary_category": "string - main product category",
    "sub_category": "string - specific sub-category",
    "seo_tags": ["array", "of", "relevant", "seo", "keywords"],
    "sustainability_filters": ["array", "of", "applicable", "sustainability", "certifications"]
}

Rules:
- primary_category should be a broad category (e.g., "Sustainable Home Goods", "Eco-Friendly Fashion")
- sub_category should be more specific (e.g., "Eco-Friendly Kitchen", "Organic Cotton Apparel")
- seo_tags should include 5-8 relevant keywords for search optimization
- sustainability_filters should include applicable certifications/attributes like:
  "Recyclable", "Biodegradable", "Carbon Neutral", "Fair Trade", "Organic",
  "Vegan", "Zero Waste", "Renewable Materials", "Energy Efficient", "Compostable"
- Only include filters that genuinely apply to the product
- Return ONLY the JSON object, no additional text"""

    user_prompt = f"""Analyze this product and generate structured metadata:

Product Name: {name}
Product Description: {description}

Generate the categorization metadata as specified JSON format."""

    return _parse_json_with_retry(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        module_name="Category Generator",
        db=db,
        validator_class=ProductMetadataAIResponse
    )


def generate_b2b_proposal(budget: float, purpose: str, quantity: int, db: Session) -> dict:
    """
    Generate a B2B procurement proposal with product mix, budget allocation,
    cost breakdown, and sustainability impact.
    Returns validated JSON matching B2BProposalAIResponse schema.
    """
    system_prompt = f"""You are an AI B2B procurement specialist for a sustainable commerce platform.
Your job is to create intelligent procurement proposals that maximize sustainability impact within budget.

You MUST respond with ONLY valid JSON in this exact format:
{{
  "product_mix": [],
  "budget_allocation": {{}},
  "cost_breakdown": {{}},
  "impact_summary": {{
    "co2_saved": "string (e.g. '150 kg')",
    "trees_planted": number,
    "plastic_reduced": "string (e.g. '25%')",
    "overall_score": number (0-100)
  }}
}}

CRITICAL RULES:
- Return JSON only (no markdown, no explanation, no extra keys)
- cost_breakdown.total MUST be a number and MUST NOT exceed the budget of {budget} (INR)
- cost_breakdown must include numeric keys: subtotal, tax, shipping, total
- product_mix must be a list of line items; each item should include name, category, quantity, unit_price, total, sustainability_score
- product_mix totals should be consistent with cost_breakdown.subtotal
- impact_summary MUST be a JSON object with co2_saved, trees_planted, plastic_reduced, overall_score
"""

    user_prompt = f"""Create a B2B procurement proposal with these requirements:

Budget: ₹{budget} INR
Purpose: {purpose}
Total Quantity Needed: {quantity} units

Generate an optimal sustainable product mix within budget."""

    result = _parse_json_with_retry(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        module_name="Proposal Generator",
        db=db,
        validator_class=B2BProposalAIResponse
    )

    cost_breakdown = result.get("cost_breakdown") or {}
    total_cost = cost_breakdown.get("total")
    if not isinstance(total_cost, (int, float)):
        raise RuntimeError("Invalid AI response: cost_breakdown.total must be a number")
    if float(total_cost) > float(budget):
        raise RuntimeError(f"Invalid AI response: total {total_cost} exceeds budget {budget}")

    return result
