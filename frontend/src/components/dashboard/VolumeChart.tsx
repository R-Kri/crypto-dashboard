/**
 * Volume Chart Component
 * Real-time bar chart for volume visualization
 */
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartDataPoint } from '@/types';
import { formatVolume } from '@/lib/utils';

interface VolumeChartProps {
  data: ChartDataPoint[];
}

export const VolumeChart = ({ data }: VolumeChartProps) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#191e24] border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-2">{data.time}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-purple-400">
              Volume: {formatVolume(data.volume)} BTC
            </p>
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

  // Calculate average volume for color coding
  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
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
          tickFormatter={(value) => formatVolume(value)}
        />

        <Tooltip content={<CustomTooltip />} />

        <Bar
          dataKey="volume"
          radius={[4, 4, 0, 0]}
          animationDuration={300}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.volume > avgVolume ? '#a855f7' : '#6b21a8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};