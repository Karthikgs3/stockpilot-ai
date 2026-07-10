"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { watchlistApi } from "@/lib/watchlist-api";
import { WatchlistItemWithQuote } from "@/types/watchlist";

interface WatchlistTableProps {
  items: WatchlistItemWithQuote[];
  isLoading: boolean;
  onCreateAlert: (item: WatchlistItemWithQuote) => void;
}

export function WatchlistTable({ items, isLoading, onCreateAlert }: WatchlistTableProps) {
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => watchlistApi.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="py-2.5 pr-4">Symbol</th>
            <th className="py-2.5 pr-4">Price</th>
            <th className="py-2.5 pr-4">Alert</th>
            <th className="py-2.5" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50"
            >
              <td className="py-3 pr-4">
                <p className="font-medium text-foreground">{item.symbol}</p>
                <p className="text-xs text-muted-foreground">{item.company_name}</p>
              </td>
              <td className="num py-3 pr-4 text-foreground">
                {item.current_price ? formatCurrency(item.current_price) : "—"}
              </td>
              <td className="py-3 pr-4">
                {item.has_active_alert ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Bell className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => onCreateAlert(item)}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    Set alert
                  </button>
                )}
              </td>
              <td className="relative py-3 text-right">
                <button
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label="Watchlist item actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {openMenuId === item.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute right-0 top-9 z-50 w-40 animate-in rounded-lg border border-border bg-card p-1 shadow-popover">
                      <button
                        onClick={() => {
                          onCreateAlert(item);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Bell className="h-4 w-4" />
                        Set alert
                      </button>
                      <button
                        onClick={() => {
                          removeMutation.mutate(item.id);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-loss transition-colors hover:bg-loss/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
