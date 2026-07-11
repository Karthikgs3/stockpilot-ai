import logging
import uuid

from sqlalchemy.orm import Session

from app.services.analytics_service import AnalyticsService
from app.services.news_service import NewsService
from app.services.portfolio_service import PortfolioService
from app.services.watchlist_service import WatchlistService

logger = logging.getLogger(__name__)


class AIContextService:
    """
    Assembles a human-readable, plain-text snapshot of the user's
    portfolio, holdings, watchlist, analytics, and recent news for the
    AI Assistant's system prompt. Every section is built from
    already-computed service output (Decimal/Pydantic values formatted
    to strings) — raw ORM models are never touched here.

    Each section is independently fault-tolerant: if one data source
    fails (e.g. news API down), that section is omitted rather than
    breaking context assembly for the rest.
    """

    def __init__(self, db: Session):
        self.portfolio_service = PortfolioService(db)
        self.watchlist_service = WatchlistService(db)
        self.analytics_service = AnalyticsService(db)
        self.news_service = NewsService()

    def build_context(self, user_id: uuid.UUID) -> str:
        sections = [
            self._portfolio_section(user_id),
            self._holdings_section(user_id),
            self._watchlist_section(user_id),
            self._analytics_section(user_id),
            self._news_section(),
        ]
        return "\n\n".join(s for s in sections if s)

    def _portfolio_section(self, user_id: uuid.UUID) -> str:
        try:
            summary = self.portfolio_service.get_portfolio_summary(user_id)
        except Exception:
            logger.exception("Failed to build portfolio context section")
            return "Portfolio: data unavailable."

        if summary.holdings_count == 0:
            return "Portfolio: The user has no holdings yet."

        lines = [
            "Portfolio summary:",
            f"- Total market value: ${summary.total_market_value:.2f}",
            f"- Total invested: ${summary.total_invested_value:.2f}",
            f"- Unrealized P&L: ${summary.total_unrealized_pnl:.2f} "
            f"({summary.total_unrealized_pnl_percent:.2f}%)",
            f"- Number of holdings: {summary.holdings_count}",
        ]
        if summary.sector_allocation:
            sectors = ", ".join(f"{s} (${v:.2f})" for s, v in summary.sector_allocation.items())
            lines.append(f"- Sector allocation: {sectors}")
        return "\n".join(lines)

    def _holdings_section(self, user_id: uuid.UUID) -> str:
        try:
            holdings = self.portfolio_service.list_holdings_with_metrics(user_id)
        except Exception:
            logger.exception("Failed to build holdings context section")
            return ""

        if not holdings:
            return ""

        lines = ["Current holdings:"]
        for h in holdings[:25]:
            lines.append(
                f"- {h.symbol} ({h.company_name}): {h.quantity} shares @ avg "
                f"${h.average_buy_price:.2f}, current ${h.current_price:.2f}, "
                f"P&L {h.unrealized_pnl_percent:.2f}%"
            )
        return "\n".join(lines)

    def _watchlist_section(self, user_id: uuid.UUID) -> str:
        try:
            items = self.watchlist_service.list_with_quotes(user_id)
        except Exception:
            logger.exception("Failed to build watchlist context section")
            return ""

        if not items:
            return "Watchlist: empty."

        lines = ["Watchlist:"]
        for i in items[:25]:
            price = f"${i.current_price:.2f}" if i.current_price else "price unavailable"
            lines.append(f"- {i.symbol} ({i.company_name}): {price}")
        return "\n".join(lines)

    def _analytics_section(self, user_id: uuid.UUID) -> str:
        try:
            movers = self.analytics_service.get_top_movers(user_id, limit=3)
        except Exception:
            logger.exception("Failed to build analytics context section")
            return ""

        lines = []
        if movers.gainers:
            lines.append(
                "Top gainers: "
                + ", ".join(f"{m.symbol} ({m.unrealized_pnl_percent:.2f}%)" for m in movers.gainers)
            )
        if movers.losers:
            lines.append(
                "Top losers: "
                + ", ".join(f"{m.symbol} ({m.unrealized_pnl_percent:.2f}%)" for m in movers.losers)
            )
        return "\n".join(lines)

    def _news_section(self) -> str:
        try:
            news = self.news_service.get_market_news(limit=5)
        except Exception:
            logger.exception("Failed to build news context section")
            return ""

        if not news.articles:
            return ""

        lines = ["Recent market news:"]
        for a in news.articles[:5]:
            lines.append(f'- "{a.title}" ({a.source})')
        return "\n".join(lines)
