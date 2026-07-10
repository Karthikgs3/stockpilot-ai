import uuid

from app.models.watchlist import WatchlistItem
from app.repositories.base_repository import BaseRepository
from sqlalchemy import select
from sqlalchemy.orm import Session


class WatchlistRepository(BaseRepository[WatchlistItem]):
    def __init__(self, db: Session):
        super().__init__(WatchlistItem, db)

    def list_for_user(self, user_id: uuid.UUID) -> list[WatchlistItem]:
        stmt = (
            select(WatchlistItem)
            .where(WatchlistItem.user_id == user_id)
            .order_by(WatchlistItem.symbol)
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_for_user(self, user_id: uuid.UUID, item_id: uuid.UUID) -> WatchlistItem | None:
        stmt = select(WatchlistItem).where(
            WatchlistItem.user_id == user_id, WatchlistItem.id == item_id
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_symbol(self, user_id: uuid.UUID, symbol: str) -> WatchlistItem | None:
        stmt = select(WatchlistItem).where(
            WatchlistItem.user_id == user_id, WatchlistItem.symbol == symbol
        )
        return self.db.execute(stmt).scalar_one_or_none()
