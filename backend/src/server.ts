import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config, EVENTS } from './config/constants';
import { initializeSocketIO } from './services/socketIO.service';
import { CryptoDataService } from './services/cryptoDataService';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);

// Configure CORS - Allow multiple origins for development
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Initialize Multi-Crypto WebSocket service
const cryptoService = new CryptoDataService(io);
cryptoService.connectAll();

// API endpoint to get supported symbols
app.get('/api/symbols', (req, res) => {
  try {
    const symbols = cryptoService.getSupportedPairs();
    res.json({
      success: true,
      data: symbols,
    });
  } catch (error) {
    logger.error('Error fetching symbols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch symbols',
    });
  }
});

// API endpoint to get connection status
app.get('/api/status', (req, res) => {
  try {
    const status = cryptoService.getConnectionStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status',
    });
  }
});

// Graceful shutdown handler
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  cryptoService.disconnectAll();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
httpServer.listen(config.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${config.PORT}`);
  logger.info(`📡 WebSocket endpoint: ws://localhost:${config.PORT}`);
  logger.info(`🎯 Accepting connections from: ${config.CLIENT_URL}`);
});

export { app, httpServer, io };