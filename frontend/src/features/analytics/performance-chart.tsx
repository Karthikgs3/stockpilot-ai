"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/analytics-api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PerformancePeriod } from "@/types/analytics";
import { LineChart as LineChartIcon } from "lucide-react";

const PERIODS: { label: string; value: PerformancePeriod }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

export function PerformanceChart() {
  const [period, setPeriod] = useState<PerformancePeriod>("monthly");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "performance", period],
    queryFn: () => analyticsApi.getPerformance(period),
  });

  const chartData = (data?.points ?? []).map((p) => ({
    date: p.period_end,
    invested: parseFloat(p.invested_value),
    market: p.market_value ? parseFloat(p.market_value) : undefined,
  }));

  const hasData = chartData.some((d) => d.invested > 0 || d.market !== undefined);

  return (
    <div>
      <div className="mb-4 flex items-center gap-1 rounded-md bg-muted p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              period === p.value
                ? "bg-card text-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !hasData ? (
        <EmptyState
          icon={LineChartIcon}
          title="No performance data yet"
          description="Record a transaction to start tracking invested capital over time."
        />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "invested" ? "Invested capital" : "Market value",
              ]}
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#investedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
