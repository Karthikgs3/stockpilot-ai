from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import (AssetAllocationResponse,
                                   PerformanceHistoryResponse,
                                   PerformancePeriod, PortfolioMetrics,
                                   SectorAllocationResponse, TopMoversResponse)
from app.services.analytics_service import AnalyticsService
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/performance", response_model=PerformanceHistoryResponse)
def get_performance(
    period: PerformancePeriod = Query(default=PerformancePeriod.MONTHLY),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PerformanceHistoryResponse:
    """Invested-capital growth over time, from the transaction ledger."""
    return AnalyticsService(db).get_performance_history(current_user.id, period)


@router.get("/allocation", response_model=AssetAllocationResponse)
def get_allocation(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> AssetAllocationResponse:
    """Per-symbol share of total portfolio market value."""
    return AnalyticsService(db).get_asset_allocation(current_user.id)


@router.get("/sector-allocation", response_model=SectorAllocationResponse)
def get_sector_allocation(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> SectorAllocationResponse:
    """Per-sector share of total portfolio market value."""
    return AnalyticsService(db).get_sector_allocation(current_user.id)


@router.get("/top-movers", response_model=TopMoversResponse)
def get_top_movers(
    limit: int = Query(default=5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TopMoversResponse:
    """Best and worst performing holdings by unrealized P&L %."""
    return AnalyticsService(db).get_top_movers(current_user.id, limit)


@router.get("/metrics", response_model=PortfolioMetrics)
def get_metrics(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> PortfolioMetrics:
    """Portfolio-wide summary statistics for the Analytics dashboard."""
    return AnalyticsService(db).get_portfolio_metrics(current_user.id)
