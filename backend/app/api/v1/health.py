from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check() -> dict:
    """Basic liveness check — no dependencies."""
    return {"status": "ok"}


@router.get("/db")
def db_health_check(db: Session = Depends(get_db)) -> dict:
    """Confirms the API can actually reach Postgres."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
