import { apiClient } from "@/lib/api-client";
import {
  HoldingUpdatePayload,
  HoldingWithMetrics,
  PortfolioSummary,
  TransactionCreatePayload,
} from "@/types/portfolio";

export const portfolioApi = {
  getSummary: async (): Promise<PortfolioSummary> => {
    const { data } = await apiClient.get<PortfolioSummary>("/portfolio/summary");
    return data;
  },

  listHoldings: async (): Promise<HoldingWithMetrics[]> => {
    const { data } = await apiClient.get<HoldingWithMetrics[]>("/portfolio/holdings");
    return data;
  },

  recordTransaction: async (payload: TransactionCreatePayload) => {
    const { data } = await apiClient.post("/portfolio/transactions", payload);
    return data;
  },

  updateHolding: async (holdingId: string, payload: HoldingUpdatePayload) => {
    const { data } = await apiClient.patch(`/portfolio/holdings/${holdingId}`, payload);
    return data;
  },

  deleteHolding: async (holdingId: string): Promise<void> => {
    await apiClient.delete(`/portfolio/holdings/${holdingId}`);
  },
};
