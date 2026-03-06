"""
SustainCommerce SaaS - FastAPI Backend
Main application entry point.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.product_routes import router as product_router
from backend.routes.proposal_routes import router as proposal_router
from backend.routes.log_routes import router as log_router
from backend.routes.dashboard_routes import router as dashboard_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SustainCommerce AI API",
    description="AI-Powered Sustainable Commerce SaaS Backend",
    version="1.0.0"
)

# CORS middleware — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(product_router)
app.include_router(proposal_router)
app.include_router(log_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {
        "message": "SustainCommerce AI API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
