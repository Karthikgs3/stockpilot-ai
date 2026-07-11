import { apiClient } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";
import { ChatMessage } from "@/types/assistant";

interface StreamCallbacks {
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/**
 * Streams a chat reply via Server-Sent Events. Uses fetch + ReadableStream
 * rather than EventSource because EventSource can't send a POST body or a
 * custom Authorization header. The backend API key/base URL are never
 * touched here — this only calls our own backend, which proxies OpenRouter.
 */
export async function streamChat(
  message: string,
  history: ChatMessage[],
  { onDelta, onDone, onError }: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const token = tokenStorage.getAccessToken();
  const baseURL = apiClient.defaults.baseURL;

  try {
    const response = await fetch(`${baseURL}/assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      onError("Could not reach the AI Assistant. Please try again.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.trim();
        if (!line.startsWith("data: ")) continue;

        try {
          const parsed = JSON.parse(line.slice("data: ".length));
          if (parsed.type === "delta") onDelta(parsed.content);
          else if (parsed.type === "done") onDone();
          else if (parsed.type === "error") onError(parsed.message);
        } catch {
          // Ignore a malformed/partial chunk; the stream continues.
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    onError("Network error while contacting the AI Assistant.");
  }
}
