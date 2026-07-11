export function TechBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
      {label}
    </div>
  );
}
