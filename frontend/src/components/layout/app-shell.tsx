"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/shared/protected-route";

interface AppShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} description={description} />
          <main className="flex-1 px-6 py-8">
            <div className="mx-auto max-w-6xl animate-in">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
