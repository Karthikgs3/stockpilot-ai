"use client";

import { Bot, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChatInput } from "@/features/assistant/chat-input";
import { ChatMessageBubble } from "@/features/assistant/chat-message";
import { SuggestedPrompts } from "@/features/assistant/suggested-prompts";
import { TypingIndicator } from "@/features/assistant/typing-indicator";
import { streamChat } from "@/lib/assistant-api";
import { ChatMessage } from "@/types/assistant";

// Client-side mirror of the backend's trim window — keeps the payload
// small even before the server defensively trims it again.
const MAX_HISTORY_MESSAGES = 20;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaitingForFirstToken, setIsWaitingForFirstToken] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaitingForFirstToken]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = { id: createId(), role: "user", content: trimmed };
    const historyForRequest = [...messages, userMessage].slice(-MAX_HISTORY_MESSAGES);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setIsWaitingForFirstToken(true);

    const assistantId = createId();
    let hasStartedAssistantMessage = false;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamChat(
      trimmed,
      historyForRequest.slice(0, -1),
      {
        onDelta: (chunk) => {
          setIsWaitingForFirstToken(false);
          if (!hasStartedAssistantMessage) {
            hasStartedAssistantMessage = true;
            setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: chunk }]);
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
            );
          }
        },
        onDone: () => {
          setIsStreaming(false);
          setIsWaitingForFirstToken(false);
        },
        onError: (message) => {
          setIsWaitingForFirstToken(false);
          setIsStreaming(false);
          if (hasStartedAssistantMessage) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content || message, isError: true } : m))
            );
          } else {
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: "assistant", content: message, isError: true },
            ]);
          }
        },
      },
      controller.signal
    );
  };

  const clearChat = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    setIsWaitingForFirstToken(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border border-border bg-card shadow-subtle">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">AI Investment Assistant</span>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 py-8 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                Ask me about your portfolio, holdings, or the market
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Answers are based only on your account data and available market data — never
                financial advice.
              </p>
            </div>
            <div className="w-full max-w-lg">
              <SuggestedPrompts onSelect={send} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
            {isWaitingForFirstToken && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4 text-foreground" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-1">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={scrollRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={() => send(input)} disabled={isStreaming} />
    </div>
  );
}
