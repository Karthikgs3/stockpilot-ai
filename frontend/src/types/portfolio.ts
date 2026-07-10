export type TransactionType = "BUY" | "SELL";

export interface HoldingWithMetrics {
  id: string;
  symbol: string;
  company_name: string;
  sector: string | null;
  quantity: string;
  average_buy_price: string;
  current_price: string;
  market_value: string;
  invested_value: string;
  unrealized_pnl: string;
  unrealized_pnl_percent: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioSummary {
  total_market_value: string;
  total_invested_value: string;
  total_unrealized_pnl: string;
  total_unrealized_pnl_percent: string;
  today_change_value: string;
  today_change_percent: string;
  holdings_count: number;
  sector_allocation: Record<string, string>;
}

export interface TransactionCreatePayload {
  symbol: string;
  company_name: string;
  sector?: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_share: number;
  fees?: number;
  executed_at: string;
}

export interface HoldingUpdatePayload {
  company_name?: string;
  sector?: string;
}
