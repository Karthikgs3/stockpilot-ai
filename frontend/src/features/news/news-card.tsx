import { ExternalLink } from "lucide-react";

import { formatRelativeTime } from "@/features/news/format-time";
import { NewsArticle } from "@/types/news";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:flex-row"
    >
      {article.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.thumbnail_url}
          alt=""
          className="h-40 w-full shrink-0 object-cover sm:h-auto sm:w-48"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-40 w-full shrink-0 items-center justify-center bg-muted text-xs text-muted-foreground sm:h-auto sm:w-48">
          No image
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{article.source}</span>
          <span>·</span>
          <span>{formatRelativeTime(article.published_at)}</span>
        </div>

        <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-1.5">
            {article.related_symbols.slice(0, 3).map((symbol) => (
              <span
                key={symbol}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {symbol}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
            Read original
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
