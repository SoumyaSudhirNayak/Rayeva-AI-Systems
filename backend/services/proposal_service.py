"""
Proposal Service - Handles proposal CRUD operations and validation.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.models import Proposal

logger = logging.getLogger(__name__)


def save_proposal(db: Session, budget: float, purpose: str, quantity: int, ai_result: dict) -> Proposal:
    """Save a proposal with AI-generated data to the database."""
    proposal = Proposal(
        budget=budget,
        purpose=purpose,
        quantity=quantity,
        product_mix=ai_result.get("product_mix", []),
        allocation=ai_result.get("budget_allocation", {}),
        cost_breakdown=ai_result.get("cost_breakdown", {}),
        impact_summary=ai_result.get("impact_summary", "")
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    logger.info(f"Proposal saved: {proposal.id} - Budget: ${budget}")
    return proposal


def get_proposals(db: Session, skip: int = 0, limit: int = 50):
    """Get all proposals, most recent first."""
    return db.query(Proposal).order_by(Proposal.created_at.desc()).offset(skip).limit(limit).all()


def get_proposal_count(db: Session) -> int:
    """Get total number of proposals."""
    return db.query(func.count(Proposal.id)).scalar() or 0
