import uuid
from datetime import datetime
from decimal import Decimal

from app.models.transaction import TransactionType
from pydantic import BaseModel, Field, field_validator


class TransactionCreate(BaseModel):
    """
    Input for recording a buy/sell. This is the only way holdings change —
    the holding's quantity/avg price are recalculated from the transaction
    ledger, never edited directly, so history stays auditable.
    """

    symbol: str = Field(min_length=1, max_length=20)
    company_name: str = Field(min_length=1, max_length=255)
    sector: str | None = Field(default=None, max_length=100)
    transaction_type: TransactionType
    quantity: Decimal = Field(gt=0)
    price_per_share: Decimal = Field(gt=0)
    fees: Decimal = Field(default=Decimal("0"), ge=0)
    executed_at: datetime

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, v: str) -> str:
        return v.strip().upper()


class TransactionResponse(BaseModel):
    id: uuid.UUID
    holding_id: uuid.UUID
    symbol: str
    transaction_type: TransactionType
    quantity: Decimal
    price_per_share: Decimal
    fees: Decimal
    executed_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class HoldingResponse(BaseModel):
    id: uuid.UUID
    symbol: str
    company_name: str
    sector: str | None
    quantity: Decimal
    average_buy_price: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HoldingWithMetrics(HoldingResponse):
    """Holding enriched with live-price-derived figures for the UI."""

    current_price: Decimal
    market_value: Decimal
    invested_value: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_percent: Decimal


class PortfolioSummary(BaseModel):
    total_market_value: Decimal
    total_invested_value: Decimal
    total_unrealized_pnl: Decimal
    total_unrealized_pnl_percent: Decimal
    today_change_value: Decimal
    today_change_percent: Decimal
    holdings_count: int
    sector_allocation: dict[str, Decimal]


class HoldingUpdateRequest(BaseModel):
    """Allows correcting descriptive fields only — quantity/price are ledger-derived."""

    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    sector: str | None = Field(default=None, max_length=100)
