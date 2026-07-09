import { apiClient } from "@/lib/api-client";
import { LoginPayload, SignupPayload, Token, User } from "@/types/user";

export const authApi = {
  signup: async (payload: SignupPayload): Promise<Token> => {
    const { data } = await apiClient.post<Token>("/auth/signup", payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<Token> => {
    const { data } = await apiClient.post<Token>("/auth/login", payload);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },

  refresh: async (refresh_token: string): Promise<Token> => {
    const { data } = await apiClient.post<Token>("/auth/refresh", { refresh_token });
    return data;
  },
};
