// 


"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing || isLoading) return;

    if (!user) {
      router.replace("/login");
    }
  }, [user, isLoading, isInitializing, router]);

  if (isInitializing || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}