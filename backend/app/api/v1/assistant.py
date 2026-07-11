import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.assistant import ChatRequest
from app.services.ai_service import AIService
from app.services.llm.base import LLMProviderError

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


@router.post("/chat")
def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """
    Streams the assistant's reply as Server-Sent Events:
    {"type": "delta", "content": "..."} repeated, then either
    {"type": "done"} on success or {"type": "error", "message": "..."}
    on any provider failure (invalid key, rate limit, network, model
    unavailable) — the stream always ends cleanly, never a raw crash.
    """
    service = AIService(db)

    def event_stream():
        try:
            for chunk in service.stream_reply(current_user.id, payload.message, payload.history):
                yield _sse({"type": "delta", "content": chunk})
            yield _sse({"type": "done"})
        except LLMProviderError as e:
            yield _sse({"type": "error", "message": e.message})

    return StreamingResponse(event_stream(), media_type="text/event-stream")
