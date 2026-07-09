import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import (
    EmailAlreadyExistsError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    UserNotFoundError,
)
from app.core.security import (
    TokenType,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import Token, UserCreate, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def signup(self, payload: UserCreate) -> Token:
        if self.user_repo.email_exists(payload.email):
            raise EmailAlreadyExistsError()

        user = User(
            email=payload.email.lower(),
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name.strip(),
        )
        self.user_repo.create(user)
        return self._issue_tokens(user.id)

    def login(self, payload: UserLogin) -> Token:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InactiveUserError()
        return self._issue_tokens(user.id)

    def refresh(self, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != TokenType.REFRESH.value:
            raise InvalidTokenError()

        user_id = uuid.UUID(payload["sub"])
        user = self.user_repo.get(user_id)
        if not user or not user.is_active:
            raise UserNotFoundError()

        return self._issue_tokens(user.id)

    def _issue_tokens(self, user_id: uuid.UUID) -> Token:
        return Token(
            access_token=create_token(user_id, TokenType.ACCESS),
            refresh_token=create_token(user_id, TokenType.REFRESH),
        )
