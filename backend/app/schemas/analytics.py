from datetime import date
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel


class PerformancePeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class PerformancePoint(BaseModel):
    period_end: date
    invested_value: Decimal
    market_value: Decimal | None
    """
    market_value is only populated for the most recent point (today), since
    this schema has no historical price table. Earlier points reflect
    cumulative invested capital from the transaction ledger only.
    """


class PerformanceHistoryResponse(BaseModel):
    period: PerformancePeriod
    points: list[PerformancePoint]


class AllocationItem(BaseModel):
    symbol: str
    company_name: str
    value: Decimal
    percent: Decimal


class AssetAllocationResponse(BaseModel):
    items: list[AllocationItem]
    total_value: Decimal


class SectorAllocationItem(BaseModel):
    sector: str
    value: Decimal
    percent: Decimal


class SectorAllocationResponse(BaseModel):
    items: list[SectorAllocationItem]
    total_value: Decimal


class TopMoverItem(BaseModel):
    symbol: str
    company_name: str
    current_price: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_percent: Decimal


class TopMoversResponse(BaseModel):
    gainers: list[TopMoverItem]
    losers: list[TopMoverItem]


class PortfolioMetrics(BaseModel):
    total_invested_value: Decimal
    total_market_value: Decimal
    total_unrealized_pnl: Decimal
    total_unrealized_pnl_percent: Decimal
    holdings_count: int
    sectors_count: int
    best_performer: TopMoverItem | None
    worst_performer: TopMoverItem | None
