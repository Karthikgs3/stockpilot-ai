import { CheckCircle2, Construction } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COMPLETED = ["Authentication", "Portfolio", "Watchlist", "Analytics", "News", "Settings"];
const COMING_NEXT = ["AI Assistant", "Smart Price Alerts", "AI Portfolio Insights"];

export function RoadmapCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roadmap</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Completed
          </p>
          <div className="space-y-2">
            {COMPLETED.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Coming next
          </p>
          <div className="space-y-2">
            {COMING_NEXT.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Construction className="h-4 w-4 shrink-0 text-warning" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
