/**
 * Statistics Cards Component
 * Displays live KPI metrics
 */
'use client';

import React from 'react';
import { LiveStats } from '@/types';
import {
    formatPrice,
    formatVolume,
    formatNumber,
    getChangeColor,
    getChangeBgColor,
    getChangeArrow,
} from '@/lib/utils';

interface StatsCardsProps {
    stats: LiveStats;
    isConnected: boolean;
}

export const StatsCards = ({ stats, isConnected }: StatsCardsProps) => {
    const {
        currentPrice,
        priceChange,
        priceChangePercent,
        totalVolume,
        tradeCount,
        high24h,
        low24h,
    } = stats;

    const changeColor = getChangeColor(priceChangePercent);
    const changeBgColor = getChangeBgColor(priceChangePercent);
    const changeArrow = getChangeArrow(priceChangePercent);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Price Card */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Current Price</p>
                    {!isConnected && (
                        <span className="text-xs text-gray-500 animate-pulse">⏸</span>
                    )}
                </div>
                <p className="text-3xl font-bold text-yellow-400 mb-2">
                    {currentPrice > 0 ? formatPrice(currentPrice) : '—'}
                </p>
                <div className={`flex items-center gap-2 text-sm ${changeColor}`}>
                    <span>{changeArrow}</span>
                    <span className="font-medium">
                        {formatPrice(Math.abs(priceChange))} ({Math.abs(priceChangePercent).toFixed(2)}%)
                    </span>
                </div>
            </div>

            {/* 24h High/Low Card */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">24h Range</p>
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">High</p>
                        <p className="text-xl font-bold text-green-400">
                            {high24h > 0 ? formatPrice(high24h) : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Low</p>
                        <p className="text-xl font-bold text-red-400">
                            {low24h > 0 ? formatPrice(low24h) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Volume Card */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Total Volume</p>
                <p className="text-3xl font-bold text-purple-400 mb-2">
                    {formatVolume(totalVolume)}
                </p>
                <p className="text-xs text-gray-500">BTC traded</p>
            </div>

            {/* Trade Count Card */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Total Trades</p>
                <p className="text-3xl font-bold text-cyan-400 mb-2">
                    {formatNumber(tradeCount)}
                </p>
                <p className="text-xs text-gray-500">Aggregated trades</p>
            </div>
        </div>
    );
};
