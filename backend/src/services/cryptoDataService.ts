/**
 * Cryptocurrency Data Service
 * Manages multiple cryptocurrency WebSocket connections and data aggregation
 */
import WebSocket from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { config, EVENTS } from '../config/constants';
import { BinanceAggTrade, ProcessedTrade, CryptoSymbol } from '../types';
import { logger } from '../utils/logger';

/**
 * Manages connections to multiple cryptocurrency streams
 */
export class CryptoDataService {
    private connections: Map<string, WebSocket> = new Map();
    private io: SocketIOServer;
    private isShuttingDown = false;
    private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
    private reconnectAttempts: Map<string, number> = new Map();

    // Supported cryptocurrency pairs
    private readonly supportedPairs: CryptoSymbol[] = [
        { symbol: 'btcusdt', displayName: 'BTC/USDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
        { symbol: 'ethusdt', displayName: 'ETH/USDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
        { symbol: 'bnbusdt', displayName: 'BNB/USDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
        { symbol: 'solusdt', displayName: 'SOL/USDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
        { symbol: 'adausdt', displayName: 'ADA/USDT', baseAsset: 'ADA', quoteAsset: 'USDT' },
        { symbol: 'xrpusdt', displayName: 'XRP/USDT', baseAsset: 'XRP', quoteAsset: 'USDT' },
    ];

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    /**
     * Initialize connections for all supported pairs
     */
    public async connectAll(): Promise<void> {
        logger.info(`🚀 Initializing connections for ${this.supportedPairs.length} cryptocurrency pairs...`);
        
        for (const pair of this.supportedPairs) {
            await this.connect(pair.symbol);
            // Small delay to avoid overwhelming the API
            await this.delay(100);
        }
    }

    /**
     * Connect to a specific cryptocurrency pair stream
     */
    public async connect(symbol: string): Promise<void> {
        if (this.connections.has(symbol)) {
            logger.warn(`Already connected to ${symbol.toUpperCase()}`);
            return;
        }

        const wsUrl = `${config.BINANCE_WS_BASE_URL}/${symbol}@aggTrade`;
        logger.info(`🔌 Connecting to ${symbol.toUpperCase()}...`);

        try {
            const ws = new WebSocket(wsUrl);
            this.setupEventHandlers(ws, symbol);
            this.connections.set(symbol, ws);
        } catch (error) {
            logger.error(`Failed to connect to ${symbol}:`, error);
            this.handleReconnect(symbol);
        }
    }

    /**
     * Set up WebSocket event handlers for a specific connection
     */
    private setupEventHandlers(ws: WebSocket, symbol: string): void {
        ws.on('open', () => this.handleOpen(symbol));
        ws.on('message', (data) => this.handleMessage(data, symbol));
        ws.on('error', (error) => this.handleError(error, symbol));
        ws.on('close', (code, reason) => this.handleClose(code, reason, symbol));
        ws.on('ping', () => ws.pong());
    }

    /**
     * Handle WebSocket open event
     */
    private handleOpen(symbol: string): void {
        this.reconnectAttempts.set(symbol, 0);
        logger.info(`✅ Connected to ${symbol.toUpperCase()}`);
        
        // Emit connection status to clients
        this.io.emit(EVENTS.CRYPTO_STATUS, {
            symbol,
            status: 'connected',
            timestamp: Date.now(),
        });
    }

    /**
     * Handle incoming trade messages
     */
    private handleMessage(data: WebSocket.Data, symbol: string): void {
        try {
            const trade = JSON.parse(data.toString()) as BinanceAggTrade;

            if (!this.isValidTrade(trade)) {
                logger.warn(`Invalid trade data for ${symbol}`);
                return;
            }

            const processedTrade = this.processTrade(trade);
            this.broadcastTrade(processedTrade);

        } catch (error) {
            logger.error(`Error processing message for ${symbol}:`, error);
        }
    }

    /**
     * Validate trade data structure
     */
    private isValidTrade(trade: any): trade is BinanceAggTrade {
        return (
            trade &&
            trade.e === 'aggTrade' &&
            typeof trade.p === 'string' &&
            typeof trade.q === 'string' &&
            typeof trade.T === 'number' &&
            typeof trade.s === 'string'
        );
    }

    /**
     * Process raw trade data
     */
    private processTrade(trade: BinanceAggTrade): ProcessedTrade {
        return {
            price: parseFloat(trade.p),
            quantity: parseFloat(trade.q),
            timestamp: trade.T,
            isBuyerMaker: trade.m,
            symbol: trade.s.toLowerCase(),
            tradeId: trade.a,
        };
    }

    /**
     * Broadcast trade to all connected clients
     */
    private broadcastTrade(trade: ProcessedTrade): void {
        const connectedClients = this.io.sockets.sockets.size;

        if (connectedClients > 0) {
            this.io.emit(EVENTS.NEW_TRADE, trade);
        }
    }

    /**
     * Handle WebSocket errors
     */
    private handleError(error: Error, symbol: string): void {
        logger.error(`❌ WebSocket error for ${symbol}:`, error.message);
        
        this.io.emit(EVENTS.CRYPTO_STATUS, {
            symbol,
            status: 'error',
            error: error.message,
            timestamp: Date.now(),
        });
    }

    /**
     * Handle WebSocket close event
     */
    private handleClose(code: number, reason: Buffer, symbol: string): void {
        const reasonString = reason.toString() || 'No reason provided';
        logger.warn(`🔌 Connection closed for ${symbol} (Code: ${code}, Reason: ${reasonString})`);

        this.connections.delete(symbol);

        this.io.emit(EVENTS.CRYPTO_STATUS, {
            symbol,
            status: 'disconnected',
            timestamp: Date.now(),
        });

        // Attempt reconnect if not shutting down
        if (!this.isShuttingDown) {
            this.handleReconnect(symbol);
        }
    }

    /**
     * Handle reconnection with exponential backoff
     */
    private handleReconnect(symbol: string): void {
        const attempts = this.reconnectAttempts.get(symbol) || 0;

        if (attempts >= config.MAX_RECONNECT_ATTEMPTS) {
            logger.error(`❌ Max reconnection attempts reached for ${symbol}`);
            return;
        }

        this.reconnectAttempts.set(symbol, attempts + 1);

        const delay = Math.min(
            config.RECONNECT_DELAY * Math.pow(2, attempts),
            60000 // Max 60 seconds
        );

        logger.info(`🔄 Reconnecting to ${symbol} in ${delay / 1000}s (Attempt ${attempts + 1}/${config.MAX_RECONNECT_ATTEMPTS})`);

        const timer = setTimeout(() => {
            this.connect(symbol);
            this.reconnectTimers.delete(symbol);
        }, delay);

        this.reconnectTimers.set(symbol, timer);
    }

    /**
     * Disconnect a specific symbol
     */
    public disconnect(symbol: string): void {
        const ws = this.connections.get(symbol);
        
        if (ws) {
            ws.close(1000, 'Client requested disconnect');
            this.connections.delete(symbol);
            logger.info(`🔌 Disconnected from ${symbol.toUpperCase()}`);
        }

        // Clear reconnect timer if exists
        const timer = this.reconnectTimers.get(symbol);
        if (timer) {
            clearTimeout(timer);
            this.reconnectTimers.delete(symbol);
        }
    }

    /**
     * Disconnect all connections
     */
    public disconnectAll(): void {
        this.isShuttingDown = true;
        logger.info('🔌 Disconnecting all cryptocurrency streams...');

        // Clear all reconnect timers
        this.reconnectTimers.forEach((timer) => clearTimeout(timer));
        this.reconnectTimers.clear();

        // Close all connections
        this.connections.forEach((ws, symbol) => {
            ws.close(1000, 'Server shutdown');
            logger.info(`✅ Disconnected from ${symbol.toUpperCase()}`);
        });

        this.connections.clear();
    }

    /**
     * Get list of supported cryptocurrency pairs
     */
    public getSupportedPairs(): CryptoSymbol[] {
        return this.supportedPairs;
    }

    /**
     * Get connection status for all pairs
     */
    public getConnectionStatus(): { symbol: string; connected: boolean }[] {
        return this.supportedPairs.map((pair) => ({
            symbol: pair.symbol,
            connected: this.connections.has(pair.symbol),
        }));
    }

    /**
     * Utility delay function
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
