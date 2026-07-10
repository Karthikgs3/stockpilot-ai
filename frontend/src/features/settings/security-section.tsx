"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export function SecuritySection() {
  const { user, logout } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-md bg-muted/60 px-4 py-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">Session active</p>
            <p className="text-xs text-muted-foreground">Logged in as {user?.email ?? "—"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled title="Coming soon">
            Change password
          </Button>
          <Button variant="destructive" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
