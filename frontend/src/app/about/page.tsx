"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AppInfoCard } from "@/features/about/app-info-card";
import { CreditsFooter } from "@/features/about/credits-footer";
import { DescriptionCard } from "@/features/about/description-card";
import { LinksCard } from "@/features/about/links-card";
import { RoadmapCard } from "@/features/about/roadmap-card";

export default function AboutPage() {
  return (
    <AppShell title="About" description="Application information, roadmap, and credits">
      <div className="mx-auto max-w-3xl space-y-6">
        <AppInfoCard />
        <DescriptionCard />
        <LinksCard />
        <RoadmapCard />
        <CreditsFooter />
      </div>
    </AppShell>
  );
}
