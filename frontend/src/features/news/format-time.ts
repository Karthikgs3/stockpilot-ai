export function formatRelativeTime(isoString: string): string {
  const published = new Date(isoString).getTime();
  const now = Date.now();
  const diffMs = now - published;
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
