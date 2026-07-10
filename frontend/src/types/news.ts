export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  summary: string;
  thumbnail_url: string | null;
  published_at: string;
  related_symbols: string[];
}

export interface NewsResponse {
  articles: NewsArticle[];
  is_degraded: boolean;
}

export type NewsCategory =
  | "markets"
  | "earnings"
  | "technology"
  | "economy"
  | "mergers"
  | "ipo"
  | "energy";
