"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Plus, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { AddTransactionDialog } from "@/features/portfolio/add-transaction-dialog";
import { HoldingsTable } from "@/features/portfolio/holdings-table";
import { SectorAllocationCard } from "@/features/portfolio/sector-allocation-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { portfolioApi } from "@/lib/portfolio-api";

export default function PortfolioPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: portfolioApi.getSummary,
  });

  const holdingsQuery = useQuery({
    queryKey: ["portfolio", "holdings"],
    queryFn: portfolioApi.listHoldings,
  });

  const isLoading = summaryQuery.isLoading || holdingsQuery.isLoading;
  const hasHoldings = (holdingsQuery.data?.length ?? 0) > 0;
  const summary = summaryQuery.data;
  const pnlTrend = summary
    ? parseFloat(summary.total_unrealized_pnl) > 0
      ? "up"
      : parseFloat(summary.total_unrealized_pnl) < 0
        ? "down"
        : "neutral"
    : "neutral";

  return (
    <AppShell title="Portfolio" description="Your holdings, valued at live market prices">
      <div className="flex items-center justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add transaction
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Market value"
          value={summary ? formatCurrency(summary.total_market_value) : "$0.00"}
          icon={Wallet}
          isLoading={isLoading}
        />
        <StatCard
          label="Unrealized P&L"
          value={summary ? formatCurrency(summary.total_unrealized_pnl) : "$0.00"}
          changePercent={summary ? formatPercent(summary.total_unrealized_pnl_percent) : undefined}
          trend={pnlTrend}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          label="Holdings"
          value={summary ? String(summary.holdings_count) : "0"}
          icon={PieChart}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {!isLoading && !hasHoldings ? (
              <EmptyState
                icon={Wallet}
                title="No holdings yet"
                description="Record your first buy to start tracking live P&L."
                actionLabel="Add transaction"
                onAction={() => setDialogOpen(true)}
              />
            ) : (
              <HoldingsTable holdings={holdingsQuery.data ?? []} isLoading={isLoading} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : !hasHoldings || !summary ? (
              <EmptyState
                icon={PieChart}
                title="No allocation yet"
                description="Sector breakdown appears once you have holdings."
              />
            ) : (
              <SectorAllocationCard summary={summary} />
            )}
          </CardContent>
        </Card>
      </div>

      <AddTransactionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </AppShell>
  );
}
