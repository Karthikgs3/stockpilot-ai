from app.api.deps import get_current_user
from app.core.exceptions import UserNotFoundError
from app.db.session import get_db
from app.models.user import User
from app.schemas.settings import UserPreferencesUpdate
from app.schemas.user import UserResponse
from app.services.settings_service import SettingsService
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.patch("/preferences", response_model=UserResponse)
def update_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Persist theme/currency preferences to the existing User columns."""
    try:
        return SettingsService(db).update_preferences(current_user.id, payload)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
