// Type definitions for the frontend

/**
 * Processed trade data from backend
 */
export interface ProcessedTrade {
    price: number;
    quantity: number;
    timestamp: number;
    isBuyerMaker: boolean;
    symbol: string;
    tradeId?: number;
}

/**
 * Aggregated chart data point
 */
export interface ChartDataPoint {
    time: string;           // Formatted time label
    timestamp: number;      // Original timestamp
    price: number;          // Closing price for this period
    volume: number;         // Total volume in this period
    high?: number;          // Highest price in period
    low?: number;           // Lowest price in period
    trades: number;         // Number of trades in period
}

/**
 * Live statistics for dashboard cards
 */
export interface LiveStats {
    currentPrice: number;
    priceChange: number;          // Absolute change
    priceChangePercent: number;   // Percentage change
    totalVolume: number;
    tradeCount: number;
    lastPrice: number;            // Previous price for comparison
    high24h: number;              // 24h high
    low24h: number;               // 24h low
}

/**
 * WebSocket connection state
 */
export enum ConnectionState {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
}

/**
 * Chart configuration
 */
export interface ChartConfig {
    maxDataPoints: number;
    aggregationInterval: number;  // in milliseconds
    showGrid: boolean;
    animationDuration: number;
}

/**
 * Cryptocurrency symbol information
 */
export interface CryptoSymbol {
    symbol: string;          // e.g., 'btcusdt'
    displayName: string;     // e.g., 'BTC/USDT'
    baseAsset: string;       // e.g., 'BTC'
    quoteAsset: string;      // e.g., 'USDT'
}

/**
 * Price alert
 */
export interface PriceAlert {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: 'above' | 'below';
    createdAt: number;
    triggered: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
    theme: 'dark' | 'light';
    defaultSymbol: string;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    aggregationInterval: number;
    maxDataPoints: number;
}
