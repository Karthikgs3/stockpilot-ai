import { ExternalLink, FileText, Github, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_INFO } from "@/lib/app-info";

export function LinksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Useful links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <a href={APP_INFO.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            <Github className="h-4 w-4" />
            GitHub Repository
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>

        <Link href="/privacy-policy" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            <ShieldCheck className="h-4 w-4" />
            Privacy Policy
          </Button>
        </Link>

        <Link href="/terms" className="flex-1">
          <Button variant="outline" className="w-full justify-center">
            <FileText className="h-4 w-4" />
            Terms of Service
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
