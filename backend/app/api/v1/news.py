from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.news import NewsResponse
from app.services.news_service import NewsService
from fastapi import APIRouter, Depends, Query

router = APIRouter(prefix="/news", tags=["News"])


@router.get("/market", response_model=NewsResponse)
def get_market_news(
    category: str | None = Query(
        default=None,
        description="One of: markets, earnings, technology, economy, mergers, ipo, energy",
    ),
    limit: int = Query(default=20, ge=1, le=200),
    current_user: User = Depends(get_current_user),
) -> NewsResponse:
    """Latest general market news, optionally filtered by category."""
    return NewsService().get_market_news(category=category, limit=limit)


@router.get("/company/{symbol}", response_model=NewsResponse)
def get_company_news(
    symbol: str,
    limit: int = Query(default=20, ge=1, le=200),
    current_user: User = Depends(get_current_user),
) -> NewsResponse:
    """News specific to a single ticker symbol."""
    return NewsService().get_company_news(symbol=symbol, limit=limit)


@router.get("/search", response_model=NewsResponse)
def search_news(
    q: str = Query(min_length=1, max_length=100),
    limit: int = Query(default=20, ge=1, le=200),
    current_user: User = Depends(get_current_user),
) -> NewsResponse:
    """Search news by company symbol (best match) or general topic keyword."""
    return NewsService().search_news(query=q, limit=limit)
