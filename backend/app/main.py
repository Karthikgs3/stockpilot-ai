import logging

from app.api.v1 import analytics, auth, health, portfolio, watchlist
from app.core.config import settings
from app.core.logging import configure_logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

configure_logging(debug=settings.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered investment research and portfolio intelligence platform.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(portfolio.router, prefix=settings.API_V1_PREFIX)
app.include_router(watchlist.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("%s starting up in %s mode", settings.APP_NAME, settings.ENVIRONMENT)


@app.get("/")
def root() -> dict:
    return {"message": f"{settings.APP_NAME} API is running", "docs": "/docs"}
