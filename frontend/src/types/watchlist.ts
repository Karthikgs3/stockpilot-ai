export type AlertCondition = "ABOVE" | "BELOW";

export interface WatchlistItemWithQuote {
  id: string;
  symbol: string;
  company_name: string;
  current_price: string | null;
  has_active_alert: boolean;
  created_at: string;
}

export interface WatchlistItemCreatePayload {
  symbol: string;
  company_name: string;
}

export interface PriceAlert {
  id: string;
  watchlist_item_id: string;
  symbol: string;
  condition: AlertCondition;
  target_price: string;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export interface PriceAlertCreatePayload {
  watchlist_item_id: string;
  condition: AlertCondition;
  target_price: number;
}
