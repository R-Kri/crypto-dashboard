/**
 * Binance WebSocket Service
 * Manages connection to Binance WebSocket API and broadcasts trade data
 */
import WebSocket from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { config, EVENTS } from '../config/constants';
import { BinanceAggTrade, ProcessedTrade, ConnectionStatus } from '../types';
import { logger } from '../utils/logger';

export class BinanceWebSocketService {
    private ws: WebSocket | null = null;
    private io: SocketIOServer;
    private reconnectAttempts = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    private isIntentionalDisconnect = false;

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    // Establish connection to Binance WebSocket
    public connect(): void {
        if (this.status === ConnectionStatus.CONNECTED) {
            logger.warn('Already connected to Binance WebSocket');
            return;
        }

        this.status = ConnectionStatus.CONNECTING;
        logger.info('🔌 Connecting to Binance WebSocket...');

        try {
            this.ws = new WebSocket(config.BINANCE_WS_URL);
            this.setupEventHandlers();
        } catch (error) {
            logger.error('Failed to create WebSocket connection:', error);
            this.handleReconnect();
        }
    }

    // Set up WebSocket event handlers
    private setupEventHandlers(): void {
        if (!this.ws) return;

        this.ws.on('open', this.handleOpen.bind(this));
        this.ws.on('message', this.handleMessage.bind(this));
        this.ws.on('error', this.handleError.bind(this));
        this.ws.on('close', this.handleClose.bind(this));
        this.ws.on('ping', this.handlePing.bind(this));
        this.ws.on('pong', this.handlePong.bind(this));
    }

    /**
     * Handle WebSocket open event
     */
    private handleOpen(): void {
        this.status = ConnectionStatus.CONNECTED;
        this.reconnectAttempts = 0;
        logger.info('✅ Connected to Binance WebSocket');
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(data: WebSocket.Data): void {
        try {
            const trade = JSON.parse(data.toString()) as BinanceAggTrade;

            // Validate trade data
            if (!this.isValidTrade(trade)) {
                logger.warn('Received invalid trade data');
                return;
            }

            // Process and broadcast trade
            const processedTrade = this.processTrade(trade);
            this.broadcastTrade(processedTrade);

        } catch (error) {
            logger.error('Error processing message:', error);
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
            typeof trade.T === 'number'
        );
    }

    /**
     * Process raw trade data into a cleaner format
     */
    private processTrade(trade: BinanceAggTrade): ProcessedTrade {
        return {
            price: parseFloat(trade.p),
            quantity: parseFloat(trade.q),
            timestamp: trade.T,
            isBuyerMaker: trade.m,
            symbol: trade.s,
        };
    }

    /**
     * Broadcast trade data to all connected Socket.IO clients
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
    private handleError(error: Error): void {
        this.status = ConnectionStatus.ERROR;
        logger.error('❌ Binance WebSocket Error:', error.message);
    }

    /**
     * Handle WebSocket close event
     */
    private handleClose(code: number, reason: Buffer): void {
        this.status = ConnectionStatus.DISCONNECTED;
        const reasonString = reason.toString() || 'No reason provided';

        logger.warn(`🔌 Binance WebSocket closed (Code: ${code}, Reason: ${reasonString})`);

        // Only attempt reconnect if not intentionally disconnected
        if (!this.isIntentionalDisconnect) {
            this.handleReconnect();
        }
    }

    /**
     * Handle ping from server
     */
    private handlePing(): void {
        logger.debug('Received ping from Binance');
    }

    /**
     * Handle pong from server
     */
    private handlePong(): void {
        logger.debug('Received pong from Binance');
    }

    /**
     * Handle reconnection logic with exponential backoff
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= config.MAX_RECONNECT_ATTEMPTS) {
            logger.error('❌ Max reconnection attempts reached. Giving up.');
            return;
        }

        this.status = ConnectionStatus.RECONNECTING;
        this.reconnectAttempts++;

        // Exponential backoff: delay increases with each attempt
        const delay = Math.min(
            config.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1),
            60000 // Max 60 seconds
        );

        logger.info(`🔄 Reconnection attempt ${this.reconnectAttempts}/${config.MAX_RECONNECT_ATTEMPTS} in ${delay / 1000}s...`);

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Gracefully disconnect from WebSocket
     */
    public disconnect(): void {
        this.isIntentionalDisconnect = true;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close(1000, 'Server shutdown');
            this.ws = null;
        }

        this.status = ConnectionStatus.DISCONNECTED;
        logger.info('🔌 Disconnected from Binance WebSocket');
    }

    /**
     * Get current connection status
     */
    public getStatus(): ConnectionStatus {
        return this.status;
    }
}