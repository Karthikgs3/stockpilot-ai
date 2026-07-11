import { Heart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_INFO } from "@/lib/app-info";

const CREDITS = [
  "Next.js",
  "React",
  "FastAPI",
  "PostgreSQL",
  "Tailwind CSS",
  "Finnhub",
  "Alpha Vantage",
  "Lucide Icons",
];

export function CreditsFooter() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Built using {CREDITS.slice(0, -1).join(", ")}, and {CREDITS[CREDITS.length - 1]}.
          </p>
        </CardContent>
      </Card>

      {/* <p className="flex items-center justify-center gap-1.5 pt-2 text-sm text-muted-foreground">
        Made with <Heart className="h-3.5 w-3.5 fill-loss text-loss" /> by
        <span className="font-medium text-foreground">{APP_INFO.developer}</span>
      </p> */}
    </>
  );
}
