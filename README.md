# 🚀 Real-Time Cryptocurrency Dashboard

A modern, feature-rich cryptocurrency dashboard with real-time price tracking, interactive charts, and price alerts. Built with Next.js, Express, Socket.IO, and WebSockets for seamless real-time data updates.

![Crypto Dashboard](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 📊 **Real-Time Data**
- Live cryptocurrency price updates via WebSocket connections
- Support for multiple cryptocurrency pairs (BTC, ETH, BNB, SOL, ADA, XRP)
- Real-time price charts with historical data visualization
- Volume analysis with interactive bar charts

### 🔔 **Price Alerts**
- Create custom price alerts for any tracked cryptocurrency
- Set alerts for price going above or below target values
- Browser notifications when alerts are triggered
- Easy-to-use alert management interface

### 📈 **Advanced Analytics**
- Live statistics cards showing:
  - Current price with change indicators
  - 24-hour high/low prices
  - Total trading volume
  - Trade count and aggregated metrics
- Interactive charts with tooltips
- Real-time price change indicators

### 🎨 **Modern UI/UX**
- Sleek dark theme with custom gradient effects
- Responsive design for all screen sizes
- Smooth animations and transitions
- Collapsible sidebar for better space utilization
- Glass-morphism effects and custom scrollbars

### 🔧 **Technical Features**
- **Multi-cryptocurrency support**: Track 6+ crypto pairs simultaneously
- **WebSocket architecture**: Efficient real-time data streaming
- **Automatic reconnection**: Robust error handling and reconnection logic
- **Data aggregation**: Smart data buffering and aggregation (configurable intervals)
- **Type-safe**: Full TypeScript implementation on both frontend and backend
- **Clean code**: Well-documented, follows best practices and SOLID principles

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js 14     │◄────────┤  Express Server │◄────────┤  Binance API    │
│  Frontend       │  Socket │  + Socket.IO    │  WebSocket  (Futures)     │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
      │                            │
      │                            │
      ├─ Real-time charts         ├─ Multi-crypto streams
      ├─ Price alerts             ├─ Data aggregation
      ├─ Interactive UI           ├─ Alert management
      └─ Responsive design        └─ Error handling
```

## 📁 Project Structure

```
realtime-dashboard/
├── backend/                    # Express + Socket.IO server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── constants.ts   # Environment and constants
│   │   ├── services/          # Business logic
│   │   │   ├── cryptoDataService.ts      # Multi-crypto WebSocket management
│   │   │   ├── socketIO.service.ts       # Socket.IO server setup
│   │   │   └── binanceWebSocket.service.ts
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/             # Utility functions
│   │   │   └── logger.ts      # Custom logger
│   │   └── server.ts          # Main server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Home page
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # React components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── PriceChart.tsx
│   │   │   │   └── VolumeChart.tsx
│   │   │   ├── crypto/        # Crypto-specific components
│   │   │   │   └── CryptoSelector.tsx
│   │   │   ├── alerts/        # Alert management
│   │   │   │   └── PriceAlerts.tsx
│   │   │   ├── layout/        # Layout components
│   │   │       └── SideBar.tsx
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useWebSocket.ts
│   │   │   └── utils.ts
│   │   ├── lib/               # Utilities and helpers
│   │   │   ├── socket.ts      # Socket.IO client
│   │   │   └── utils.ts       # Helper functions
│   │   └── types/             # TypeScript definitions
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** or **yarn**
- Internet connection (for Binance API)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/R-Kri/crypto-dashboard.git
cd crypto-dashboard
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Configuration

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Add other configurations as needed
```

#### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Crypto Dashboard
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### Running the Application

#### Development Mode

1. **Start the backend server** (in the `backend` directory):
```bash
npm run dev
```

The backend will start on `http://localhost:4000`

2. **Start the frontend** (in a new terminal, in the `frontend` directory):
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

3. **Access the dashboard**: Open your browser and navigate to `http://localhost:3000`

#### Production Mode

1. **Build the backend**:
```bash
cd backend
npm run build
npm start
```

2. **Build and start the frontend**:
```bash
cd frontend
npm run build
npm start
```

## 🎯 Usage

### Switching Cryptocurrencies
- Click the cryptocurrency selector in the header
- Choose from available pairs (BTC, ETH, BNB, SOL, ADA, XRP)
- Charts and statistics update automatically

### Creating Price Alerts
1. Click the "Alerts" button in the header
2. Click "New Alert"
3. Choose a condition (above/below)
4. Enter your target price
5. Click "Create Alert"

### Viewing Charts
- **Price Chart**: Shows real-time price movements with high/low indicators
- **Volume Chart**: Displays trading volume over time
- Hover over charts for detailed information

## 🛠️ Technology Stack

### Backend
- **Express.js** - Web server framework
- **Socket.IO** - Real-time bidirectional communication
- **ws** - WebSocket client for Binance API
- **TypeScript** - Type-safe development
- **Cors** - Cross-origin resource sharing

### Frontend
- **Next.js 14** - React framework with app directory
- **React 18** - UI library
- **Socket.IO Client** - Real-time connection
- **Recharts** - Chart visualization library
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **React Icons** - Icon library

## 📝 API Endpoints

### Backend REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/api/symbols` | GET | Get supported cryptocurrency pairs |
| `/api/status` | GET | Get connection status for all pairs |

### WebSocket Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe` | `{ symbols: string[] }` | Subscribe to specific symbols |
| `unsubscribe` | `{ symbols: string[] }` | Unsubscribe from symbols |
| `create-alert` | `PriceAlert` | Create a new price alert |
| `delete-alert` | `alertId: string` | Delete an existing alert |
| `get-alerts` | - | Request list of active alerts |

#### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ clientId, timestamp }` | Connection acknowledgment |
| `new-trade` | `ProcessedTrade` | New trade data |
| `crypto-status` | `{ symbol, status }` | Crypto connection status |
| `price-alert` | `{ alerts, price }` | Alert triggered |
| `alerts-list` | `{ alerts }` | List of active alerts |

## 🔍 Code Quality

### Best Practices Implemented
- ✅ **Clean Code**: Well-documented, readable code
- ✅ **SOLID Principles**: Single responsibility, open-closed, etc.
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Error Handling**: Comprehensive try-catch blocks
- ✅ **Logging**: Detailed logging for debugging
- ✅ **Comments**: Inline documentation
- ✅ **Modularity**: Reusable components and services
- ✅ **Performance**: Optimized rendering and data handling

### Code Structure
- Services separated from business logic
- Reusable React hooks for state management
- Component-based architecture
- Utility functions for common operations
- Type definitions for data consistency

## 🐛 Troubleshooting

### Common Issues

**1. Backend won't start**
- Check if port 4000 is available
- Verify Node.js version (>= 16.0.0)
- Delete `node_modules` and reinstall

**2. Frontend can't connect to backend**
- Ensure backend is running
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Verify CORS settings

**3. No data showing**
- Check internet connection
- Verify Binance API is accessible
- Check browser console for errors

**4. Charts not updating**
- Refresh the page
- Check WebSocket connection status
- Verify selected cryptocurrency is supported

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Binance for providing free WebSocket API
- Next.js team for the amazing framework
- Socket.IO for real-time capabilities
- Recharts for beautiful chart components

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ and TypeScript**

---

