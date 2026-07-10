"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/analytics-api";
import { formatCurrency } from "@/lib/format";

const COLORS = [
  "hsl(217 91% 55%)",
  "hsl(152 60% 40%)",
  "hsl(38 92% 50%)",
  "hsl(0 72% 51%)",
  "hsl(262 60% 55%)",
  "hsl(199 70% 50%)",
];

export function AllocationPieChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "allocation"],
    queryFn: analyticsApi.getAllocation,
  });

  const items = data?.items ?? [];

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PieChartIcon}
        title="No allocation yet"
        description="Add holdings to see how your portfolio is split by symbol."
      />
    );
  }

  const chartData = items.map((i) => ({ name: i.symbol, value: parseFloat(i.value) }));

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width="50%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 space-y-2">
        {items.slice(0, 6).map((item, i) => (
          <div key={item.symbol} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="font-medium text-foreground">{item.symbol}</span>
            </div>
            <span className="num text-muted-foreground">{parseFloat(item.percent).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
