import uuid

from app.core.exceptions import (WatchlistItemAlreadyExistsError,
                                 WatchlistItemNotFoundError)
from app.models.price_alert import PriceAlert
from app.models.watchlist import WatchlistItem
from app.repositories.price_alert_repository import PriceAlertRepository
from app.repositories.watchlist_repository import WatchlistRepository
from app.schemas.watchlist import (PriceAlertCreate, WatchlistItemCreate,
                                   WatchlistItemWithQuote)
from app.services.market_data_service import MarketDataService
from sqlalchemy.orm import Session


class WatchlistService:
    def __init__(self, db: Session, market_data: MarketDataService | None = None):
        self.db = db
        self.watchlist_repo = WatchlistRepository(db)
        self.alert_repo = PriceAlertRepository(db)
        self.market_data = market_data or MarketDataService()

    def add_symbol(self, user_id: uuid.UUID, payload: WatchlistItemCreate) -> WatchlistItem:
        existing = self.watchlist_repo.get_by_symbol(user_id, payload.symbol)
        if existing is not None:
            raise WatchlistItemAlreadyExistsError(payload.symbol)

        item = WatchlistItem(
            user_id=user_id,
            symbol=payload.symbol,
            company_name=payload.company_name,
        )
        return self.watchlist_repo.create(item)

    def remove_symbol(self, user_id: uuid.UUID, item_id: uuid.UUID) -> None:
        item = self.watchlist_repo.get_for_user(user_id, item_id)
        if item is None:
            raise WatchlistItemNotFoundError()
        self.watchlist_repo.delete(item)

    def list_with_quotes(self, user_id: uuid.UUID) -> list[WatchlistItemWithQuote]:
        items = self.watchlist_repo.list_for_user(user_id)
        if not items:
            return []

        quotes = self.market_data.get_quotes([i.symbol for i in items])

        enriched = []
        for item in items:
            active_alerts = self.alert_repo.list_active_for_watchlist_item(item.id)
            enriched.append(
                WatchlistItemWithQuote(
                    id=item.id,
                    symbol=item.symbol,
                    company_name=item.company_name,
                    created_at=item.created_at,
                    current_price=quotes.get(item.symbol),
                    has_active_alert=len(active_alerts) > 0,
                )
            )
        return enriched

    def create_alert(self, user_id: uuid.UUID, payload: PriceAlertCreate) -> PriceAlert:
        item = self.watchlist_repo.get_for_user(user_id, payload.watchlist_item_id)
        if item is None:
            raise WatchlistItemNotFoundError()

        alert = PriceAlert(
            user_id=user_id,
            watchlist_item_id=item.id,
            symbol=item.symbol,
            condition=payload.condition,
            target_price=payload.target_price,
        )
        return self.alert_repo.create(alert)

    def list_alerts(self, user_id: uuid.UUID) -> list[PriceAlert]:
        return self.alert_repo.list_for_user(user_id)

    def delete_alert(self, user_id: uuid.UUID, alert_id: uuid.UUID) -> None:
        alert = self.alert_repo.get_for_user(user_id, alert_id)
        if alert is None:
            raise WatchlistItemNotFoundError()
        self.alert_repo.delete(alert)
