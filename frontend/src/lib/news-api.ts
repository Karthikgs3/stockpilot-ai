import { apiClient } from "@/lib/api-client";
import { NewsCategory, NewsResponse } from "@/types/news";

export const newsApi = {
  getMarketNews: async (category?: NewsCategory, limit = 20): Promise<NewsResponse> => {
    const { data } = await apiClient.get<NewsResponse>("/news/market", {
      params: { category, limit },
    });
    return data;
  },

  getCompanyNews: async (symbol: string, limit = 20): Promise<NewsResponse> => {
    const { data } = await apiClient.get<NewsResponse>(`/news/company/${symbol}`, {
      params: { limit },
    });
    return data;
  },

  search: async (query: string, limit = 20): Promise<NewsResponse> => {
    const { data } = await apiClient.get<NewsResponse>("/news/search", {
      params: { q: query, limit },
    });
    return data;
  },
};
