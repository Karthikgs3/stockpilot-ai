import uuid

from app.api.deps import get_current_user
from app.core.exceptions import (WatchlistItemAlreadyExistsError,
                                 WatchlistItemNotFoundError)
from app.db.session import get_db
from app.models.user import User
from app.schemas.watchlist import (PriceAlertCreate, PriceAlertResponse,
                                   WatchlistItemCreate, WatchlistItemResponse,
                                   WatchlistItemWithQuote)
from app.services.watchlist_service import WatchlistService
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", response_model=list[WatchlistItemWithQuote])
def list_watchlist(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[WatchlistItemWithQuote]:
    """All watchlist symbols enriched with a live quote and active-alert flag."""
    return WatchlistService(db).list_with_quotes(current_user.id)


@router.post("", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    payload: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WatchlistItemResponse:
    try:
        return WatchlistService(db).add_symbol(current_user.id, payload)
    except WatchlistItemAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        WatchlistService(db).remove_symbol(current_user.id, item_id)
    except WatchlistItemNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get("/alerts", response_model=list[PriceAlertResponse])
def list_alerts(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[PriceAlertResponse]:
    return WatchlistService(db).list_alerts(current_user.id)


@router.post("/alerts", response_model=PriceAlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: PriceAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PriceAlertResponse:
    try:
        return WatchlistService(db).create_alert(current_user.id, payload)
    except WatchlistItemNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.delete("/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        WatchlistService(db).delete_alert(current_user.id, alert_id)
    except WatchlistItemNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
