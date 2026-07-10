import uuid
from decimal import Decimal

from app.core.exceptions import AppError
from app.models.holding import Holding
from app.models.transaction import Transaction, TransactionType
from app.repositories.holding_repository import HoldingRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.portfolio import (HoldingUpdateRequest, HoldingWithMetrics,
                                   PortfolioSummary, TransactionCreate)
from app.services.market_data_service import MarketDataService
from sqlalchemy.orm import Session


class InsufficientSharesError(AppError):
    def __init__(self, symbol: str, available: Decimal, requested: Decimal):
        super().__init__(
            f"Cannot sell {requested} shares of {symbol}: only {available} available."
        )


class HoldingNotFoundError(AppError):
    def __init__(self):
        super().__init__("Holding not found.")


class PortfolioService:
    def __init__(self, db: Session, market_data: MarketDataService | None = None):
        self.db = db
        self.holding_repo = HoldingRepository(db)
        self.transaction_repo = TransactionRepository(db)
        self.market_data = market_data or MarketDataService()

    def record_transaction(self, user_id: uuid.UUID, payload: TransactionCreate) -> Holding:
        """
        Records a buy/sell and recalculates the corresponding holding.
        This is the ONLY path that mutates holdings — quantity and average
        buy price are always derived from the full transaction history,
        so the numbers stay internally consistent no matter what order
        transactions are entered in.
        """
        holding = self.holding_repo.get_by_symbol(user_id, payload.symbol)

        if holding is None:
            if payload.transaction_type == TransactionType.SELL:
                raise InsufficientSharesError(payload.symbol, Decimal("0"), payload.quantity)
            holding = Holding(
                user_id=user_id,
                symbol=payload.symbol,
                company_name=payload.company_name,
                sector=payload.sector,
                quantity=Decimal("0"),
                average_buy_price=Decimal("0"),
            )
            self.db.add(holding)
            self.db.flush()  # assigns holding.id without committing yet

        transaction = Transaction(
            user_id=user_id,
            holding_id=holding.id,
            symbol=payload.symbol,
            transaction_type=payload.transaction_type,
            quantity=payload.quantity,
            price_per_share=payload.price_per_share,
            fees=payload.fees,
            executed_at=payload.executed_at,
        )
        self.db.add(transaction)
        self.db.flush()

        self._recalculate_holding(holding)

        if holding.quantity == 0:
            self.db.delete(holding)
            self.db.commit()
            return holding

        self.db.commit()
        self.db.refresh(holding)
        return holding

    def _recalculate_holding(self, holding: Holding) -> None:
        """
        Replays every transaction for this holding in chronological order
        using weighted-average cost basis — the standard approach brokers
        use for average buy price.
        """
        transactions = self.transaction_repo.list_for_holding(holding.id)

        quantity = Decimal("0")
        total_cost = Decimal("0")

        for txn in transactions:
            if txn.transaction_type == TransactionType.BUY:
                total_cost += txn.quantity * txn.price_per_share
                quantity += txn.quantity
            else:  # SELL
                if txn.quantity > quantity:
                    raise InsufficientSharesError(holding.symbol, quantity, txn.quantity)
                # Reduce cost basis proportionally so avg buy price is unchanged by a sell
                avg_price = total_cost / quantity if quantity > 0 else Decimal("0")
                total_cost -= avg_price * txn.quantity
                quantity -= txn.quantity

        holding.quantity = quantity
        holding.average_buy_price = (total_cost / quantity) if quantity > 0 else Decimal("0")

    def list_holdings_with_metrics(self, user_id: uuid.UUID) -> list[HoldingWithMetrics]:
        holdings = self.holding_repo.list_for_user(user_id)
        if not holdings:
            return []

        quotes = self.market_data.get_quotes([h.symbol for h in holdings])

        enriched = []
        for h in holdings:
            current_price = quotes.get(h.symbol) or h.average_buy_price
            market_value = current_price * h.quantity
            invested_value = h.average_buy_price * h.quantity
            unrealized_pnl = market_value - invested_value
            unrealized_pnl_percent = (
                (unrealized_pnl / invested_value * 100) if invested_value > 0 else Decimal("0")
            )
            enriched.append(
                HoldingWithMetrics(
                    id=h.id,
                    symbol=h.symbol,
                    company_name=h.company_name,
                    sector=h.sector,
                    quantity=h.quantity,
                    average_buy_price=h.average_buy_price,
                    created_at=h.created_at,
                    updated_at=h.updated_at,
                    current_price=current_price,
                    market_value=market_value,
                    invested_value=invested_value,
                    unrealized_pnl=unrealized_pnl,
                    unrealized_pnl_percent=unrealized_pnl_percent,
                )
            )
        return enriched

    def get_portfolio_summary(self, user_id: uuid.UUID) -> PortfolioSummary:
        holdings = self.list_holdings_with_metrics(user_id)

        total_market_value = sum((h.market_value for h in holdings), Decimal("0"))
        total_invested_value = sum((h.invested_value for h in holdings), Decimal("0"))
        total_unrealized_pnl = total_market_value - total_invested_value
        total_unrealized_pnl_percent = (
            (total_unrealized_pnl / total_invested_value * 100)
            if total_invested_value > 0
            else Decimal("0")
        )

        sector_allocation: dict[str, Decimal] = {}
        for h in holdings:
            sector = h.sector or "Uncategorized"
            sector_allocation[sector] = sector_allocation.get(sector, Decimal("0")) + h.market_value

        return PortfolioSummary(
            total_market_value=total_market_value,
            total_invested_value=total_invested_value,
            total_unrealized_pnl=total_unrealized_pnl,
            total_unrealized_pnl_percent=total_unrealized_pnl_percent,
            # Today's change requires an intraday-open reference price, which
            # Alpha Vantage's free GLOBAL_QUOTE endpoint does provide via
            # "08. previous close" — wired up when the frontend needs it live.
            today_change_value=Decimal("0"),
            today_change_percent=Decimal("0"),
            holdings_count=len(holdings),
            sector_allocation=sector_allocation,
        )

    def update_holding(
        self, user_id: uuid.UUID, holding_id: uuid.UUID, payload: HoldingUpdateRequest
    ) -> Holding:
        holding = self.holding_repo.get_for_user(user_id, holding_id)
        if holding is None:
            raise HoldingNotFoundError()

        if payload.company_name is not None:
            holding.company_name = payload.company_name
        if payload.sector is not None:
            holding.sector = payload.sector

        return self.holding_repo.update(holding)

    def delete_holding(self, user_id: uuid.UUID, holding_id: uuid.UUID) -> None:
        """Deletes the holding and its full transaction history (cascade)."""
        holding = self.holding_repo.get_for_user(user_id, holding_id)
        if holding is None:
            raise HoldingNotFoundError()
        self.holding_repo.delete(holding)
