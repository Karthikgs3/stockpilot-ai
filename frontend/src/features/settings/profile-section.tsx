import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfileSection({ user }: { user: User | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Full name
            </p>
            <p className="mt-1 text-sm text-foreground">{user?.full_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            <p className="mt-1 text-sm text-foreground">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Account created
            </p>
            <p className="mt-1 text-sm text-foreground">
              {user?.created_at ? formatDate(user.created_at) : "—"}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" disabled title="Coming soon">
          Edit profile
        </Button>
      </CardContent>
    </Card>
  );
}
