from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID


# =============================================
# Product Metadata Schemas
# =============================================

class ProductMetadataRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: str = Field(..., min_length=10, description="Product description")


class ProductMetadataAIResponse(BaseModel):
    """Schema to validate AI-generated product metadata."""
    primary_category: str
    sub_category: str
    seo_tags: List[str]
    sustainability_filters: List[str]


class ProductMetadataResponse(BaseModel):
    id: Optional[UUID] = None
    name: str
    description: str
    primary_category: str
    sub_category: str
    seo_tags: List[str]
    sustainability_filters: List[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================
# B2B Proposal Schemas
# =============================================

class B2BProposalRequest(BaseModel):
    budget: float = Field(..., gt=0, description="Total budget in INR")
    purpose: str = Field(..., min_length=1, description="Purpose of procurement")
    quantity: int = Field(..., gt=0, description="Total quantity needed")


class ImpactSummary(BaseModel):
    co2_saved: str = Field(..., description="Estimated CO2 savings (e.g., '150 kg')")
    trees_planted: int = Field(..., description="Number of trees equivalent")
    plastic_reduced: str = Field(..., description="Percentage of plastic reduction (e.g., '25%')")
    overall_score: int = Field(..., ge=0, le=100, description="Overall sustainability score (0-100)")


class B2BProposalAIResponse(BaseModel):
    """Schema to validate AI-generated B2B proposal."""
    product_mix: List[Dict[str, Any]]
    budget_allocation: Dict[str, Any]
    cost_breakdown: Dict[str, Any]
    impact_summary: ImpactSummary


class B2BProposalResponse(BaseModel):
    id: Optional[UUID] = None
    budget: float
    purpose: str
    quantity: int
    product_mix: List[Dict[str, Any]]
    allocation: Dict[str, Any]
    cost_breakdown: Dict[str, Any]
    impact_summary: ImpactSummary
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================
# AI Log Schemas
# =============================================

class AILogResponse(BaseModel):
    id: UUID
    module_name: str
    prompt: str
    raw_response: Optional[str] = None
    parsed_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AILogListResponse(BaseModel):
    logs: List[AILogResponse]
    total: int


# =============================================
# Dashboard Schemas
# =============================================

class DashboardStatsResponse(BaseModel):
    total_products: int
    ai_categories_generated: int
    proposals_created: int
    sustainability_score: float
