"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, Layers, TrendingDown, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { analyticsApi } from "@/lib/analytics-api";
import { formatCurrency, formatPercent } from "@/lib/format";

export function PortfolioStatistics() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "metrics"],
    queryFn: analyticsApi.getMetrics,
  });

  const pnlTrend = data
    ? parseFloat(data.total_unrealized_pnl) > 0
      ? "up"
      : parseFloat(data.total_unrealized_pnl) < 0
        ? "down"
        : "neutral"
    : "neutral";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Invested capital"
        value={data ? formatCurrency(data.total_invested_value) : "$0.00"}
        icon={Wallet}
        isLoading={isLoading}
      />
      <StatCard
        label="Unrealized P&L"
        value={data ? formatCurrency(data.total_unrealized_pnl) : "$0.00"}
        changePercent={data ? formatPercent(data.total_unrealized_pnl_percent) : undefined}
        trend={pnlTrend}
        icon={TrendingDown}
        isLoading={isLoading}
      />
      <StatCard
        label="Best performer"
        value={data?.best_performer ? data.best_performer.symbol : "—"}
        changePercent={
          data?.best_performer ? formatPercent(data.best_performer.unrealized_pnl_percent) : undefined
        }
        trend="up"
        icon={Award}
        isLoading={isLoading}
      />
      <StatCard
        label="Sectors held"
        value={data ? String(data.sectors_count) : "0"}
        icon={Layers}
        isLoading={isLoading}
      />
    </div>
  );
}
