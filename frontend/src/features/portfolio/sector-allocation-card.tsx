import { PortfolioSummary } from "@/types/portfolio";
import { formatCurrency } from "@/lib/format";

const BAR_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-warning",
  "bg-loss",
  "bg-muted-foreground",
];

export function SectorAllocationCard({ summary }: { summary: PortfolioSummary }) {
  const entries = Object.entries(summary.sector_allocation).sort(
    (a, b) => parseFloat(b[1]) - parseFloat(a[1])
  );
  const total = parseFloat(summary.total_market_value) || 1;

  return (
    <div className="space-y-4">
      {entries.map(([sector, value], i) => {
        const pct = (parseFloat(value) / total) * 100;
        return (
          <div key={sector}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{sector}</span>
              <span className="num text-muted-foreground">
                {formatCurrency(value)} · {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
