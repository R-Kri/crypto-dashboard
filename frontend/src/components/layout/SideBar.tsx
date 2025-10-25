/**
 * Enhanced Sidebar Component
 * Navigation and information panel for the dashboard
 */
'use client';

import React, { useState, useEffect } from 'react';
import { AiOutlineDashboard } from "react-icons/ai";
import { IoAnalytics, IoSettingsOutline } from "react-icons/io5";
import { IoIosNotificationsOutline } from "react-icons/io";
import { socket, SOCKET_EVENTS } from '@/lib/socket';

type ActiveView = 'dashboard' | 'analytics' | 'notifications' | 'settings';

interface MenuItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  action?: () => void;
}

interface SideBarProps {
  activePairs?: number;
  isConnected?: boolean;
  activeView?: ActiveView;
  onViewChange?: (view: ActiveView) => void;
}

export const SideBar = ({ activePairs = 0, isConnected = false, activeView = 'dashboard', onViewChange }: SideBarProps) => {
  const [activeItem, setActiveItem] = useState<ActiveView>(activeView);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [supportedPairsCount, setSupportedPairsCount] = useState(6);

  // Fetch supported pairs count from backend
  useEffect(() => {
    const fetchPairsCount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'}/api/symbols`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSupportedPairsCount(data.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch pairs count:', error);
      }
    };

    fetchPairsCount();

    // Listen for price alerts to update notification count
    const handlePriceAlert = () => {
      setNotificationCount(prev => prev + 1);
    };

    socket.on(SOCKET_EVENTS.PRICE_ALERT, handlePriceAlert);

    return () => {
      socket.off(SOCKET_EVENTS.PRICE_ALERT, handlePriceAlert);
    };
  }, []);

  const handleMenuClick = (id: ActiveView, action?: () => void) => {
    setActiveItem(id);
    if (onViewChange) {
      onViewChange(id);
    }
    if (action) {
      action();
    }
    // Clear notifications when opening notifications panel
    if (id === 'notifications') {
      setNotificationCount(0);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <AiOutlineDashboard size={24} />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <IoAnalytics size={24} />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <IoIosNotificationsOutline size={24} />,
      badge: notificationCount > 0 ? notificationCount : undefined,
    },
  ];

  return (
    <div className={`min-h-[95vh] ${collapsed ? 'min-w-[80px]' : 'min-w-[280px]'} 
                    hidden md:flex bg-[#191e24] rounded-xl m-4 flex-col 
                    border border-gray-800 transition-all duration-300 animate-slide-in-left`}>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 
                            rounded-lg flex items-center justify-center font-bold text-white">
                C
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Crypto</h2>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id, item.action)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                         transition-all duration-200 group relative
                         ${activeItem === item.id
                           ? 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 text-yellow-400'
                           : 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                         }`}
              title={`Go to ${item.label}`}
            >
              <span className={activeItem === item.id ? 'text-yellow-400' : 'text-gray-400'}>
                {item.icon}
              </span>
              
              {!collapsed && (
                <>
                  <span className="text-base font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 
                               text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Quick Stats - Dynamic */}
        {!collapsed && (
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Market Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Pairs</span>
                <span className="text-white font-medium">{supportedPairsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Active</span>
                <span className={`font-medium flex items-center gap-1 ${
                  isConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {activePairs > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active Streams</span>
                  <span className="text-blue-400 font-medium">{activePairs}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => handleMenuClick('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                     transition-all duration-200
                     ${activeItem === 'settings'
                       ? 'bg-gray-800 text-white'
                       : 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                     }`}
          title="Settings"
        >
          <IoSettingsOutline size={24} />
          {!collapsed && (
            <span className="text-base font-medium">Settings</span>
          )}
        </button>
      </div>
    </div>
  );
};
