"""
Import every model here so Alembic's autogenerate (which inspects
Base.metadata) can discover all tables from a single import of this package.
"""
from app.models.user import User
from app.models.holding import Holding
from app.models.transaction import Transaction, TransactionType
from app.models.watchlist import WatchlistItem
from app.models.price_alert import PriceAlert, AlertCondition

__all__ = [
    "User",
    "Holding",
    "Transaction",
    "TransactionType",
    "WatchlistItem",
    "PriceAlert",
    "AlertCondition",
]
