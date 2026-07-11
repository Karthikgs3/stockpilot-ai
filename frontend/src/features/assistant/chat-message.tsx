import { AlertCircle, Bot, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/types/assistant";

export function ChatMessageBubble({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : message.isError ? "bg-loss/10" : "bg-muted"
        )}
      >
        {isUser ? (
          <UserIcon className="h-4 w-4 text-primary-foreground" />
        ) : message.isError ? (
          <AlertCircle className="h-4 w-4 text-loss" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : message.isError
              ? "bg-loss/10 text-loss"
              : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
              ),
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {children}
                </a>
              ),
              code: ({ children, className }) => {
                const isBlock = Boolean(className);
                return isBlock ? (
                  <code className="block overflow-x-auto rounded-md bg-foreground/10 p-3 font-mono text-xs">
                    {children}
                  </code>
                ) : (
                  <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <pre className="mb-2 last:mb-0">{children}</pre>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
