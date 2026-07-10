"use client";

import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { getStoredTheme, initTheme, setTheme, ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function Topbar({ title, description }: { title: string; description?: string }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");

  useEffect(() => {
    setThemePreference(initTheme());
  }, []);

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Cycles light -> dark -> system, staying in sync with whatever the
  // Settings page's Appearance section last set via lib/theme.ts.
  const cycleTheme = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const current = getStoredTheme();
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTheme(next);
    setThemePreference(next);
  };

  const ThemeIcon = themePreference === "light" ? Sun : themePreference === "dark" ? Moon : Monitor;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-glass">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={cycleTheme}
          aria-label={`Theme: ${themePreference}. Click to change.`}
          title={`Theme: ${themePreference}`}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ThemeIcon className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className={cn(
                  "absolute right-0 top-11 z-50 w-56 animate-in rounded-lg border border-border bg-card p-1 shadow-popover"
                )}
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-loss transition-colors hover:bg-loss/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
