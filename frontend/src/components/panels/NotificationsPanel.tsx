/**
 * Notifications Panel Component
 * Shows system notifications and price alert history
 */
'use client';

import React, { useState, useEffect } from 'react';
import { socket, SOCKET_EVENTS } from '@/lib/socket';
import { formatPrice } from '@/lib/utils';

interface Notification {
    id: string;
    type: 'alert' | 'system' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    symbol?: string;
    price?: number;
}

export const NotificationsPanel: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'system',
            title: 'Connected to Server',
            message: 'Successfully connected to real-time data stream',
            timestamp: Date.now() - 60000,
            read: false,
        },
        {
            id: '2',
            type: 'info',
            title: 'Welcome to Crypto Dashboard',
            message: 'Track real-time cryptocurrency prices and set custom alerts',
            timestamp: Date.now() - 120000,
            read: false,
        },
    ]);

    const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');

    useEffect(() => {
        // Listen for price alerts
        const handlePriceAlert = (data: any) => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                type: 'alert',
                title: 'Price Alert Triggered!',
                message: `${data.symbol?.toUpperCase()} reached ${formatPrice(data.currentPrice)}`,
                timestamp: Date.now(),
                read: false,
                symbol: data.symbol,
                price: data.currentPrice,
            };
            setNotifications(prev => [newNotification, ...prev]);
        };

        // Listen for connection events
        const handleConnect = () => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                type: 'system',
                title: 'Reconnected',
                message: 'Connection to server restored',
                timestamp: Date.now(),
                read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
        };

        const handleDisconnect = () => {
            const newNotification: Notification = {
                id: Date.now().toString(),
                type: 'system',
                title: 'Connection Lost',
                message: 'Attempting to reconnect...',
                timestamp: Date.now(),
                read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
        };

        socket.on(SOCKET_EVENTS.PRICE_ALERT, handlePriceAlert);
        socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
        socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);

        return () => {
            socket.off(SOCKET_EVENTS.PRICE_ALERT, handlePriceAlert);
            socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
            socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
        };
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const clearAll = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'alerts') return notif.type === 'alert';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'alert':
                return (
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                );
            case 'system':
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Notifications</h2>
                        <p className="text-gray-400 text-sm">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {(['all', 'unread', 'alerts'] as const).map(filterType => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === filterType
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-400 text-lg">No notifications</p>
                        <p className="text-gray-500 text-sm mt-2">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`bg-[#191e24] rounded-xl p-4 border transition-all hover:border-gray-600 ${
                                notif.read ? 'border-gray-800' : 'border-yellow-500/30 bg-yellow-500/5'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {getIcon(notif.type)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-white font-semibold">{notif.title}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {getTimeAgo(notif.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{notif.message}</p>
                                    <div className="flex items-center gap-2">
                                        {!notif.read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif.id)}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
