import uuid

from app.core.exceptions import UserNotFoundError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.settings import UserPreferencesUpdate
from sqlalchemy.orm import Session


class SettingsService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def update_preferences(self, user_id: uuid.UUID, payload: UserPreferencesUpdate) -> User:
        user = self.user_repo.get(user_id)
        if user is None:
            raise UserNotFoundError()

        if payload.theme is not None:
            user.theme = payload.theme
        if payload.currency is not None:
            user.currency = payload.currency

        return self.user_repo.update(user)
