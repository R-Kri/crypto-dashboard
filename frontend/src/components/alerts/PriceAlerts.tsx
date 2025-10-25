/**
 * Price Alerts Component
 * Manages and displays price alerts for cryptocurrencies
 */
'use client';

import React, { useState, useEffect } from 'react';
import { PriceAlert } from '@/types';
import { socket, SOCKET_EVENTS } from '@/lib/socket';
import { formatPrice } from '@/lib/utils';

interface PriceAlertsProps {
    currentSymbol: string;
    currentPrice: number;
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ currentSymbol, currentPrice }) => {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState<'above' | 'below'>('above');

    // Fetch alerts on mount
    useEffect(() => {
        socket.emit(SOCKET_EVENTS.GET_ALERTS);

        // Listen for alerts list
        const handleAlertsList = (data: { alerts: PriceAlert[] }) => {
            setAlerts(data.alerts);
        };

        // Listen for new alert created
        const handleAlertCreated = (data: { success: boolean; alert: PriceAlert }) => {
            if (data.success) {
                setAlerts(prev => [...prev, data.alert]);
                setShowForm(false);
                setTargetPrice('');
            }
        };

        // Listen for alert deleted
        const handleAlertDeleted = (data: { success: boolean; alertId: string }) => {
            if (data.success) {
                setAlerts(prev => prev.filter(alert => alert.id !== data.alertId));
            }
        };

        // Listen for triggered alerts
        const handlePriceAlert = (data: { alerts: PriceAlert[]; symbol: string; currentPrice: number }) => {
            console.log('Price alert triggered!', data);
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                data.alerts.forEach(alert => {
                    new Notification('Price Alert Triggered!', {
                        body: `${alert.symbol.toUpperCase()}: ${formatPrice(data.currentPrice)} ${alert.condition} ${formatPrice(alert.targetPrice)}`,
                        icon: '/crypto-icon.png',
                    });
                });
            }
        };

        socket.on(SOCKET_EVENTS.ALERTS_LIST, handleAlertsList);
        socket.on(SOCKET_EVENTS.ALERT_CREATED, handleAlertCreated);
        socket.on(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);
        socket.on(SOCKET_EVENTS.PRICE_ALERT, handlePriceAlert);

        return () => {
            socket.off(SOCKET_EVENTS.ALERTS_LIST, handleAlertsList);
            socket.off(SOCKET_EVENTS.ALERT_CREATED, handleAlertCreated);
            socket.off(SOCKET_EVENTS.ALERT_DELETED, handleAlertDeleted);
            socket.off(SOCKET_EVENTS.PRICE_ALERT, handlePriceAlert);
        };
    }, []);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleCreateAlert = (e: React.FormEvent) => {
        e.preventDefault();

        const price = parseFloat(targetPrice);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        socket.emit(SOCKET_EVENTS.CREATE_ALERT, {
            symbol: currentSymbol,
            targetPrice: price,
            condition,
        });
    };

    const handleDeleteAlert = (alertId: string) => {
        socket.emit(SOCKET_EVENTS.DELETE_ALERT, alertId);
    };

    const activeAlerts = alerts.filter(a => a.symbol === currentSymbol && !a.triggered);
    const hasAlerts = activeAlerts.length > 0;

    return (
        <div className="relative">
            {/* Alert Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center gap-2 px-4 py-2 bg-[#191e24] border border-gray-700
                        rounded-lg hover:border-purple-500/50 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-white font-medium">Alerts</span>
                {hasAlerts && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs
                                rounded-full flex items-center justify-center font-bold">
                        {activeAlerts.length}
                    </span>
                )}
            </button>

            {/* Alerts Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

                    {/* Panel */}
                    <div className="absolute top-full right-0 mt-2 w-80 bg-[#191e24] border border-gray-700
                                rounded-lg shadow-xl z-20 overflow-hidden">
                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm
                                            rounded-lg transition-colors"
                                >
                                    {showForm ? 'Cancel' : 'New Alert'}
                                </button>
                            </div>

                            {/* Create Alert Form */}
                            {showForm && (
                                <form onSubmit={handleCreateAlert} className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Symbol: {currentSymbol.toUpperCase()}
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Condition
                                            </label>
                                            <select
                                                value={condition}
                                                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg
                                                        border border-gray-600 focus:border-purple-500
                                                        focus:outline-none"
                                            >
                                                <option value="above">Price goes above</option>
                                                <option value="below">Price goes below</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Target Price
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                placeholder={`Current: ${formatPrice(currentPrice)}`}
                                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg
                                                        border border-gray-600 focus:border-purple-500
                                                        focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white
                                                    rounded-lg transition-colors font-medium"
                                        >
                                            Create Alert
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Alerts List */}
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {activeAlerts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        <p>No active alerts for {currentSymbol.toUpperCase()}</p>
                                    </div>
                                ) : (
                                    activeAlerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="p-3 bg-gray-800/50 rounded-lg border border-gray-700
                                                    hover:border-purple-500/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded
                                                                    ${alert.condition === 'above'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-red-500/20 text-red-400'}`}
                                                        >
                                                            {alert.condition}
                                                        </span>
                                                        <span className="text-white font-semibold">
                                                            {formatPrice(alert.targetPrice)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        Created {new Date(alert.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAlert(alert.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete alert"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
