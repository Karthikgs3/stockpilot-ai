from datetime import datetime

from pydantic import BaseModel


class NewsArticle(BaseModel):
    """
    Normalized shape returned by every news endpoint, regardless of which
    Alpha Vantage query (tickers/topics) produced it — the frontend never
    needs to know which endpoint a given article came from.
    """

    title: str
    url: str
    source: str
    summary: str
    thumbnail_url: str | None
    published_at: datetime
    related_symbols: list[str]


class NewsResponse(BaseModel):
    articles: list[NewsArticle]
    is_degraded: bool = False
    """True if the upstream news API failed and this is an empty fallback —
    lets the frontend show a retry state instead of a silent empty feed."""
