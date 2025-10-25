/**
 * Socket.IO Service
 * Manages Socket.IO server and client connections with enhanced features
 */
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config, EVENTS } from '../config/constants';
import { logger } from '../utils/logger';
import { PriceAlert } from '../types';

// Store active price alerts (in production, use a database)
const activeAlerts: Map<string, PriceAlert[]> = new Map();

/**
 * Initialize Socket.IO server with proper configuration
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
    // Allow multiple origins for development
    const allowedOrigins = [
        config.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
    ];

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: config.SOCKET_PING_TIMEOUT,
        pingInterval: config.SOCKET_PING_INTERVAL,
    });

    // Connection handler
    io.on(EVENTS.CONNECTION, (socket) => {
        const clientId = socket.id;
        const clientIP = socket.handshake.address;

        logger.info(`✅ Client connected: ${clientId} from ${clientIP}`);
        logger.info(`📊 Total connected clients: ${io.sockets.sockets.size}`);

        // Send connection acknowledgment
        socket.emit('connected', {
            clientId,
            timestamp: Date.now(),
            message: 'Successfully connected to real-time dashboard',
            serverVersion: '2.0.0',
        });

        // Handle symbol subscription
        socket.on(EVENTS.SUBSCRIBE, (data) => {
            const { symbols } = data;
            if (Array.isArray(symbols)) {
                symbols.forEach((symbol: string) => {
                    socket.join(`symbol:${symbol}`);
                    logger.info(`Client ${clientId} subscribed to ${symbol}`);
                });
                
                socket.emit('subscription-confirmed', {
                    symbols,
                    timestamp: Date.now(),
                });
            }
        });

        // Handle symbol unsubscription
        socket.on(EVENTS.UNSUBSCRIBE, (data) => {
            const { symbols } = data;
            if (Array.isArray(symbols)) {
                symbols.forEach((symbol: string) => {
                    socket.leave(`symbol:${symbol}`);
                    logger.info(`Client ${clientId} unsubscribed from ${symbol}`);
                });
                
                socket.emit('unsubscription-confirmed', {
                    symbols,
                    timestamp: Date.now(),
                });
            }
        });

        // Handle price alert creation
        socket.on('create-alert', (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
            const newAlert: PriceAlert = {
                ...alert,
                id: `${clientId}-${Date.now()}`,
                createdAt: Date.now(),
                triggered: false,
            };

            const clientAlerts = activeAlerts.get(clientId) || [];
            clientAlerts.push(newAlert);
            activeAlerts.set(clientId, clientAlerts);

            logger.info(`Price alert created for client ${clientId}:`, newAlert);
            
            socket.emit('alert-created', {
                success: true,
                alert: newAlert,
            });
        });

        // Handle price alert deletion
        socket.on('delete-alert', (alertId: string) => {
            const clientAlerts = activeAlerts.get(clientId) || [];
            const updatedAlerts = clientAlerts.filter(alert => alert.id !== alertId);
            activeAlerts.set(clientId, updatedAlerts);

            logger.info(`Price alert deleted for client ${clientId}: ${alertId}`);
            
            socket.emit('alert-deleted', {
                success: true,
                alertId,
            });
        });

        // Handle request for active alerts
        socket.on('get-alerts', () => {
            const clientAlerts = activeAlerts.get(clientId) || [];
            socket.emit('alerts-list', {
                alerts: clientAlerts,
                timestamp: Date.now(),
            });
        });

        // Handle client disconnection
        socket.on(EVENTS.DISCONNECT, (reason) => {
            logger.info(`❌ Client disconnected: ${clientId} (Reason: ${reason})`);
            logger.info(`📊 Remaining clients: ${io.sockets.sockets.size}`);
            
            // Clean up alerts (optional - you might want to persist these)
            activeAlerts.delete(clientId);
        });

        // Handle errors
        socket.on(EVENTS.ERROR, (error) => {
            logger.error(`Socket error for client ${clientId}:`, error);
        });

        // Handle ping for latency measurement
        socket.on('ping', () => {
            socket.emit('pong', {
                timestamp: Date.now(),
            });
        });
    });

    return io;
}

/**
 * Check and trigger price alerts
 */
export function checkPriceAlerts(io: SocketIOServer, symbol: string, currentPrice: number): void {
    activeAlerts.forEach((alerts, clientId) => {
        const triggeredAlerts = alerts.filter(alert => {
            if (alert.symbol.toLowerCase() === symbol.toLowerCase() && !alert.triggered) {
                const shouldTrigger = 
                    (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                    (alert.condition === 'below' && currentPrice <= alert.targetPrice);
                
                if (shouldTrigger) {
                    alert.triggered = true;
                    return true;
                }
            }
            return false;
        });

        // Send alerts to client
        if (triggeredAlerts.length > 0) {
            io.to(clientId).emit(EVENTS.PRICE_ALERT, {
                alerts: triggeredAlerts,
                symbol,
                currentPrice,
                timestamp: Date.now(),
            });
            
            logger.info(`Price alerts triggered for client ${clientId}:`, triggeredAlerts.length);
        }
    });
}
