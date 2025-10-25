/**
 * Custom hook for managing WebSocket connection and data
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { socket, SOCKET_EVENTS } from '@/lib/socket';
import { ProcessedTrade, ConnectionState, ChartDataPoint, LiveStats } from '@/types';
import { calculatePercentageChange } from '@/lib/utils';

interface UseWebSocketConfig {
    aggregationInterval?: number;  // milliseconds
    maxDataPoints?: number;
    symbol?: string;  // Filter trades by symbol (e.g., 'btcusdt')
}

interface UseWebSocketReturn {
    chartData: ChartDataPoint[];
    liveStats: LiveStats;
    connectionState: ConnectionState;
    isConnected: boolean;
}

const DEFAULT_CONFIG: Required<UseWebSocketConfig> = {
    aggregationInterval: 2000,  // 2 seconds
    maxDataPoints: 100,
    symbol: 'btcusdt',  // Default to Bitcoin
};

export const useWebSocket = (config: UseWebSocketConfig = {}): UseWebSocketReturn => {
    const { aggregationInterval, maxDataPoints, symbol: selectedSymbol } = { ...DEFAULT_CONFIG, ...config };

    // State management
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [liveStats, setLiveStats] = useState<LiveStats>({
        currentPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
        totalVolume: 0,
        tradeCount: 0,
        lastPrice: 0,
        high24h: 0,
        low24h: 0,
    });
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        ConnectionState.CONNECTING
    );

    // Refs for trade aggregation
    const tradeBuffer = useRef<ProcessedTrade[]>([]);
    const aggregationTimer = useRef<NodeJS.Timeout | null>(null);
    const priceHistory = useRef<number[]>([]);

    /**
     * Aggregate trades into chart data points
     */
    const aggregateTrades = useCallback(() => {
        const trades = [...tradeBuffer.current];
        tradeBuffer.current = [];

        if (trades.length === 0) return;

        // Calculate aggregated metrics
        const prices = trades.map((t) => t.price);
        const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0);
        const closingPrice = trades[trades.length - 1].price;
        const highPrice = Math.max(...prices);
        const lowPrice = Math.min(...prices);
        const timestamp = trades[trades.length - 1].timestamp;

        // Format time for display
        const timeLabel = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const newDataPoint: ChartDataPoint = {
            time: timeLabel,
            timestamp,
            price: closingPrice,
            volume: totalVolume,
            high: highPrice,
            low: lowPrice,
            trades: trades.length,
        };

        // Update chart data
        setChartData((prev) => {
            const updated = [...prev, newDataPoint];
            // Keep only the last N data points
            return updated.slice(-maxDataPoints);
        });
    }, [maxDataPoints]);

    /**
     * Handle incoming trade data
     */
    const handleNewTrade = useCallback((trade: ProcessedTrade) => {
        // Filter trades by selected symbol
        if (trade.symbol.toLowerCase() !== selectedSymbol.toLowerCase()) {
            return;
        }
        
        // Add to buffer for aggregation
        tradeBuffer.current.push(trade);

        // Track price history for 24h high/low
        priceHistory.current.push(trade.price);
        if (priceHistory.current.length > 1000) {
            priceHistory.current.shift();
        }

        // Calculate 24h high/low from price history
        const high24h = Math.max(...priceHistory.current);
        const low24h = Math.min(...priceHistory.current);

        // Update live stats immediately
        setLiveStats((prev) => {
            const priceChange = trade.price - prev.lastPrice;
            const priceChangePercent = calculatePercentageChange(trade.price, prev.lastPrice);

            return {
                currentPrice: trade.price,
                priceChange,
                priceChangePercent,
                totalVolume: prev.totalVolume + trade.quantity,
                tradeCount: prev.tradeCount + 1,
                lastPrice: prev.currentPrice || trade.price,
                high24h,
                low24h,
            };
        });
    }, [selectedSymbol]);

    /**
     * Set up WebSocket event listeners
     */
    useEffect(() => {
        // Connection events
        socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('✅ Connected to server');
            setConnectionState(ConnectionState.CONNECTED);
        });

        socket.on(SOCKET_EVENTS.CONNECTED, (data) => {
            console.log('📡 Connection acknowledged:', data);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log('❌ Disconnected:', reason);
            setConnectionState(ConnectionState.DISCONNECTED);
        });

        socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            setConnectionState(ConnectionState.CONNECTED);
        });

        socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}`);
            setConnectionState(ConnectionState.CONNECTING);
        });

        socket.on(SOCKET_EVENTS.ERROR, (error) => {
            console.error('Socket error:', error);
            setConnectionState(ConnectionState.ERROR);
        });

        // Trade data events
        socket.on(SOCKET_EVENTS.NEW_TRADE, handleNewTrade);

        // Set up aggregation interval
        aggregationTimer.current = setInterval(aggregateTrades, aggregationInterval);

        // Cleanup
        return () => {
            socket.off(SOCKET_EVENTS.CONNECT);
            socket.off(SOCKET_EVENTS.CONNECTED);
            socket.off(SOCKET_EVENTS.DISCONNECT);
            socket.off(SOCKET_EVENTS.RECONNECT);
            socket.off(SOCKET_EVENTS.RECONNECT_ATTEMPT);
            socket.off(SOCKET_EVENTS.ERROR);
            socket.off(SOCKET_EVENTS.NEW_TRADE);

            if (aggregationTimer.current) {
                clearInterval(aggregationTimer.current);
            }
        };
    }, [handleNewTrade, aggregateTrades, aggregationInterval]);

    // Reset stats when symbol changes
    useEffect(() => {
        setChartData([]);
        setLiveStats({
            currentPrice: 0,
            priceChange: 0,
            priceChangePercent: 0,
            totalVolume: 0,
            tradeCount: 0,
            lastPrice: 0,
            high24h: 0,
            low24h: 0,
        });
        tradeBuffer.current = [];
        priceHistory.current = [];
    }, [selectedSymbol]);

    return {
        chartData,
        liveStats,
        connectionState,
        isConnected: connectionState === ConnectionState.CONNECTED,
    };
};