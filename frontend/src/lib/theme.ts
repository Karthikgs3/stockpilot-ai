export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme_preference";

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function resolveSystemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Applies the theme to <html class="dark"> without touching storage. */
export function applyTheme(preference: ThemePreference): void {
  if (typeof document === "undefined") return;
  const isDark = preference === "dark" || (preference === "system" && resolveSystemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

/** Persists the preference and applies it immediately. */
export function setTheme(preference: ThemePreference): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
  applyTheme(preference);
}

/** Call once on mount (e.g. in the app shell/topbar) to sync the DOM to storage. */
export function initTheme(): ThemePreference {
  const preference = getStoredTheme();
  applyTheme(preference);
  return preference;
}
