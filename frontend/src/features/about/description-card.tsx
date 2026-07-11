import { BarChart3, Bot, Newspaper, PieChart, Wallet } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  { icon: Wallet, label: "Portfolio Tracking" },
  { icon: PieChart, label: "Watchlist Management" },
  { icon: BarChart3, label: "Portfolio Analytics" },
  { icon: Newspaper, label: "Market News" },
  { icon: Bot, label: "AI-powered Investment Assistant (Coming Soon)" },
];

export function DescriptionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About StockPilot AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          StockPilot AI is a portfolio intelligence platform that helps investors
          track holdings, understand performance, and stay informed — combining
          live market data, analytics, and AI-generated explanations in a single,
          modern interface.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3 py-2">
              <f.icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-foreground">{f.label}</span>
            </div>
          ))}
        </div>

        <Alert variant="error">
          This application is intended for educational, research, and portfolio
          management purposes only. It does not provide financial, investment,
          or trading advice.
        </Alert>
      </CardContent>
    </Card>
  );
}
