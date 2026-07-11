import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { TechBadge } from "@/features/about/tech-stack-badge";
import { APP_INFO } from "@/lib/app-info";

const INFO_ROWS = [
  { label: "Version", value: APP_INFO.version },
  { label: "Build", value: APP_INFO.build },
  { label: "Developer", value: APP_INFO.developer },
];

const TECH_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "FastAPI",
  "PostgreSQL",
  "SQLAlchemy",
  "React Query",
  "Finnhub API",
  "Alpha Vantage API",
];

export function AppInfoCard() {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{APP_INFO.name}</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered investment research and portfolio intelligence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-3">
          {INFO_ROWS.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Technology stack
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {TECH_STACK.map((tech) => (
              <TechBadge key={tech} label={tech} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
