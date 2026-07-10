import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

export interface UpdatePreferencesPayload {
  theme?: "light" | "dark" | "system";
  currency?: "USD" | "INR" | "EUR" | "GBP";
}

export const settingsApi = {
  updatePreferences: async (payload: UpdatePreferencesPayload): Promise<User> => {
    const { data } = await apiClient.patch<User>("/settings/preferences", payload);
    return data;
  },
};
