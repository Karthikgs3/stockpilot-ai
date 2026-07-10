"""
Centralized application configuration.
All environment-driven settings live here so the rest of the app never
touches os.environ directly.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "StockPilot AI"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Redis
    REDIS_URL: str | None = None

    # Market data
    ALPHA_VANTAGE_API_KEY: str | None = None
    ALPHA_VANTAGE_BASE_URL: str = "https://www.alphavantage.co/query"

    # News (Finnhub)
    FINNHUB_API_KEY: str | None = None
    FINNHUB_BASE_URL: str = "https://finnhub.io/api/v1"

    # AI
    ANTHROPIC_API_KEY: str | None = None


@lru_cache
def get_settings() -> Settings:
    """Cached so Settings() is only parsed once per process."""
    return Settings()


settings = get_settings()
