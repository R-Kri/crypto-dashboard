'use client';

import { Dashboard } from "@/components/dashboard/Dashboard";
import { SideBar } from "@/components/layout/SideBar";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState } from "react";

type ActiveView = 'dashboard' | 'analytics' | 'notifications' | 'settings';

export default function Home() {
  const [selectedSymbol] = useState('btcusdt');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  
  const { isConnected } = useWebSocket({
    symbol: selectedSymbol,
    aggregationInterval: 2000,
    maxDataPoints: 100,
  });

  return (
    <main className="flex min-h-screen bg-[#1d232a]">
      <SideBar 
        isConnected={isConnected} 
        activePairs={6}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <Dashboard activeView={activeView} />
    </main>
  );
}
