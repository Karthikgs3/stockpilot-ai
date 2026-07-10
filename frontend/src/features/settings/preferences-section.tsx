"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { settingsApi } from "@/lib/settings-api";
import { User } from "@/types/user";

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
];

const TIMEZONE_STORAGE_KEY = "preferred_timezone";

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

// A practical subset covering major markets/timezones, not the full IANA list.
const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function PreferencesSection({ user }: { user: User | null }) {
  const queryClient = useQueryClient();
  const [timezone, setTimezone] = useState<string>("UTC");
  const [apiError, setApiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    setTimezone(stored || detectTimezone());
  }, []);

  const currencyMutation = useMutation({
    mutationFn: (currency: string) =>
      settingsApi.updatePreferences({ currency: currency as "USD" | "INR" | "EUR" | "GBP" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => setApiError(getApiErrorMessage(err, "Could not save currency preference.")),
  });

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiError && <Alert variant="error">{apiError}</Alert>}
        {saved && <Alert variant="success">Currency preference saved.</Alert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Select
              id="currency"
              value={user?.currency ?? "USD"}
              onChange={(e) => {
                setApiError(null);
                currencyMutation.mutate(e.target.value);
              }}
              disabled={currencyMutation.isPending}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
            >
              {!COMMON_TIMEZONES.includes(timezone) && (
                <option value={timezone}>{timezone} (detected)</option>
              )}
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
