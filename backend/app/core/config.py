"""
Application configuration for MedFA backend.

Loads settings from environment variables with sensible defaults.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "MedFA"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./medfa.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Sessions
    SESSION_RETENTION_DAYS: int = 7

    # Admin
    ADMIN_API_KEY: str = "change_me_before_production"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
