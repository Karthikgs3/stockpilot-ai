import logging
from decimal import Decimal

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class MarketDataService:
    """
    Thin client around Alpha Vantage's GLOBAL_QUOTE endpoint.
    Alpha Vantage's free tier is rate-limited (5 req/min, 25/day), so callers
    should batch/cache aggressively rather than calling this per-holding on
    every request. On any failure this returns None rather than raising,
    so portfolio math can fall back to the last known price instead of
    breaking the whole page.
    """

    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = settings.ALPHA_VANTAGE_BASE_URL

    def get_quote(self, symbol: str) -> Decimal | None:
        if not self.api_key:
            logger.warning("ALPHA_VANTAGE_API_KEY not configured; skipping live quote for %s", symbol)
            return None

        try:
            response = httpx.get(
                self.base_url,
                params={
                    "function": "GLOBAL_QUOTE",
                    "symbol": symbol,
                    "apikey": self.api_key,
                },
                timeout=5.0,
            )
            response.raise_for_status()
            data = response.json()
            price = data.get("Global Quote", {}).get("05. price")
            if price is None:
                logger.warning("No quote returned for %s: %s", symbol, data)
                return None
            return Decimal(str(price))
        except (httpx.HTTPError, ValueError, KeyError) as e:
            logger.error("Failed to fetch quote for %s: %s", symbol, e)
            return None

    def get_quotes(self, symbols: list[str]) -> dict[str, Decimal | None]:
        """Sequential by design — Alpha Vantage's free tier has no batch endpoint."""
        return {symbol: self.get_quote(symbol) for symbol in symbols}
