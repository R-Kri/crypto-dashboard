/**
 * Raw trade data from Binance WebSocket
 * @see https://binance-docs.github.io/apidocs/futures/en/#aggregate-trade-streams
 */
export interface BinanceAggTrade {
    e: 'aggTrade';        // Event type
    E: number;            // Event time
    s: string;            // Symbol
    a: number;            // Aggregate trade ID
    p: string;            // Price
    q: string;            // Quantity
    f: number;            // First trade ID
    l: number;            // Last trade ID
    T: number;            // Trade time
    m: boolean;           // Is the buyer the market maker?
}

/**
 * Processed trade data sent to clients
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
 * WebSocket connection status
 */
export enum ConnectionStatus {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error',
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
 * Price alert configuration
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
 * Market statistics
 */
export interface MarketStats {
    symbol: string;
    price: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    lastUpdate: number;
}