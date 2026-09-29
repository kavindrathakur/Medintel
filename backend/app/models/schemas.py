"""
Pydantic schemas for MedFA API request and response validation.

All schemas follow the API contract defined in Architecture.md.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

from ..core.constants import COMPOSITION_METHODS


# ──────────────────────────────────────────────
# Request schemas
# ──────────────────────────────────────────────

class Demographics(BaseModel):
    """Optional demographic information (non-identifying)."""
    age: Optional[int] = Field(None, ge=0, le=120, description="Age in years")
    sex: Optional[str] = Field(None, description="Biological sex: male, female, or other")
    risk_factors: list[str] = Field(default_factory=list, description="Known risk factors")

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v: str | None) -> str | None:
        if v is not None:
            allowed = {"male", "female", "other"}
            if v.lower() not in allowed:
                raise ValueError(f"sex must be one of {allowed}")
            return v.lower()
        return v


class DiagnosisRequest(BaseModel):
    """Request body for POST /diagnoses/evaluate."""
    demographics: Optional[Demographics] = None
    symptoms: dict[str, Optional[float]] = Field(
        ...,
        description="Mapping of symptom_id to raw value. Use null for unknown symptoms.",
    )
    composition_method: str = Field(
        "max_min",
        description="Composition method: max_min or max_product",
    )

    @field_validator("composition_method")
    @classmethod
    def validate_composition_method(cls, v: str) -> str:
        if v not in COMPOSITION_METHODS:
            raise ValueError(
                f"composition_method must be one of {COMPOSITION_METHODS}"
            )
        return v


# ──────────────────────────────────────────────
# Response schemas
# ──────────────────────────────────────────────

class ContributorResponse(BaseModel):
    """A single symptom's contribution to a diagnosis."""
    symptom: str
    contribution: float


class DiagnosisResultResponse(BaseModel):
    """A single ranked diagnosis result."""
    rank: int
    condition_id: str
    condition_name: str
    description: str
    category: str
    confidence: float
    confidence_percent: int
    relevance_label: str
    contributors: list[ContributorResponse]


class DataCompletenessResponse(BaseModel):
    """Metadata about symptom data completeness."""
    total_symptoms: int
    provided_count: int
    missing_count: int
    completeness_ratio: float
    missing_symptoms: list[str]


class DiagnosisResponse(BaseModel):
    """Full response from POST /diagnoses/evaluate."""
    session_id: str
    diagnoses: list[DiagnosisResultResponse]
    warnings: list[str]
    missing_symptom_count: int
    data_completeness: DataCompletenessResponse
    composition_method: str
    rule_base_version: str
    insufficient_evidence: bool


class ConditionResponse(BaseModel):
    """A single supported condition."""
    condition_id: str
    name: str
    description: str
    category: str
    status: str


class SymptomResponse(BaseModel):
    """A single supported symptom."""
    symptom_id: str
    name: str
    input_type: str
    unit: Optional[str] = None
    min: float
    max: float
    group: str


class HealthResponse(BaseModel):
    """Response from GET /health."""
    status: str
    version: str
    rule_base_version: str
    conditions_count: int
    symptoms_count: int


class ErrorDetail(BaseModel):
    """Single error detail."""
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """Consistent JSON error response structure per Rules.md."""
    error: dict[str, Any] = Field(
        ...,
        description="Error object with code, message, and details",
    )
