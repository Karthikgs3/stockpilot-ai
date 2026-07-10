import { apiClient } from "@/lib/api-client";
import {
  AssetAllocationResponse,
  PerformanceHistoryResponse,
  PerformancePeriod,
  PortfolioMetrics,
  SectorAllocationResponse,
  TopMoversResponse,
} from "@/types/analytics";

export const analyticsApi = {
  getPerformance: async (period: PerformancePeriod): Promise<PerformanceHistoryResponse> => {
    const { data } = await apiClient.get<PerformanceHistoryResponse>("/analytics/performance", {
      params: { period },
    });
    return data;
  },

  getAllocation: async (): Promise<AssetAllocationResponse> => {
    const { data } = await apiClient.get<AssetAllocationResponse>("/analytics/allocation");
    return data;
  },

  getSectorAllocation: async (): Promise<SectorAllocationResponse> => {
    const { data } = await apiClient.get<SectorAllocationResponse>("/analytics/sector-allocation");
    return data;
  },

  getTopMovers: async (limit = 5): Promise<TopMoversResponse> => {
    const { data } = await apiClient.get<TopMoversResponse>("/analytics/top-movers", {
      params: { limit },
    });
    return data;
  },

  getMetrics: async (): Promise<PortfolioMetrics> => {
    const { data } = await apiClient.get<PortfolioMetrics>("/analytics/metrics");
    return data;
  },
};
