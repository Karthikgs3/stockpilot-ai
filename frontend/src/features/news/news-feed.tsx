"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Newspaper, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFilter } from "@/features/news/category-filter";
import { NewsCard } from "@/features/news/news-card";
import { newsApi } from "@/lib/news-api";
import { NewsCategory } from "@/types/news";

const PAGE_SIZE = 12;

export function NewsFeed() {
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const isSearching = activeQuery.length > 0;

  const query = useQuery({
    queryKey: ["news", isSearching ? "search" : "market", isSearching ? activeQuery : category, limit],
    queryFn: () =>
      isSearching
        ? newsApi.search(activeQuery, limit)
        : newsApi.getMarketNews(category === "all" ? undefined : category, limit),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLimit(PAGE_SIZE);
    setActiveQuery(searchInput.trim());
  };

  const handleCategorySelect = (value: NewsCategory | "all") => {
    setCategory(value);
    setActiveQuery("");
    setSearchInput("");
    setLimit(PAGE_SIZE);
  };

  const articles = query.data?.articles ?? [];
  const isDegraded = query.data?.is_degraded ?? false;
  const hasError = query.isError || (query.isSuccess && isDegraded && articles.length === 0);

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company name or symbol (e.g. AAPL)"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
        {isSearching && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setActiveQuery("");
              setSearchInput("");
              setLimit(PAGE_SIZE);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {!isSearching && <CategoryFilter selected={category} onSelect={handleCategorySelect} />}

      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full sm:h-44" />
          ))}
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-loss/10">
            <AlertTriangle className="h-6 w-6 text-loss" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Couldn&apos;t load news</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The news service may be temporarily unavailable or rate-limited. Please try again.
          </p>
          <Button size="sm" className="mt-5" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={isSearching ? "No results found" : "No news right now"}
          description={
            isSearching
              ? "Try a different company name or ticker symbol."
              : "Check back shortly for the latest market news."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {articles.map((article) => (
              <NewsCard key={article.url} article={article} />
            ))}
          </div>

          {articles.length >= limit && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                isLoading={query.isFetching}
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
