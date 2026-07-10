"use client";

import { useQuery } from "@tanstack/react-query";
import { LineChart, Plus } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AddSymbolDialog } from "@/features/watchlist/add-symbol-dialog";
import { PriceAlertDialog } from "@/features/watchlist/price-alert-dialog";
import { WatchlistTable } from "@/features/watchlist/watchlist-table";
import { watchlistApi } from "@/lib/watchlist-api";
import { WatchlistItemWithQuote } from "@/types/watchlist";

export default function WatchlistPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [alertItem, setAlertItem] = useState<WatchlistItemWithQuote | null>(null);

  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistApi.list,
  });

  const items = watchlistQuery.data ?? [];
  const hasItems = items.length > 0;

  return (
    <AppShell title="Watchlist" description="Symbols you're tracking, with live prices and alerts">
      <div className="flex items-center justify-end">
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add symbol
        </Button>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Symbols</CardTitle>
        </CardHeader>
        <CardContent>
          {!watchlistQuery.isLoading && !hasItems ? (
            <EmptyState
              icon={LineChart}
              title="Your watchlist is empty"
              description="Add a symbol to track its price and set alerts."
              actionLabel="Add symbol"
              onAction={() => setAddDialogOpen(true)}
            />
          ) : (
            <WatchlistTable
              items={items}
              isLoading={watchlistQuery.isLoading}
              onCreateAlert={setAlertItem}
            />
          )}
        </CardContent>
      </Card>

      <AddSymbolDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
      <PriceAlertDialog item={alertItem} onClose={() => setAlertItem(null)} />
    </AppShell>
  );
}
