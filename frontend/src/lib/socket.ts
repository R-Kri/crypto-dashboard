/**
 * Socket.IO client configuration
 * Centralized WebSocket connection management
 */
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

/**
 * Create and configure Socket.IO client
 */
export const socket: Socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 20000,
    autoConnect: true,
});

/**
 * Socket event names (must match backend)
 */
export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECTED: 'connected',
    NEW_TRADE: 'new-trade',
    ERROR: 'error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',
    
    // New events
    SUBSCRIBE: 'subscribe',
    UNSUBSCRIBE: 'unsubscribe',
    SUBSCRIPTION_CONFIRMED: 'subscription-confirmed',
    UNSUBSCRIPTION_CONFIRMED: 'unsubscription-confirmed',
    CRYPTO_STATUS: 'crypto-status',
    PRICE_ALERT: 'price-alert',
    CREATE_ALERT: 'create-alert',
    DELETE_ALERT: 'delete-alert',
    ALERT_CREATED: 'alert-created',
    ALERT_DELETED: 'alert-deleted',
    GET_ALERTS: 'get-alerts',
    ALERTS_LIST: 'alerts-list',
    PING: 'ping',
    PONG: 'pong',
} as const;
