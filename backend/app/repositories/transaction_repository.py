import uuid

from app.models.transaction import Transaction
from app.repositories.base_repository import BaseRepository
from sqlalchemy import select
from sqlalchemy.orm import Session


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: Session):
        super().__init__(Transaction, db)

    def list_for_holding(self, holding_id: uuid.UUID) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.holding_id == holding_id)
            .order_by(Transaction.executed_at)
        )
        return list(self.db.execute(stmt).scalars().all())

    def list_for_user(self, user_id: uuid.UUID, limit: int = 50) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.executed_at.desc())
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
