import uuid
from collections.abc import Iterator

from sqlalchemy.orm import Session

from app.schemas.assistant import ChatMessage
from app.services.ai_context_service import AIContextService
from app.services.llm import get_llm_provider

# Only the most recent messages are sent to the model — prevents unbounded
# context growth on long conversations.
MAX_HISTORY_MESSAGES = 20

SYSTEM_PROMPT_TEMPLATE = """You are the AI Investment Assistant inside StockPilot AI, a portfolio tracking and research application.

Your role is to help the user understand their own portfolio, holdings, watchlist, analytics, and relevant market news, using ONLY the data provided below.

STRICT RULES — follow these at all times:
- Never fabricate data. If something is not present in the context below, clearly say it is not available rather than guessing.
- Never give financial, investment, or trading advice.
- Never say phrases like "you should buy", "you should sell", "I recommend", or "this is a good investment".
- Instead, use neutral, descriptive framing such as "Based on your portfolio...", "The available market data suggests...", or "The current news indicates...".
- If the user asks about a stock they do not hold or track, say that data is not available in their account rather than guessing at figures.
- Keep answers concise and well-structured, using markdown (bullet points, bold, headers) where it improves clarity.

USER'S CURRENT DATA:
{context}
"""


class AIService:
    """
    Orchestrates a chat turn: build user context, assemble the system
    prompt, trim conversation history, and delegate token generation to
    an LLMProvider. Holds no knowledge of which provider is in use.
    """

    def __init__(self, db: Session):
        self.context_service = AIContextService(db)
        self.provider = get_llm_provider()

    def stream_reply(
        self, user_id: uuid.UUID, message: str, history: list[ChatMessage]
    ) -> Iterator[str]:
        context = self.context_service.build_context(user_id)
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            context=context or "No portfolio, watchlist, or market data available yet."
        )

        trimmed_history = history[-MAX_HISTORY_MESSAGES:]
        messages = [{"role": m.role, "content": m.content} for m in trimmed_history]
        messages.append({"role": "user", "content": message})

        yield from self.provider.stream_chat(messages, system_prompt)
