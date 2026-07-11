"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppearanceSection } from "@/features/settings/appearance-section";
import { NotificationsSection } from "@/features/settings/notifications-section";
import { PreferencesSection } from "@/features/settings/preferences-section";
import { ProfileSection } from "@/features/settings/profile-section";
import { SecuritySection } from "@/features/settings/security-section";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell title="Settings" description="Manage your profile, preferences, and account">
      <div className="mx-auto max-w-3xl space-y-6">
        <ProfileSection user={user} />
        <AppearanceSection />
        <PreferencesSection user={user} />
        <NotificationsSection />
        <SecuritySection />
      </div>
    </AppShell>
  );
}
