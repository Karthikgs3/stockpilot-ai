"use client";

import { AppShell } from "@/components/layout/app-shell";
import { NewsFeed } from "@/features/news/news-feed";

export default function NewsPage() {
  return (
    <AppShell title="News" description="Market news and company-specific coverage">
      <NewsFeed />
    </AppShell>
  );
}
