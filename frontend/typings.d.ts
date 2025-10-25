/**
 * Represents the raw trade object received from the
 * Binance WebSocket stream (btcusdt@aggTrade).
 *
 * We only type the fields we care about.
 * 'p': Price
 * 'q': Quantity
 * 'T': Trade timestamp
 * 'm': Is the buyer the market maker?
 */
type BinanceTrade = {
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time (timestamp)
  m: boolean; // Market maker
};

/**
 * Represents a single aggregated data point for our charts.
 * We will create one of these every few seconds.
 */
type ChartDataPoint = {
  time: string; // A label for the X-axis (e.g., "11:30:05")
  price: number; // The closing price for this time bucket
  volume: number; // The total volume traded in this time bucket
};

/**
 * Represents the live-updating stats for the dashboard cards.
 */
type LiveStats = {
  currentPrice: number;
  priceChangePercent: number; // % change from the *last* price
  totalVolume: number; // Total accumulated volume
  tradeCount: number; // Total accumulated trades
  lastPrice: number; // Used to calculate percent change
};
