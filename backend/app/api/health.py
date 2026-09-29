"""
Health check API endpoint.
"""

from fastapi import APIRouter

from ..models.schemas import HealthResponse
from ..core.config import settings

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Health status check",
)
async def health_check() -> dict:
    """Return service health status and basic metadata."""
    # Import here to avoid circular imports; engine is set at startup
    from ..main import diagnosis_service

    health = diagnosis_service.get_health_info()
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "rule_base_version": health["rule_base_version"],
        "conditions_count": health["conditions_count"],
        "symptoms_count": health["symptoms_count"],
    }
