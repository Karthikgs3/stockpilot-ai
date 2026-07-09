"use client";

import { ArrowRight, LineChart, PieChart, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const FEATURES = [
  {
    icon: PieChart,
    title: "Portfolio intelligence",
    description: "Real allocation, sector risk, and P&L — calculated from your actual transaction history, not estimates.",
  },
  {
    icon: LineChart,
    title: "Live market data",
    description: "Prices, fundamentals, and historical charts for every holding and watchlist symbol.",
  },
  {
    icon: Sparkles,
    title: "AI explanations",
    description: "Ask why your portfolio moved, or what a quarterly result means — in plain language, never a buy/sell call.",
  },
];

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight text-foreground">StockPilot AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          AI-powered portfolio research
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Understand your portfolio,
          <br />
          not just track it.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Live positions, sector risk, and AI-generated explanations of what&apos;s
          happening in your portfolio and the market — without a single
          buy/sell recommendation.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "group")}>
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        StockPilot AI does not provide financial advice or guaranteed predictions.
      </footer>
    </main>
  );
}
