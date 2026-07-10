import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.price_alert import PriceAlert
from app.repositories.base_repository import BaseRepository


class PriceAlertRepository(BaseRepository[PriceAlert]):
    def __init__(self, db: Session):
        super().__init__(PriceAlert, db)

    def list_for_user(self, user_id: uuid.UUID) -> list[PriceAlert]:
        stmt = select(PriceAlert).where(PriceAlert.user_id == user_id)
        return list(self.db.execute(stmt).scalars().all())

    def list_active_for_watchlist_item(self, watchlist_item_id: uuid.UUID) -> list[PriceAlert]:
        stmt = select(PriceAlert).where(
            PriceAlert.watchlist_item_id == watchlist_item_id,
            PriceAlert.is_active.is_(True),
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_for_user(self, user_id: uuid.UUID, alert_id: uuid.UUID) -> PriceAlert | None:
        stmt = select(PriceAlert).where(PriceAlert.user_id == user_id, PriceAlert.id == alert_id)
        return self.db.execute(stmt).scalar_one_or_none()
