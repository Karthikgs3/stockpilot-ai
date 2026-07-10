export type PerformancePeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface PerformancePoint {
  period_end: string;
  invested_value: string;
  market_value: string | null;
}

export interface PerformanceHistoryResponse {
  period: PerformancePeriod;
  points: PerformancePoint[];
}

export interface AllocationItem {
  symbol: string;
  company_name: string;
  value: string;
  percent: string;
}

export interface AssetAllocationResponse {
  items: AllocationItem[];
  total_value: string;
}

export interface SectorAllocationItem {
  sector: string;
  value: string;
  percent: string;
}

export interface SectorAllocationResponse {
  items: SectorAllocationItem[];
  total_value: string;
}

export interface TopMoverItem {
  symbol: string;
  company_name: string;
  current_price: string;
  unrealized_pnl: string;
  unrealized_pnl_percent: string;
}

export interface TopMoversResponse {
  gainers: TopMoverItem[];
  losers: TopMoverItem[];
}

export interface PortfolioMetrics {
  total_invested_value: string;
  total_market_value: string;
  total_unrealized_pnl: string;
  total_unrealized_pnl_percent: string;
  holdings_count: number;
  sectors_count: number;
  best_performer: TopMoverItem | null;
  worst_performer: TopMoverItem | null;
}
