import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server configuration
    PORT: parseInt(process.env.PORT || '4000', 10),
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Binance WebSocket configuration
    BINANCE_WS_BASE_URL: 'wss://fstream.binance.com/ws',
    BINANCE_WS_URL: 'wss://fstream.binance.com/ws/btcusdt@aggTrade',
    RECONNECT_DELAY: 5000, // 5 seconds
    MAX_RECONNECT_ATTEMPTS: 10,

    // Socket.IO configuration
    SOCKET_PING_TIMEOUT: 60000,
    SOCKET_PING_INTERVAL: 25000,
} as const;

export const EVENTS = {
    // Socket.IO events
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    NEW_TRADE: 'new-trade',
    ERROR: 'error',
    SUBSCRIBE: 'subscribe',
    UNSUBSCRIBE: 'unsubscribe',
    CRYPTO_STATUS: 'crypto-status',
    PRICE_ALERT: 'price-alert',
    MARKET_STATS: 'market-stats',
    REQUEST_SYMBOLS: 'request-symbols',
    SYMBOLS_LIST: 'symbols-list',
} as const;