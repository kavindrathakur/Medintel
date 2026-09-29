"""
Diagnosis API endpoint — the core evaluation route.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from ..models.schemas import (
    DiagnosisRequest,
    DiagnosisResponse,
    ConditionResponse,
    SymptomResponse,
)

router = APIRouter()


@router.post(
    "/diagnoses/evaluate",
    response_model=DiagnosisResponse,
    tags=["Diagnosis"],
    summary="Submit symptoms and receive ranked diagnoses",
)
async def evaluate_diagnosis(request: DiagnosisRequest) -> dict:
    """Submit symptom values and receive a ranked differential diagnosis.

    The engine applies fuzzy finite automaton transitions to produce
    confidence-scored, explainable results.
    """
    from ..main import diagnosis_service

    try:
        result = diagnosis_service.evaluate(
            symptoms=request.symptoms,
            demographics=request.demographics.model_dump() if request.demographics else None,
            composition_method=request.composition_method,
        )
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": str(e),
                    "details": [],
                }
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred during diagnosis evaluation.",
                    "details": [],
                }
            },
        )


@router.get(
    "/conditions",
    response_model=list[ConditionResponse],
    tags=["Reference"],
    summary="List all supported conditions",
)
async def list_conditions() -> list[dict]:
    """Return the list of conditions supported by this MedFA instance."""
    from ..main import diagnosis_service
    return diagnosis_service.get_conditions()


@router.get(
    "/symptoms",
    response_model=list[SymptomResponse],
    tags=["Reference"],
    summary="List all available symptoms and input metadata",
)
async def list_symptoms() -> list[dict]:
    """Return the list of symptoms with input types, ranges, and groups."""
    from ..main import diagnosis_service
    return diagnosis_service.get_symptoms()
