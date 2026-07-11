from abc import ABC, abstractmethod
from collections.abc import Iterator


class LLMProviderError(Exception):
    """
    Raised for any provider-level failure — invalid API key, rate limit,
    network failure, or model unavailable. `is_retryable` lets the caller
    (or eventually the UI) distinguish "try again" from "fix config".
    """

    def __init__(self, message: str, is_retryable: bool = False):
        self.message = message
        self.is_retryable = is_retryable
        super().__init__(message)


class LLMProvider(ABC):
    """
    Minimal interface every LLM backend must implement. AIService depends
    only on this — never on a specific provider's SDK or request format —
    so adding GeminiProvider/AnthropicProvider/OpenAIProvider later means
    implementing this one method, with no changes to AIService or the API
    layer above it.
    """

    @abstractmethod
    def stream_chat(self, messages: list[dict], system_prompt: str) -> Iterator[str]:
        """
        Streams the assistant's reply as text deltas. `messages` is
        [{"role": "user"|"assistant", "content": str}, ...] (already
        trimmed to the recent conversation window). Raises
        LLMProviderError on any failure — never returns partial silent
        failures.
        """
        raise NotImplementedError
