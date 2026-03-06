"""
Proposal Routes - API endpoints for B2B proposal generation and retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from backend.database.config import get_db
from backend.schemas.schemas import B2BProposalRequest
from backend.services.ai_service import generate_b2b_proposal
from backend.services.proposal_service import save_proposal, get_proposals

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Proposals"])


@router.post("/generate-b2b-proposal")
async def generate_proposal(request: B2BProposalRequest, db: Session = Depends(get_db)):
    """
    Generate an AI-powered B2B procurement proposal.
    Creates product mix, budget allocation, cost breakdown, and sustainability impact.
    Validates total cost does not exceed budget.
    """
    try:
        # Generate proposal via AI
        ai_result = generate_b2b_proposal(
            budget=request.budget,
            purpose=request.purpose,
            quantity=request.quantity,
            db=db
        )

        # Save proposal to database
        proposal = save_proposal(
            db=db,
            budget=request.budget,
            purpose=request.purpose,
            quantity=request.quantity,
            ai_result=ai_result
        )

        return {
            "success": True,
            "data": {
                "id": str(proposal.id),
                "budget": float(proposal.budget),
                "purpose": proposal.purpose,
                "quantity": proposal.quantity,
                "products": proposal.product_mix,
                "budgetAllocation": proposal.allocation,
                "costBreakdown": proposal.cost_breakdown,
                "impactSummary": proposal.impact_summary,
                "created_at": proposal.created_at.isoformat() if proposal.created_at else None
            }
        }

    except RuntimeError as e:
        logger.error(f"AI proposal generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/proposals")
async def list_proposals(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get all proposals."""
    try:
        proposals = get_proposals(db, skip=skip, limit=limit)
        return {
            "success": True,
            "data": [
                {
                    "id": str(p.id),
                    "budget": float(p.budget),
                    "purpose": p.purpose,
                    "quantity": p.quantity,
                    "product_mix": p.product_mix,
                    "allocation": p.allocation,
                    "cost_breakdown": p.cost_breakdown,
                    "impact_summary": p.impact_summary,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in proposals
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching proposals: {e}")
        raise HTTPException(status_code=500, detail=str(e))
