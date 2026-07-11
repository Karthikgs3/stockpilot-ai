"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ChatWindow } from "@/features/assistant/chat-window";

export default function AssistantPage() {
  return (
    <AppShell title="AI Assistant" description="Ask questions about your portfolio and the market">
      <ChatWindow />
    </AppShell>
  );
}
