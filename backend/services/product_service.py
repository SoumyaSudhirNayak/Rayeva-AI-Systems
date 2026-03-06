"""
Product Service - Handles product CRUD operations.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.models import Product
from backend.schemas.schemas import ProductMetadataResponse

logger = logging.getLogger(__name__)


def save_product(db: Session, name: str, description: str, metadata: dict) -> Product:
    """Save a product with AI-generated metadata to the database."""
    product = Product(
        name=name,
        description=description,
        primary_category=metadata.get("primary_category"),
        sub_category=metadata.get("sub_category"),
        seo_tags=metadata.get("seo_tags", []),
        sustainability_filters=metadata.get("sustainability_filters", [])
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    logger.info(f"Product saved: {product.id} - {product.name}")
    return product


def get_products(db: Session, skip: int = 0, limit: int = 50):
    """Get all products, most recent first."""
    return db.query(Product).order_by(Product.created_at.desc()).offset(skip).limit(limit).all()


def get_product_count(db: Session) -> int:
    """Get total number of products."""
    return db.query(func.count(Product.id)).scalar() or 0


def get_categories_count(db: Session) -> int:
    """Get count of products that have AI-generated categories."""
    return db.query(func.count(Product.id)).filter(
        Product.primary_category.isnot(None)
    ).scalar() or 0
