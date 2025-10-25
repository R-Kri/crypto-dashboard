/**
 * Price Chart Component
 * Real-time area chart for price visualization
 */
'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '@/types';
import { formatPrice } from '@/lib/utils';

interface PriceChartProps {
  data: ChartDataPoint[];
}

export const PriceChart = ({ data }: PriceChartProps) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#191e24] border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-2">{data.time}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-yellow-400">
              Price: {formatPrice(data.price)}
            </p>
            {data.high && data.low && (
              <>
                <p className="text-xs text-green-400">High: {formatPrice(data.high)}</p>
                <p className="text-xs text-red-400">Low: {formatPrice(data.low)}</p>
              </>
            )}
            <p className="text-xs text-gray-400">Trades: {data.trades}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">Waiting for data...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

        <XAxis
          dataKey="time"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          tick={{ fill: '#9ca3af' }}
        />

        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          tick={{ fill: '#9ca3af' }}
          domain={['dataMin - 50', 'dataMax + 50']}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="price"
          stroke="#fbbf24"
          strokeWidth={2}
          fill="url(#priceGradient)"
          animationDuration={300}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
