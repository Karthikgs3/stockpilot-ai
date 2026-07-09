"use client";

import { ArrowUpRight, PieChart, Plus, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  // Simulates the initial data fetch that Phase 4 (Portfolio API) will replace.
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppShell
      title="Dashboard"
      description={`Welcome back, ${user?.full_name?.split(" ")[0] ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Portfolio value"
          value="$0.00"
          icon={Wallet}
          isLoading={isLoading}
        />
        <StatCard
          label="Today's gain/loss"
          value="$0.00"
          changePercent="0.00%"
          trend="neutral"
          icon={ArrowUpRight}
          isLoading={isLoading}
        />
        <StatCard
          label="Overall P&L"
          value="$0.00"
          changePercent="0.00%"
          trend="neutral"
          icon={PieChart}
          isLoading={isLoading}
        />
        <StatCard
          label="Holdings"
          value="0"
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
            ) : (
              <EmptyState
                icon={PieChart}
                title="No performance data yet"
                description="Add your first holding to start tracking portfolio performance over time."
                actionLabel="Add holding"
                onAction={() => {}}
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
            ) : (
              <EmptyState
                icon={Plus}
                title="No holdings yet"
                description="Track your first stock to see it here."
                actionLabel="Add holding"
                onAction={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
