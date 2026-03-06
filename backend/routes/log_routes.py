"""
Log Routes - API endpoints for AI processing logs.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import logging

from backend.database.config import get_db
from backend.models.models import AILog

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["AI Logs"])


@router.get("/ai-logs")
async def get_ai_logs(
    search: str = Query("", description="Search query for logs"),
    module: str = Query("all", description="Filter by module name"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all AI processing logs with optional search and filter."""
    try:
        query = db.query(AILog)

        # Filter by module
        if module and module != "all":
            query = query.filter(AILog.module_name == module)

        # Search across prompt and raw_response
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    AILog.module_name.ilike(search_pattern),
                    AILog.prompt.ilike(search_pattern),
                    AILog.raw_response.ilike(search_pattern)
                )
            )

        # Get total count before pagination
        total = query.count()

        # Order and paginate
        logs = query.order_by(AILog.created_at.desc()).offset(skip).limit(limit).all()

        return {
            "success": True,
            "total": total,
            "data": [
                {
                    "id": str(log.id),
                    "module_name": log.module_name,
                    "prompt": log.prompt,
                    "raw_response": log.raw_response,
                    "parsed_json": log.parsed_json,
                    "created_at": log.created_at.isoformat() if log.created_at else None
                }
                for log in logs
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching AI logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))
