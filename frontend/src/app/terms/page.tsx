"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By creating an account and using StockPilot AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.",
  },
  {
    title: "Intended Use",
    body: "StockPilot AI is intended for educational, research, and personal portfolio management purposes only.",
  },
  {
    title: "No Financial Advice",
    body: "Nothing in this application constitutes financial, investment, tax, or legal advice. All data, analytics, and AI-generated content are provided for informational purposes only.",
  },
  {
    title: "No Investment Recommendations",
    body: "StockPilot AI does not make buy, sell, or hold recommendations of any kind. Any decisions you make based on information in this application are made at your own risk.",
  },
  {
    title: "Limitation of Liability",
    body: "StockPilot AI and its developer are not liable for any financial losses, damages, or decisions made based on the use of this application, including inaccuracies in third-party market data or news.",
  },
  {
    title: "Intellectual Property",
    body: "All original code, design, and content within StockPilot AI remain the property of the developer unless otherwise stated. Third-party data (Finnhub, Alpha Vantage) remains the property of its respective providers.",
  },
  {
    title: "Privacy",
    body: "Your use of StockPilot AI is also governed by our Privacy Policy, which describes how your data is collected and used.",
  },
  {
    title: "Contact",
    body: "Questions about these Terms can be directed via the GitHub repository linked on the About page.",
  },
];

export default function TermsPage() {
  return (
    <AppShell title="Terms of Service" description="The terms governing your use of StockPilot AI">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              These Terms of Service govern your access to and use of StockPilot AI. This is a
              demonstration project provided as-is for educational purposes.
            </p>
          </CardContent>
        </Card>

        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
