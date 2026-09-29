"""
MedFA FastAPI Application Entry Point.

This is the main application module that wires together the engine,
services, and API routes.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.constants import MEDICAL_DISCLAIMER
from .engine.fuzzy_automaton import FuzzyAutomaton
from .services.diagnosis_service import DiagnosisService
from .api import health, diagnosis

# ──────────────────────────────────────────────
# Engine and service initialization
# ──────────────────────────────────────────────

# Initialize the FFA engine (framework-independent)
engine = FuzzyAutomaton()

# Create the service layer
diagnosis_service = DiagnosisService(engine=engine)


# ──────────────────────────────────────────────
# Application lifespan
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup: validate rule base
    errors = engine.validate_rule_base()
    if errors:
        print(f"⚠️ Rule base validation warnings: {errors}")
    else:
        print(f"✅ MedFA engine initialized — {len(engine.conditions)} conditions, "
              f"rule base v{engine.rule_base_version}")
    yield
    # Shutdown
    print("🛑 MedFA shutting down")


# ──────────────────────────────────────────────
# FastAPI Application
# ──────────────────────────────────────────────

app = FastAPI(
    title="MedFA — Medical Diagnosis Using Fuzzy Automata",
    description=(
        "A decision-support system that models medical diagnosis as a "
        "Fuzzy Finite Automaton (FFA), handling imprecise symptoms to "
        "produce ranked differential diagnoses with confidence scores "
        f"and explainability.\n\n**Disclaimer:** {MEDICAL_DISCLAIMER}"
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
# CORS Middleware
# ──────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Register API routes
# ──────────────────────────────────────────────

app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(diagnosis.router, prefix=settings.API_V1_PREFIX)


# ──────────────────────────────────────────────
# Root endpoint
# ──────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with basic application information."""
    return {
        "name": "MedFA",
        "version": settings.APP_VERSION,
        "disclaimer": MEDICAL_DISCLAIMER,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_PREFIX,
    }
