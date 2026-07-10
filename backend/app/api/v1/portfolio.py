import uuid

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.models.user import User
from app.schemas.portfolio import (HoldingResponse, HoldingUpdateRequest,
                                   HoldingWithMetrics, PortfolioSummary,
                                   TransactionCreate)
from app.services.portfolio_service import (HoldingNotFoundError,
                                            PortfolioService)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
def get_summary(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> PortfolioSummary:
    """Aggregate portfolio value, P&L, and sector allocation for the dashboard."""
    return PortfolioService(db).get_portfolio_summary(current_user.id)


@router.get("/holdings", response_model=list[HoldingWithMetrics])
def list_holdings(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[HoldingWithMetrics]:
    """All holdings enriched with live price, market value, and unrealized P&L."""
    return PortfolioService(db).list_holdings_with_metrics(current_user.id)


@router.post("/transactions", response_model=HoldingResponse, status_code=status.HTTP_201_CREATED)
def record_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HoldingResponse:
    """
    Record a buy or sell. Returns the resulting holding (recalculated from
    the full transaction ledger). A SELL that fully closes a position
    removes the holding — the transaction record itself is preserved.
    """
    try:
        return PortfolioService(db).record_transaction(current_user.id, payload)
    except AppError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.patch("/holdings/{holding_id}", response_model=HoldingResponse)
def update_holding(
    holding_id: uuid.UUID,
    payload: HoldingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HoldingResponse:
    """Update descriptive fields only (company name, sector) — not quantity/price."""
    try:
        return PortfolioService(db).update_holding(current_user.id, holding_id, payload)
    except HoldingNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holding(
    holding_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Deletes a holding and its full transaction history."""
    try:
        PortfolioService(db).delete_holding(current_user.id, holding_id)
    except HoldingNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
