/**
 * Main Dashboard Component
 * Orchestrates real-time cryptocurrency data display with multi-crypto support
 */
'use client';

import React, { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { StatsCards } from './StatsCards';
import { PriceChart } from './PriceChart';
import { VolumeChart } from './VolumeChart';
import { CryptoSelector } from '../crypto/CryptoSelector';
import { PriceAlerts } from '../alerts/PriceAlerts';
import { AnalyticsPanel } from '../panels/AnalyticsPanel';
import { NotificationsPanel } from '../panels/NotificationsPanel';
import { SettingsPanel } from '../panels/SettingsPanel';
import { ConnectionState } from '@/types';

type ActiveView = 'dashboard' | 'analytics' | 'notifications' | 'settings';

interface DashboardProps {
  activeView?: ActiveView;
  onViewChange?: (view: ActiveView) => void;
}

export const Dashboard = ({ activeView = 'dashboard', onViewChange }: DashboardProps = {}) => {
  const [selectedSymbol, setSelectedSymbol] = useState('btcusdt');

  const { chartData, liveStats, connectionState, isConnected } = useWebSocket({
    aggregationInterval: 2000,
    maxDataPoints: 100,
    symbol: selectedSymbol,
  });

  // Get display name for selected symbol
  const getSymbolDisplayName = (symbol: string): string => {
    const symbolMap: { [key: string]: string } = {
      'btcusdt': 'BTC/USDT',
      'ethusdt': 'ETH/USDT',
      'bnbusdt': 'BNB/USDT',
      'solusdt': 'SOL/USDT',
      'adausdt': 'ADA/USDT',
      'xrpusdt': 'XRP/USDT',
    };
    return symbolMap[symbol.toLowerCase()] || symbol.toUpperCase();
  };

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'analytics':
        return <AnalyticsPanel stats={liveStats} symbol={getSymbolDisplayName(selectedSymbol)} />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Header Section */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Crypto Dashboard</h1>
              <p className="text-sm text-gray-400">Real-time market data</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CryptoSelector
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
          />
          <PriceAlerts
            currentSymbol={selectedSymbol}
            currentPrice={liveStats.currentPrice}
          />
        </div>
      </div>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div
          className={`w-full py-2 px-4 rounded-lg text-center text-sm font-medium animate-pulse ${connectionState === ConnectionState.CONNECTING
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : connectionState === ConnectionState.ERROR
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
        >
          {connectionState === ConnectionState.CONNECTING && '🔄 Connecting to server...'}
          {connectionState === ConnectionState.DISCONNECTED && '❌ Disconnected from server'}
          {connectionState === ConnectionState.ERROR && '⚠️ Connection error - Retrying...'}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="w-full flex-shrink-0">
        <StatsCards stats={liveStats} isConnected={isConnected} />
      </div>

      {/* Charts Section */}
      <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Price Chart */}
        <div className="flex-1 bg-[#191e24] rounded-xl p-6 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Price Chart</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">{getSymbolDisplayName(selectedSymbol)}</span>
              {isConnected && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <PriceChart data={chartData} />
          </div>
        </div>

        {/* Volume Chart */}
        <div className="flex-1 bg-[#191e24] rounded-xl p-6 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Volume Chart</h2>
            <span className="text-xs text-gray-400">Aggregated</span>
          </div>
          <div className="flex-1 min-h-0">
            <VolumeChart data={chartData} />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex-shrink-0 flex items-center justify-between text-xs text-gray-500 px-2">
        <p>Real-time data from Binance • Updates every 2 seconds</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen w-full flex flex-col p-4 gap-4 bg-[#1d232a]">
      {renderContent()}
    </div>
  );
};
