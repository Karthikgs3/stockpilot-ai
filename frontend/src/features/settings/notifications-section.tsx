"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "notification_preferences";

interface NotificationPrefs {
  priceAlerts: boolean;
  newsNotifications: boolean;
  portfolioSummary: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  priceAlerts: true,
  newsNotifications: true,
  portfolioSummary: false,
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

const ROWS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  {
    key: "priceAlerts",
    label: "Price alerts",
    description: "Notify me when a watchlist price alert triggers.",
  },
  {
    key: "newsNotifications",
    label: "News notifications",
    description: "Notify me about breaking news for my holdings.",
  },
  {
    key: "portfolioSummary",
    label: "Portfolio summary",
    description: "Send a daily summary of portfolio performance.",
  },
];

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/60">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.description}</p>
            </div>
            <Switch
              checked={prefs[row.key]}
              onCheckedChange={() => toggle(row.key)}
              aria-label={row.label}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
