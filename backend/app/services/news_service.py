import logging
import re
from datetime import datetime, timedelta

import httpx
from app.core.config import settings
from app.schemas.news import NewsArticle, NewsResponse

logger = logging.getLogger(__name__)

_TICKER_PATTERN = re.compile(r"^[A-Za-z]{1,5}$")

# Finnhub's /news endpoint only supports a fixed, narrow category enum
# (general, forex, crypto, merger) — nothing close to Alpha Vantage's
# topic list. "mergers" maps natively; everything else is approximated
# by filtering general news for keywords, which is honest but imprecise.
_NATIVE_CATEGORY = {"mergers": "merger"}

_KEYWORD_FALLBACK: dict[str, list[str]] = {
    "earnings": ["earnings", "quarterly", "eps", "guidance"],
    "technology": ["tech", "software", "ai", "chip", "semiconductor", "cloud"],
    "economy": ["fed", "inflation", "gdp", "economy", "interest rate", "jobs report"],
    "ipo": ["ipo", "public offering", "listing"],
    "energy": ["oil", "energy", "gas", "renewable", "solar", "opec"],
}

# How far back to look for company-specific news, since Finnhub's
# company-news endpoint requires an explicit date range (no "latest N").
_COMPANY_NEWS_LOOKBACK_DAYS = 30


class NewsService:
    """
    Failure-tolerant client around Finnhub's News API. Public method
    signatures intentionally match the previous Alpha Vantage-backed
    implementation (get_market_news / get_company_news / search_news),
    so the router and every frontend consumer are unaffected by this swap.
    Every method returns NewsResponse(articles=[], is_degraded=True) on
    any failure rather than raising.
    """

    def __init__(self):
        self.api_key = settings.FINNHUB_API_KEY
        self.base_url = settings.FINNHUB_BASE_URL

    def get_market_news(self, category: str | None = None, limit: int = 20) -> NewsResponse:
        finnhub_category = _NATIVE_CATEGORY.get(category, "general") if category else "general"
        response = self._fetch_general(finnhub_category, limit_hint=limit)

        keywords = _KEYWORD_FALLBACK.get(category) if category else None
        if keywords and response.articles:
            filtered = [
                a
                for a in response.articles
                if any(kw in a.title.lower() or kw in a.summary.lower() for kw in keywords)
            ]
            response = NewsResponse(articles=filtered[:limit], is_degraded=response.is_degraded)
        else:
            response = NewsResponse(articles=response.articles[:limit], is_degraded=response.is_degraded)

        return response

    def get_company_news(self, symbol: str, limit: int = 20) -> NewsResponse:
        return self._fetch_company(symbol.strip().upper(), limit)

    def search_news(self, query: str, limit: int = 20) -> NewsResponse:
        """
        Finnhub has no free-text news search. A ticker-shaped query goes
        straight to company news; anything else is resolved via Finnhub's
        symbol-lookup endpoint, falling back to general market news if no
        confident match is found.
        """
        cleaned = query.strip()

        if _TICKER_PATTERN.match(cleaned):
            return self.get_company_news(cleaned, limit)

        matched_symbol = self._resolve_symbol(cleaned)
        if matched_symbol:
            return self.get_company_news(matched_symbol, limit)

        return self.get_market_news(category=None, limit=limit)

    def _resolve_symbol(self, query: str) -> str | None:
        if not self.api_key:
            return None
        try:
            response = httpx.get(
                f"{self.base_url}/search",
                params={"q": query, "token": self.api_key},
                timeout=6.0,
            )
            response.raise_for_status()
            data = response.json()
            results = data.get("result", [])
            if results:
                return results[0].get("symbol")
        except (httpx.HTTPError, ValueError) as e:
            logger.warning("Finnhub symbol lookup failed for %r: %s", query, e)
        return None

    def _fetch_general(self, finnhub_category: str, limit_hint: int) -> NewsResponse:
        if not self.api_key:
            logger.warning("FINNHUB_API_KEY not configured; returning empty news feed")
            return NewsResponse(articles=[], is_degraded=True)

        try:
            response = httpx.get(
                f"{self.base_url}/news",
                params={"category": finnhub_category, "token": self.api_key},
                timeout=8.0,
            )
            response.raise_for_status()
            raw_articles = response.json()
            if not isinstance(raw_articles, list):
                logger.warning("Unexpected Finnhub /news response shape: %s", type(raw_articles))
                return NewsResponse(articles=[], is_degraded=True)

            articles = self._normalize_many(raw_articles)
            articles.sort(key=lambda a: a.published_at, reverse=True)
            return NewsResponse(articles=articles[: max(limit_hint, 50)], is_degraded=False)

        except (httpx.HTTPError, ValueError) as e:
            logger.error("Finnhub /news request failed: %s", e)
            return NewsResponse(articles=[], is_degraded=True)

    def _fetch_company(self, symbol: str, limit: int) -> NewsResponse:
        if not self.api_key:
            logger.warning("FINNHUB_API_KEY not configured; returning empty news feed")
            return NewsResponse(articles=[], is_degraded=True)

        today = datetime.utcnow().date()
        date_from = today - timedelta(days=_COMPANY_NEWS_LOOKBACK_DAYS)

        try:
            response = httpx.get(
                f"{self.base_url}/company-news",
                params={
                    "symbol": symbol,
                    "from": date_from.isoformat(),
                    "to": today.isoformat(),
                    "token": self.api_key,
                },
                timeout=8.0,
            )
            response.raise_for_status()
            raw_articles = response.json()
            if not isinstance(raw_articles, list):
                logger.warning("Unexpected Finnhub /company-news response shape: %s", type(raw_articles))
                return NewsResponse(articles=[], is_degraded=True)

            articles = self._normalize_many(raw_articles, fallback_symbol=symbol)
            articles.sort(key=lambda a: a.published_at, reverse=True)
            return NewsResponse(articles=articles[:limit], is_degraded=False)

        except (httpx.HTTPError, ValueError) as e:
            logger.error("Finnhub /company-news request failed for %s: %s", symbol, e)
            return NewsResponse(articles=[], is_degraded=True)

    def _normalize_many(self, raw_articles: list[dict], fallback_symbol: str | None = None) -> list[NewsArticle]:
        articles = []
        for item in raw_articles:
            normalized = self._normalize(item, fallback_symbol)
            if normalized is not None:
                articles.append(normalized)
        return articles

    @staticmethod
    def _normalize(item: dict, fallback_symbol: str | None) -> NewsArticle | None:
        try:
            published_at = datetime.fromtimestamp(item["datetime"])

            related_raw = item.get("related") or ""
            related_symbols = [s.strip() for s in related_raw.split(",") if s.strip()]
            if not related_symbols and fallback_symbol:
                related_symbols = [fallback_symbol]

            return NewsArticle(
                title=item["headline"],
                url=item["url"],
                source=item.get("source", "Unknown"),
                summary=item.get("summary", ""),
                thumbnail_url=item.get("image") or None,
                published_at=published_at,
                related_symbols=related_symbols,
            )
        except (KeyError, ValueError, TypeError) as e:
            logger.warning("Skipping malformed Finnhub article: %s", e)
            return None
