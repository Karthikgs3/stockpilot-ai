from app.services.llm.base import LLMProvider
from app.services.llm.openrouter_provider import OpenRouterProvider


def get_llm_provider() -> LLMProvider:
    """
    Provider-agnostic factory. Only OpenRouter is implemented today.
    Adding a new provider later (Gemini, Anthropic, OpenAI) means writing
    one new class implementing LLMProvider and branching on it here —
    AIService and everything above it stays unchanged.
    """
    return OpenRouterProvider()
