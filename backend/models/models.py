import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Numeric, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from backend.database.config import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    primary_category = Column(String(255))
    sub_category = Column(String(255))
    seo_tags = Column(JSONB, default=list)
    sustainability_filters = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    budget = Column(Numeric(12, 2), nullable=False)
    purpose = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    product_mix = Column(JSONB, default=list)
    allocation = Column(JSONB, default=dict)
    cost_breakdown = Column(JSONB, default=dict)
    impact_summary = Column(JSONB, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_name = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=False)
    raw_response = Column(Text)
    parsed_json = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
