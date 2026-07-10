import uuid

from app.models.holding import Holding
from app.repositories.base_repository import BaseRepository
from sqlalchemy import select
from sqlalchemy.orm import Session


class HoldingRepository(BaseRepository[Holding]):
    def __init__(self, db: Session):
        super().__init__(Holding, db)

    def list_for_user(self, user_id: uuid.UUID) -> list[Holding]:
        stmt = select(Holding).where(Holding.user_id == user_id).order_by(Holding.symbol)
        return list(self.db.execute(stmt).scalars().all())

    def get_for_user(self, user_id: uuid.UUID, holding_id: uuid.UUID) -> Holding | None:
        stmt = select(Holding).where(Holding.user_id == user_id, Holding.id == holding_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_symbol(self, user_id: uuid.UUID, symbol: str) -> Holding | None:
        stmt = select(Holding).where(Holding.user_id == user_id, Holding.symbol == symbol)
        return self.db.execute(stmt).scalar_one_or_none()
