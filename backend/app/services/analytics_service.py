import uuid
from collections import OrderedDict
from datetime import date, timedelta
from decimal import Decimal

from app.models.transaction import TransactionType
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.analytics import (AllocationItem, AssetAllocationResponse,
                                   PerformanceHistoryResponse,
                                   PerformancePeriod, PerformancePoint,
                                   PortfolioMetrics, SectorAllocationItem,
                                   SectorAllocationResponse, TopMoverItem,
                                   TopMoversResponse)
from app.services.portfolio_service import PortfolioService
from sqlalchemy.orm import Session

# How many trailing buckets to return per period, and how a bucket key is derived.
_PERIOD_CONFIG = {
    PerformancePeriod.DAILY: {"buckets": 30, "delta": timedelta(days=1)},
    PerformancePeriod.WEEKLY: {"buckets": 12, "delta": timedelta(weeks=1)},
    PerformancePeriod.MONTHLY: {"buckets": 12, "delta": timedelta(days=30)},
    PerformancePeriod.YEARLY: {"buckets": 5, "delta": timedelta(days=365)},
}


class AnalyticsService:
    """
    Read-only aggregation layer over Portfolio data. Deliberately holds no
    persistence logic of its own — every figure is derived from
    PortfolioService (holdings + live quotes) or TransactionRepository
    (the ledger), both already used by the Portfolio feature.
    """

    def __init__(self, db: Session):
        self.db = db
        self.portfolio_service = PortfolioService(db)
        self.transaction_repo = TransactionRepository(db)

    def get_performance_history(
        self, user_id: uuid.UUID, period: PerformancePeriod
    ) -> PerformanceHistoryResponse:
        config = _PERIOD_CONFIG[period]
        bucket_count: int = config["buckets"]
        delta: timedelta = config["delta"]

        # Reuses TransactionRepository.list_for_user unmodified — just called
        # with a high limit and reversed to chronological order.
        transactions = list(reversed(self.transaction_repo.list_for_user(user_id, limit=10_000)))

        today = date.today()
        bucket_starts = [today - delta * i for i in range(bucket_count - 1, -1, -1)]

        invested_by_bucket: "OrderedDict[date, Decimal]" = OrderedDict(
            (b, Decimal("0")) for b in bucket_starts
        )

        running_invested = Decimal("0")
        txn_idx = 0
        for bucket_end in bucket_starts:
            while txn_idx < len(transactions) and transactions[txn_idx].executed_at.date() <= bucket_end:
                txn = transactions[txn_idx]
                cost = txn.quantity * txn.price_per_share + txn.fees
                if txn.transaction_type == TransactionType.BUY:
                    running_invested += cost
                else:
                    running_invested -= cost
                txn_idx += 1
            invested_by_bucket[bucket_end] = running_invested

        current_market_value = sum(
            (h.market_value for h in self.portfolio_service.list_holdings_with_metrics(user_id)),
            Decimal("0"),
        )

        points = []
        for i, (bucket_end, invested) in enumerate(invested_by_bucket.items()):
            is_latest = i == len(invested_by_bucket) - 1
            points.append(
                PerformancePoint(
                    period_end=bucket_end,
                    invested_value=invested,
                    market_value=current_market_value if is_latest else None,
                )
            )

        return PerformanceHistoryResponse(period=period, points=points)

    def get_asset_allocation(self, user_id: uuid.UUID) -> AssetAllocationResponse:
        holdings = self.portfolio_service.list_holdings_with_metrics(user_id)
        total = sum((h.market_value for h in holdings), Decimal("0"))

        items = [
            AllocationItem(
                symbol=h.symbol,
                company_name=h.company_name,
                value=h.market_value,
                percent=(h.market_value / total * 100) if total > 0 else Decimal("0"),
            )
            for h in holdings
        ]
        items.sort(key=lambda i: i.value, reverse=True)
        return AssetAllocationResponse(items=items, total_value=total)

    def get_sector_allocation(self, user_id: uuid.UUID) -> SectorAllocationResponse:
        summary = self.portfolio_service.get_portfolio_summary(user_id)
        total = summary.total_market_value

        items = [
            SectorAllocationItem(
                sector=sector,
                value=value,
                percent=(value / total * 100) if total > 0 else Decimal("0"),
            )
            for sector, value in summary.sector_allocation.items()
        ]
        items.sort(key=lambda i: i.value, reverse=True)
        return SectorAllocationResponse(items=items, total_value=total)

    def get_top_movers(self, user_id: uuid.UUID, limit: int = 5) -> TopMoversResponse:
        holdings = self.portfolio_service.list_holdings_with_metrics(user_id)
        movers = [
            TopMoverItem(
                symbol=h.symbol,
                company_name=h.company_name,
                current_price=h.current_price,
                unrealized_pnl=h.unrealized_pnl,
                unrealized_pnl_percent=h.unrealized_pnl_percent,
            )
            for h in holdings
        ]
        ranked = sorted(movers, key=lambda m: m.unrealized_pnl_percent, reverse=True)
        gainers = [m for m in ranked if m.unrealized_pnl_percent > 0][:limit]
        losers = [m for m in ranked if m.unrealized_pnl_percent < 0][-limit:][::-1]
        return TopMoversResponse(gainers=gainers, losers=losers)

    def get_portfolio_metrics(self, user_id: uuid.UUID) -> PortfolioMetrics:
        holdings = self.portfolio_service.list_holdings_with_metrics(user_id)
        summary = self.portfolio_service.get_portfolio_summary(user_id)

        best = worst = None
        if holdings:
            ranked = sorted(holdings, key=lambda h: h.unrealized_pnl_percent, reverse=True)
            best_h, worst_h = ranked[0], ranked[-1]
            best = TopMoverItem(
                symbol=best_h.symbol,
                company_name=best_h.company_name,
                current_price=best_h.current_price,
                unrealized_pnl=best_h.unrealized_pnl,
                unrealized_pnl_percent=best_h.unrealized_pnl_percent,
            )
            worst = TopMoverItem(
                symbol=worst_h.symbol,
                company_name=worst_h.company_name,
                current_price=worst_h.current_price,
                unrealized_pnl=worst_h.unrealized_pnl,
                unrealized_pnl_percent=worst_h.unrealized_pnl_percent,
            )

        sectors_count = len(summary.sector_allocation)

        return PortfolioMetrics(
            total_invested_value=summary.total_invested_value,
            total_market_value=summary.total_market_value,
            total_unrealized_pnl=summary.total_unrealized_pnl,
            total_unrealized_pnl_percent=summary.total_unrealized_pnl_percent,
            holdings_count=summary.holdings_count,
            sectors_count=sectors_count,
            best_performer=best,
            worst_performer=worst,
        )
