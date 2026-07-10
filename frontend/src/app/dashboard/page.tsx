"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, PieChart, Plus, Wallet } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatPercent } from "@/lib/format";
import { portfolioApi } from "@/lib/portfolio-api";

export default function DashboardPage() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: portfolioApi.getSummary,
  });

  const holdingsQuery = useQuery({
    queryKey: ["portfolio", "holdings"],
    queryFn: portfolioApi.listHoldings,
  });

  const isLoading = summaryQuery.isLoading || holdingsQuery.isLoading;
  const summary = summaryQuery.data;
  const holdings = holdingsQuery.data ?? [];
  const hasHoldings = holdings.length > 0;

  const pnlTrend = summary
    ? parseFloat(summary.total_unrealized_pnl) > 0
      ? "up"
      : parseFloat(summary.total_unrealized_pnl) < 0
        ? "down"
        : "neutral"
    : "neutral";

  return (
    <AppShell
      title="Dashboard"
      description={`Welcome back, ${user?.full_name?.split(" ")[0] ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Portfolio value"
          value={summary ? formatCurrency(summary.total_market_value) : "$0.00"}
          icon={Wallet}
          isLoading={isLoading}
        />
        <StatCard
          label="Today's gain/loss"
          value={summary ? formatCurrency(summary.today_change_value) : "$0.00"}
          changePercent={summary ? formatPercent(summary.today_change_percent) : "0.00%"}
          trend="neutral"
          icon={ArrowUpRight}
          isLoading={isLoading}
        />
        <StatCard
          label="Overall P&L"
          value={summary ? formatCurrency(summary.total_unrealized_pnl) : "$0.00"}
          changePercent={summary ? formatPercent(summary.total_unrealized_pnl_percent) : "0.00%"}
          trend={pnlTrend}
          icon={PieChart}
          isLoading={isLoading}
        />
        <StatCard
          label="Holdings"
          value={summary ? String(summary.holdings_count) : "0"}
          icon={Wallet}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-muted" />
            ) : !hasHoldings ? (
              <EmptyState
                icon={PieChart}
                title="No performance data yet"
                description="Add your first holding to start tracking portfolio performance over time."
                actionLabel="Go to Portfolio"
                onAction={() => (window.location.href = "/portfolio")}
              />
            ) : (
              <EmptyState
                icon={PieChart}
                title="See the full chart on Analytics"
                description="Head to Analytics for daily, weekly, monthly, and yearly performance."
                actionLabel="Open Analytics"
                onAction={() => (window.location.href = "/analytics")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : !hasHoldings ? (
              <EmptyState
                icon={Plus}
                title="No holdings yet"
                description="Track your first stock to see it here."
                actionLabel="Add holding"
                onAction={() => (window.location.href = "/portfolio")}
              />
            ) : (
              <div className="divide-y divide-border/60">
                {holdings.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.symbol}</p>
                      <p className="text-xs text-muted-foreground">{h.company_name}</p>
                    </div>
                    <p className="num text-sm font-medium text-foreground">
                      {formatCurrency(h.market_value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
