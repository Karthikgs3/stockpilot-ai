import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ABOUT_ROWS = [
  { label: "App version", value: "v1.4" },
  { label: "Build", value: "v1.4-news" },
  { label: "Developer", value: "StockPilot AI Team" },
];

const LINKS = [
  { label: "GitHub Repository", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export function AboutSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {ABOUT_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-primary hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          StockPilot AI does not provide financial advice or guaranteed predictions.
        </p>
      </CardContent>
    </Card>
  );
}
