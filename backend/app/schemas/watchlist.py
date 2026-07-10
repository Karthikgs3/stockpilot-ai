import uuid
from datetime import datetime
from decimal import Decimal

from app.models.price_alert import AlertCondition
from pydantic import BaseModel, Field, field_validator


class WatchlistItemCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    company_name: str = Field(min_length=1, max_length=255)

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, v: str) -> str:
        return v.strip().upper()


class WatchlistItemResponse(BaseModel):
    id: uuid.UUID
    symbol: str
    company_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WatchlistItemWithQuote(WatchlistItemResponse):
    """Watchlist item enriched with a live quote for the UI table."""

    current_price: Decimal | None
    has_active_alert: bool


class PriceAlertCreate(BaseModel):
    watchlist_item_id: uuid.UUID
    condition: AlertCondition
    target_price: Decimal = Field(gt=0)


class PriceAlertResponse(BaseModel):
    id: uuid.UUID
    watchlist_item_id: uuid.UUID
    symbol: str
    condition: AlertCondition
    target_price: Decimal
    is_active: bool
    triggered_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
