"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect the information you provide directly, such as your name and email address at signup, along with portfolio, watchlist, and transaction data you enter into the app.",
  },
  {
    title: "Authentication & Account Data",
    body: "Passwords are hashed and never stored in plain text. Your session is managed via JWT access and refresh tokens stored on your device. We do not share your account credentials with any third party.",
  },
  {
    title: "Local Storage & Cookies",
    body: "Some preferences — such as theme, timezone, and notification settings — are stored locally in your browser's localStorage and never leave your device.",
  },
  {
    title: "Third-Party APIs (Finnhub & Alpha Vantage)",
    body: "Market data and news are retrieved from Finnhub and Alpha Vantage. Only the stock symbols needed to fetch a quote or article are sent to these providers — never your personal account information.",
  },
  {
    title: "Data Security",
    body: "Data in transit is encrypted via HTTPS. Access to your portfolio and account data is restricted to authenticated requests tied to your account only.",
  },
  {
    title: "User Rights",
    body: "You may request access to, correction of, or deletion of your account data at any time by contacting us using the details below.",
  },
  {
    title: "Contact",
    body: "For any privacy-related questions, please reach out via the GitHub repository linked on the About page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <AppShell title="Privacy Policy" description="How StockPilot AI handles your data">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This Privacy Policy explains what information StockPilot AI collects, how it is
              used, and the choices you have. This is a demonstration project and this policy is
              provided for transparency and educational purposes.
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
