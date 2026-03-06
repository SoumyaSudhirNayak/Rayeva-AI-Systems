"""
Product Routes - API endpoints for product metadata generation and retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from backend.database.config import get_db
from backend.schemas.schemas import ProductMetadataRequest, ProductMetadataResponse
from backend.services.ai_service import generate_product_metadata
from backend.services.product_service import save_product, get_products

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Products"])


@router.post("/generate-product-metadata")
async def generate_metadata(request: ProductMetadataRequest, db: Session = Depends(get_db)):
    """
    Generate AI-powered product categorization metadata.
    Calls Hugging Face Inference API to generate categories, SEO tags, and sustainability filters.
    Stores the result in the database.
    """
    try:
        # Generate metadata via AI
        ai_result = generate_product_metadata(
            name=request.name,
            description=request.description,
            db=db
        )

        # Save product with generated metadata
        product = save_product(
            db=db,
            name=request.name,
            description=request.description,
            metadata=ai_result
        )

        return {
            "success": True,
            "data": {
                "id": str(product.id),
                "name": product.name,
                "description": product.description,
                "primary_category": product.primary_category,
                "sub_category": product.sub_category,
                "seo_tags": product.seo_tags,
                "sustainability_filters": product.sustainability_filters,
                "created_at": product.created_at.isoformat() if product.created_at else None
            }
        }

    except RuntimeError as e:
        logger.error(f"AI generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/products")
async def list_products(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get all products with their metadata."""
    try:
        products = get_products(db, skip=skip, limit=limit)
        return {
            "success": True,
            "data": [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "description": p.description,
                    "primary_category": p.primary_category,
                    "sub_category": p.sub_category,
                    "seo_tags": p.seo_tags,
                    "sustainability_filters": p.sustainability_filters,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in products
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail=str(e))
