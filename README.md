# SustainCommerce AI — Sustainable Commerce SaaS Platform

AI-powered sustainable commerce demo with:
- Product metadata generation (category + SEO tags + sustainability filters)
- B2B procurement proposal generation (product mix + allocation + cost breakdown + impact summary)
- Full AI request/response logging for transparency and debugging

---

## User Demo (What to Click)

Open the web app, then try:
- **Dashboard** (`/`) shows basic stats sourced from the backend.
- **Category Generator** (`/category-generator`) posts a product name/description and saves enriched metadata to the database.
- **Proposal Generator** (`/proposal-generator`) generates a budgeted B2B proposal and saves it to the database.
- **AI Logs** (`/ai-logs`) lists every AI call with prompt + raw response + parsed JSON.

The backend exposes matching APIs under `/api/*`, so you can also test with curl/Postman.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)              │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │Dashboard │ │CategoryGen   │ │ProposalGen  │AI Logs │ │
│  └──────────┘ └──────────────┘ └──────────────────────┘ │
│                    ↕ API Client (fetch)                 │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP /api/*
┌────────────────────────┴────────────────────────────────┐
│               Backend (FastAPI - Python)                │
│  ┌─────────────────────────────────────────────────┐    │
│  │               Routes Layer                      │    │
│  │ product_routes │ proposal_routes │ log/dashboard│    │
│  └─────────────┬───────────────────┬───────────────┘    │
│  ┌─────────────┴───────────────────┴───────────────┐    │
│  │            Services Layer                       │    │
│  │ ai_service  │ product_service │ proposal_service│    │
│  └──────────┬──────────────────────────────────────┘    │
│  ┌──────────┴──────────────────────────────────────┐    │
│  │   Models + Schemas (SQLAlchemy + Pydantic)      │    │
│  └──────────┬──────────────────────────────────────┘    │
└─────────────┼───────────────────────────────────────────┘
              │ SQL
┌─────────────┴───────────────────────────────────────────┐
│          Supabase (PostgreSQL)                          │
│  products │ proposals │ ai_logs                         │
└─────────────────────────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────────┐
│   Hugging Face Router (Inference Providers, e.g. Groq)  │
└─────────────────────────────────────────────────────────┘
```

### Clean Layering

- **Routes** — HTTP endpoint handlers (no business logic)
- **Services** — Business logic and AI orchestration
- **Models** — Database schema (SQLAlchemy ORM)
- **Schemas** — Request/response validation (Pydantic)
- **AI logic** is isolated in `ai_service.py` — never mixed with routes or DB code

---

## How It Works (End-to-End)

### AI Request Pipeline
- Frontend calls a backend route (FastAPI).
- Route calls a service function, which calls the AI router.
- Response is enforced/validated as strict JSON, then validated with Pydantic.
- Business rules are checked (e.g., proposal total must not exceed budget).
- Prompt + raw AI response + parsed JSON are logged to `ai_logs`.
- The final structured result is saved into `products` or `proposals`.

### JSON-Only Enforcement
- The AI call requests a JSON response format when supported.
- Output is parsed as a single JSON object (no markdown, no surrounding text).
- Up to **3 retries** are attempted on malformed JSON or schema errors.

---

## Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Supabase account** (or any PostgreSQL database)
- **Hugging Face API key** (for Inference Providers via Hugging Face Router)

### 1. Clone & Install

```bash
# Install frontend dependencies
cd e:\Rayeva_Ai
npm install

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill values:
```env
HUGGINGFACE_API_KEY="hf_your_token_here"
HUGGINGFACE_MODEL="meta-llama/Llama-4-Scout-17B-16E-Instruct:groq"
database_url="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
```

### 3. Create Database Tables

Open your **Supabase SQL Editor** and run the contents of:
```
backend/database/schema.sql
```

This creates the `products`, `proposals`, and `ai_logs` tables with indexes and RLS policies.

### 4. Start Backend

```bash
cd e:\Rayeva_Ai
python -m uvicorn backend.main:app --reload --port 8000
```

The FastAPI server starts at `http://localhost:8000`.  
API docs available at `http://localhost:8000/docs`.

If port `8000` is already in use, run on `8001` instead:
```bash
python -m uvicorn backend.main:app --reload --port 8001
```

### 5. Start Frontend

```bash
cd e:\Rayeva_Ai
npm run dev
```

The Vite dev server starts at `http://localhost:5173`.  
API calls are automatically proxied to the backend via `vite.config.ts`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-product-metadata` | Generate AI product categories |
| GET | `/api/products` | List all products |
| POST | `/api/generate-b2b-proposal` | Generate AI B2B proposal |
| GET | `/api/proposals` | List all proposals |
| GET | `/api/ai-logs` | Search/filter AI processing logs |
| GET | `/api/dashboard/stats` | Dashboard aggregate statistics |
| GET | `/health` | Health check |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS 4 + React Router |
| Backend | FastAPI + Python 3.10+ |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic 2.0 |
| AI | Hugging Face Router (Inference Providers) |
| Charts | Recharts |
| Icons | Lucide React |

---

## AI Prompt Design Explanation

This project uses a strict JSON contract so the UI and database always receive structured, predictable data.

### Two-Prompt Structure
- **System prompt** defines the role (e.g., product taxonomy expert / B2B procurement specialist), output schema, and hard rules (JSON only, no extra text).
- **User prompt** contains only the dynamic inputs (product name/description or budget/purpose/quantity) to keep prompts stable and reduce drift.

### Output Contracts (Schema-First)
Each module has a fixed JSON shape:
- **Auto Category**
  - `{ "primary_category": "", "sub_category": "", "seo_tags": [], "sustainability_filters": [] }`
- **B2B Proposal**
  - `{ "product_mix": [], "budget_allocation": {}, "cost_breakdown": {}, "impact_summary": {} }`

Responses are validated with **Pydantic** before anything is saved or returned to the frontend. If the JSON is malformed or does not match the schema, the request is retried.

### JSON-Only Enforcement + Retries
- The AI is instructed to return only a single JSON object (no markdown, no explanations).
- The backend parses and validates the JSON.
- Up to **3 retries** run on parse or validation failures to improve reliability.

### Business Rule Validation (Backend)
- For proposals, the backend checks key constraints (e.g., totals should not exceed the budget) and enforces consistency between line items and the cost breakdown.

### Logging for Debugging and Audit
- Every AI call logs prompt, raw model response, and parsed JSON into `ai_logs` for traceability and debugging.
