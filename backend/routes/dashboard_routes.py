"""
Dashboard Routes - API endpoints for overview statistics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from backend.database.config import get_db
from backend.services.product_service import get_product_count, get_categories_count
from backend.services.proposal_service import get_proposal_count

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get aggregated dashboard statistics from the database."""
    try:
        total_products = get_product_count(db)
        ai_categories = get_categories_count(db)
        proposals_created = get_proposal_count(db)

        # Calculate sustainability score based on available data
        # Average of all proposal impact scores, or default to 0
        sustainability_score = 0.0
        if proposals_created > 0:
            from backend.models.models import Proposal
            from sqlalchemy import func
            proposals = db.query(Proposal).all()
            scores = []
            for p in proposals:
                if isinstance(p.impact_summary, dict) and "overall_score" in p.impact_summary:
                    scores.append(p.impact_summary["overall_score"])
            if scores:
                sustainability_score = round(sum(scores) / len(scores), 1)

        return {
            "success": True,
            "data": {
                "total_products": total_products,
                "ai_categories_generated": ai_categories,
                "proposals_created": proposals_created,
                "sustainability_score": sustainability_score
            }
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
