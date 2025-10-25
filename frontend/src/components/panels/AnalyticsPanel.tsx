/**
 * Analytics Panel Component
 * Shows detailed trading analytics and statistics
 */
'use client';

import React from 'react';
import { LiveStats } from '@/types';
import { formatPrice, formatVolume } from '@/lib/utils';

interface AnalyticsPanelProps {
    stats: LiveStats;
    symbol: string;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, symbol }) => {
    const priceRange = stats.high24h - stats.low24h;
    const priceRangePercent = stats.low24h > 0 
        ? ((priceRange / stats.low24h) * 100).toFixed(2) 
        : 0;

    const avgPrice = stats.low24h > 0 
        ? ((stats.high24h + stats.low24h) / 2).toFixed(2)
        : 0;

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
                <p className="text-gray-400 text-sm">Detailed trading metrics for {symbol.toUpperCase()}</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Current Price */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-300 text-sm font-medium">Current Price</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatPrice(stats.currentPrice)}</div>
                    <div className={`text-sm mt-1 ${stats.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.priceChangePercent >= 0 ? '↑' : '↓'} {Math.abs(stats.priceChangePercent).toFixed(2)}%
                    </div>
                </div>

                {/* 24h Volume */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-gray-300 text-sm font-medium">24h Volume</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatVolume(stats.totalVolume)}</div>
                    <div className="text-sm text-gray-400 mt-1">{stats.tradeCount.toLocaleString()} trades</div>
                </div>

                {/* Price Range */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <span className="text-gray-300 text-sm font-medium">24h Range</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatPrice(priceRange)}</div>
                    <div className="text-sm text-gray-400 mt-1">{priceRangePercent}% volatility</div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Statistics</h3>
                <div className="space-y-4">
                    {/* High/Low */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                        <span className="text-gray-400">24h High</span>
                        <span className="text-green-400 font-semibold">{formatPrice(stats.high24h)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                        <span className="text-gray-400">24h Low</span>
                        <span className="text-red-400 font-semibold">{formatPrice(stats.low24h)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Average Price</span>
                        <span className="text-blue-400 font-semibold">{formatPrice(Number(avgPrice))}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                        <span className="text-gray-400">Price Change</span>
                        <span className={`font-semibold ${stats.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.priceChange >= 0 ? '+' : ''}{formatPrice(stats.priceChange)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Trades</span>
                        <span className="text-purple-400 font-semibold">{stats.tradeCount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Price Distribution Visualization */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Price Distribution</h3>
                <div className="space-y-3">
                    {/* Current vs High */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Current to High</span>
                            <span className="text-white font-medium">
                                {((stats.currentPrice / stats.high24h) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stats.currentPrice / stats.high24h) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Current vs Low */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Low to Current</span>
                            <span className="text-white font-medium">
                                {stats.high24h > 0 ? ((stats.currentPrice - stats.low24h) / (stats.high24h - stats.low24h) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${stats.high24h > 0 
                                        ? Math.min(((stats.currentPrice - stats.low24h) / (stats.high24h - stats.low24h)) * 100, 100) 
                                        : 0}%` 
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
