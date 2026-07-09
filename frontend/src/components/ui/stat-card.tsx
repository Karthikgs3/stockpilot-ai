import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  changeValue?: string;
  changePercent?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  changeValue,
  changePercent,
  trend = "neutral",
  icon: Icon,
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-subtle">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-32" />
        <Skeleton className="mt-3 h-4 w-20" />
      </div>
    );
  }

  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-loss" : "text-muted-foreground";

  return (
    <div className="group rounded-lg border border-border bg-card p-5 shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <p className="num mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>

      {(changeValue || changePercent) && (
        <div className={cn("mt-2 flex items-center gap-1 text-sm font-medium", trendColor)}>
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
          <span className="num">
            {changeValue} {changePercent && `(${changePercent})`}
          </span>
        </div>
      )}
    </div>
  );
}
