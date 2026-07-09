// 


"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { authApi } from "@/lib/auth-api";
import { tokenStorage } from "@/lib/token-storage";
import { LoginPayload, SignupPayload, User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [hasToken, setHasToken] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore auth state from localStorage
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    setHasToken(!!token);
    setIsInitializing(false);
  }, []);

  const {
    data: user,
    isLoading: queryLoading,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = async (payload: LoginPayload) => {
    const token = await authApi.login(payload);

    tokenStorage.setTokens(
      token.access_token,
      token.refresh_token
    );

    setHasToken(true);

    await queryClient.fetchQuery({
      queryKey: ["auth", "me"],
      queryFn: authApi.me,
    });

    router.push("/dashboard");
  };

  const signup = async (payload: SignupPayload) => {
    const token = await authApi.signup(payload);

    tokenStorage.setTokens(
      token.access_token,
      token.refresh_token
    );

    setHasToken(true);

    await queryClient.fetchQuery({
      queryKey: ["auth", "me"],
      queryFn: authApi.me,
    });

    router.push("/dashboard");
  };

  const logout = () => {
    tokenStorage.clear();
    setHasToken(false);
    queryClient.removeQueries({ queryKey: ["auth"] });
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isInitializing || queryLoading,
        isInitializing,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}