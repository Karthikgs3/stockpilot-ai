import json
import logging
from collections.abc import Iterator

import httpx

from app.core.config import settings
from app.services.llm.base import LLMProvider, LLMProviderError

logger = logging.getLogger(__name__)


class OpenRouterProvider(LLMProvider):
    """
    LLMProvider backed by OpenRouter's OpenAI-compatible /chat/completions
    endpoint. Model is never hardcoded here — always read from
    settings.OPENROUTER_MODEL, which itself comes from the environment.
    """

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.model = settings.OPENROUTER_MODEL

    def stream_chat(self, messages: list[dict], system_prompt: str) -> Iterator[str]:
        if not self.api_key:
            raise LLMProviderError("The AI Assistant is not configured (missing OPENROUTER_API_KEY).")
        if not self.model:
            raise LLMProviderError("The AI Assistant is not configured (missing OPENROUTER_MODEL).")

        payload = {
            "model": self.model,
            "messages": [{"role": "system", "content": system_prompt}, *messages],
            "stream": True,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=60.0,
            ) as response:
                if response.status_code == 401:
                    raise LLMProviderError(
                        "AI Assistant authentication failed. Check the OpenRouter API key."
                    )
                if response.status_code == 429:
                    raise LLMProviderError(
                        "The AI Assistant is rate-limited right now. Please try again shortly.",
                        is_retryable=True,
                    )
                if response.status_code >= 500:
                    raise LLMProviderError(
                        "The AI model is temporarily unavailable. Please try again.",
                        is_retryable=True,
                    )
                response.raise_for_status()

                for line in response.iter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data = line[len("data: ") :]
                    if data.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk["choices"][0]["delta"].get("content")
                        if delta:
                            yield delta
                    except (KeyError, IndexError, json.JSONDecodeError):
                        continue

        except httpx.TimeoutException:
            raise LLMProviderError("The AI Assistant timed out. Please try again.", is_retryable=True)
        except httpx.ConnectError:
            raise LLMProviderError(
                "Could not reach the AI Assistant service. Please check your connection.",
                is_retryable=True,
            )
        except httpx.HTTPError as e:
            logger.error("OpenRouter request failed: %s", e)
            raise LLMProviderError(
                "The AI Assistant encountered an unexpected error.", is_retryable=True
            )
