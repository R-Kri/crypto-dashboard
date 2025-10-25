/**
 * Cryptocurrency Selector Component
 * Allows users to switch between different cryptocurrency pairs
 */
"use client";

import React, { useState, useEffect } from "react";
import { CryptoSymbol } from "@/types";

interface CryptoSelectorProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
}

export const CryptoSelector: React.FC<CryptoSelectorProps> = ({
    selectedSymbol,
    onSymbolChange,
}) => {
    const [symbols, setSymbols] = useState<CryptoSymbol[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch available symbols from backend
    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
                    }/api/symbols`
                );
                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    setSymbols(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch symbols:", error);
                // Fallback to default symbols
                setSymbols([
                    {
                        symbol: "btcusdt",
                        displayName: "BTC/USDT",
                        baseAsset: "BTC",
                        quoteAsset: "USDT",
                    },
                    {
                        symbol: "ethusdt",
                        displayName: "ETH/USDT",
                        baseAsset: "ETH",
                        quoteAsset: "USDT",
                    },
                    {
                        symbol: "bnbusdt",
                        displayName: "BNB/USDT",
                        baseAsset: "BNB",
                        quoteAsset: "USDT",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchSymbols();
    }, []);

    const currentSymbol =
        symbols.find((s) => s.symbol === selectedSymbol) || symbols[0];

    const handleSelect = (symbol: string) => {
        onSymbolChange(symbol);
        setIsOpen(false);
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-700 h-10 w-40 rounded-lg" />;
    }

    return (
        <div className="relative">
            {/* Selected Symbol Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-[#191e24] border border-gray-700
                         rounded-lg hover:border-yellow-500/50 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600
                                  rounded-full flex items-center justify-center font-bold text-sm"
                    >
                        {currentSymbol?.baseAsset?.substring(0, 1)}
                    </div>
                    <span className="text-white font-semibold">
                        {currentSymbol?.displayName || "Select"}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div
                        className="absolute top-full left-0 mt-2 w-64 bg-[#191e24] border border-gray-700
                                  rounded-lg shadow-xl z-20 overflow-hidden"
                    >
                        <div className="p-2">
                            <div className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wide">
                                Select Cryptocurrency
                            </div>
                            <div className="space-y-1">
                                {symbols.map((symbol) => (
                                    <button
                                        key={symbol.symbol}
                                        onClick={() => handleSelect(symbol.symbol)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                                  transition-all duration-150 text-left
                                                  ${selectedSymbol ===
                                                symbol.symbol
                                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                : "hover:bg-gray-700/50 text-gray-300"
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center
                                                       font-bold text-sm
                                                       ${selectedSymbol ===
                                                    symbol.symbol
                                                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                                                    : "bg-gradient-to-br from-gray-600 to-gray-700"
                                                }`}
                                        >
                                            {symbol.baseAsset.substring(0, 1)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold">{symbol.displayName}</div>
                                            <div className="text-xs text-gray-500">
                                                {symbol.baseAsset}
                                            </div>
                                        </div>
                                        {selectedSymbol === symbol.symbol && (
                                            <svg
                                                className="w-5 h-5 text-yellow-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
