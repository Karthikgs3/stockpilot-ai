"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationPieChart } from "@/features/analytics/allocation-pie-chart";
import { PerformanceChart } from "@/features/analytics/performance-chart";
import { PortfolioStatistics } from "@/features/analytics/portfolio-statistics";
import { SectorAllocationChart } from "@/features/analytics/sector-allocation-chart";
import { TopMoversCards } from "@/features/analytics/top-movers-cards";

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics" description="Performance, allocation, and portfolio statistics">
      <PortfolioStatistics />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Portfolio performance</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationPieChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <SectorAllocationChart />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <TopMoversCards />
      </div>
    </AppShell>
  );
}
