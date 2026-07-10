"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent, formatQuantity } from "@/lib/format";
import { portfolioApi } from "@/lib/portfolio-api";
import { cn } from "@/lib/utils";
import { HoldingWithMetrics } from "@/types/portfolio";

interface HoldingsTableProps {
  holdings: HoldingWithMetrics[];
  isLoading: boolean;
}

export function HoldingsTable({ holdings, isLoading }: HoldingsTableProps) {
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (holdingId: string) => portfolioApi.deleteHolding(holdingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "summary"] });
    },
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
            <th className="py-2.5 pr-4">Qty</th>
            <th className="py-2.5 pr-4">Avg cost</th>
            <th className="py-2.5 pr-4">Price</th>
            <th className="py-2.5 pr-4">Market value</th>
            <th className="py-2.5 pr-4">P&amp;L</th>
            <th className="py-2.5" />
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const pnl = parseFloat(h.unrealized_pnl);
            const isGain = pnl >= 0;
            return (
              <tr
                key={h.id}
                className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="py-3 pr-4">
                  <p className="font-medium text-foreground">{h.symbol}</p>
                  <p className="text-xs text-muted-foreground">{h.company_name}</p>
                </td>
                <td className="num py-3 pr-4 text-foreground">{formatQuantity(h.quantity)}</td>
                <td className="num py-3 pr-4 text-foreground">
                  {formatCurrency(h.average_buy_price)}
                </td>
                <td className="num py-3 pr-4 text-foreground">{formatCurrency(h.current_price)}</td>
                <td className="num py-3 pr-4 font-medium text-foreground">
                  {formatCurrency(h.market_value)}
                </td>
                <td className="num py-3 pr-4">
                  <span className={cn("font-medium", isGain ? "text-success" : "text-loss")}>
                    {formatCurrency(h.unrealized_pnl)}
                  </span>
                  <span className={cn("ml-1.5 text-xs", isGain ? "text-success" : "text-loss")}>
                    ({formatPercent(h.unrealized_pnl_percent)})
                  </span>
                </td>
                <td className="relative py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === h.id ? null : h.id)}
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                    aria-label="Holding actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenuId === h.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 top-9 z-50 w-40 animate-in rounded-lg border border-border bg-card p-1 shadow-popover">
                        <button
                          onClick={() => {
                            deleteMutation.mutate(h.id);
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
