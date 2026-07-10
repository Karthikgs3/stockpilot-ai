"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/analytics-api";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TopMoverItem } from "@/types/analytics";

function MoverRow({ item, isGain }: { item: TopMoverItem; isGain: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{item.symbol}</p>
        <p className="text-xs text-muted-foreground">{item.company_name}</p>
      </div>
      <div className="text-right">
        <p className={`num text-sm font-medium ${isGain ? "text-success" : "text-loss"}`}>
          {formatPercent(item.unrealized_pnl_percent)}
        </p>
        <p className="num text-xs text-muted-foreground">{formatCurrency(item.current_price)}</p>
      </div>
    </div>
  );
}

export function TopMoversCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "top-movers"],
    queryFn: () => analyticsApi.getTopMovers(5),
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-success" />
            Top gainers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.gainers.length ? (
            <EmptyState icon={TrendingUp} title="No gainers yet" description="Nothing is up right now." />
          ) : (
            <div className="divide-y divide-border/60">
              {data.gainers.map((g) => (
                <MoverRow key={g.symbol} item={g} isGain />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-loss" />
            Top losers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.losers.length ? (
            <EmptyState icon={TrendingDown} title="No losers yet" description="Nothing is down right now." />
          ) : (
            <div className="divide-y divide-border/60">
              {data.losers.map((l) => (
                <MoverRow key={l.symbol} item={l} isGain={false} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
