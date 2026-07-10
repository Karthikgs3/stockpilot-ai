import { cn } from "@/lib/utils";
import { NewsCategory } from "@/types/news";

const CATEGORIES: { label: string; value: NewsCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Markets", value: "markets" },
  { label: "Earnings", value: "earnings" },
  { label: "Technology", value: "technology" },
  { label: "Economy", value: "economy" },
  { label: "M&A", value: "mergers" },
  { label: "IPO", value: "ipo" },
  { label: "Energy", value: "energy" },
];

interface CategoryFilterProps {
  selected: NewsCategory | "all";
  onSelect: (value: NewsCategory | "all") => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => onSelect(c.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            selected === c.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
