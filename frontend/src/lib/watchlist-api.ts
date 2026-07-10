import { apiClient } from "@/lib/api-client";
import {
    PriceAlert,
    PriceAlertCreatePayload,
    WatchlistItemCreatePayload,
    WatchlistItemWithQuote,
} from "@/types/watchlist";

export const watchlistApi = {
  list: async (): Promise<WatchlistItemWithQuote[]> => {
    const { data } = await apiClient.get<WatchlistItemWithQuote[]>("/watchlist");
    return data;
  },

  add: async (payload: WatchlistItemCreatePayload) => {
    const { data } = await apiClient.post("/watchlist", payload);
    return data;
  },

  remove: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/watchlist/${itemId}`);
  },

  listAlerts: async (): Promise<PriceAlert[]> => {
    const { data } = await apiClient.get<PriceAlert[]>("/watchlist/alerts");
    return data;
  },

  createAlert: async (payload: PriceAlertCreatePayload) => {
    const { data } = await apiClient.post("/watchlist/alerts", payload);
    return data;
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    await apiClient.delete(`/watchlist/alerts/${alertId}`);
  },
};
