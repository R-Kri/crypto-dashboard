/**
 * Settings Panel Component
 * Configure dashboard preferences and settings
 */
'use client';

import React, { useState } from 'react';

export const SettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState({
        theme: 'dark',
        soundEnabled: true,
        notificationsEnabled: true,
        autoRefresh: true,
        refreshInterval: 2000,
        maxDataPoints: 100,
        showVolume: true,
        show24hRange: true,
        compactMode: false,
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('dashboard_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            const defaultSettings = {
                theme: 'dark',
                soundEnabled: true,
                notificationsEnabled: true,
                autoRefresh: true,
                refreshInterval: 2000,
                maxDataPoints: 100,
                showVolume: true,
                show24hRange: true,
                compactMode: false,
            };
            setSettings(defaultSettings);
            localStorage.removeItem('dashboard_settings');
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-gray-400 text-sm">Customize your dashboard experience</p>
            </div>

            {/* Appearance Settings */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-gray-700 mb-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Appearance
                </h3>

                <div className="space-y-4">
                    {/* Theme */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Theme</div>
                            <div className="text-sm text-gray-400">Choose your preferred color scheme</div>
                        </div>
                        <select
                            value={settings.theme}
                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light (Coming Soon)</option>
                        </select>
                    </div>

                    {/* Compact Mode */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div>
                            <div className="text-white font-medium">Compact Mode</div>
                            <div className="text-sm text-gray-400">Reduce spacing and padding</div>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input
                                type="checkbox"
                                checked={settings.compactMode}
                                onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-full h-full bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Data & Performance */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-gray-700 mb-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Data & Performance
                </h3>

                <div className="space-y-4">
                    {/* Auto Refresh */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Auto Refresh</div>
                            <div className="text-sm text-gray-400">Automatically update data</div>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input
                                type="checkbox"
                                checked={settings.autoRefresh}
                                onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-full h-full bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    {/* Refresh Interval */}
                    <div className="pt-4 border-t border-gray-700">
                        <div className="text-white font-medium mb-2">Refresh Interval</div>
                        <div className="text-sm text-gray-400 mb-3">How often to aggregate data (milliseconds)</div>
                        <input
                            type="range"
                            min="1000"
                            max="5000"
                            step="500"
                            value={settings.refreshInterval}
                            onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>1s</span>
                            <span className="text-blue-400 font-medium">{settings.refreshInterval}ms</span>
                            <span>5s</span>
                        </div>
                    </div>

                    {/* Max Data Points */}
                    <div className="pt-4 border-t border-gray-700">
                        <div className="text-white font-medium mb-2">Chart Data Points</div>
                        <div className="text-sm text-gray-400 mb-3">Maximum points to display on charts</div>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            step="10"
                            value={settings.maxDataPoints}
                            onChange={(e) => setSettings({ ...settings, maxDataPoints: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>50</span>
                            <span className="text-purple-400 font-medium">{settings.maxDataPoints}</span>
                            <span>200</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Settings */}
            <div className="bg-[#191e24] rounded-xl p-6 border border-gray-700 mb-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                </h3>

                <div className="space-y-4">
                    {/* Browser Notifications */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Browser Notifications</div>
                            <div className="text-sm text-gray-400">Show alerts in browser</div>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input
                                type="checkbox"
                                checked={settings.notificationsEnabled}
                                onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-full h-full bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                    </div>

                    {/* Sound */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div>
                            <div className="text-white font-medium">Sound Alerts</div>
                            <div className="text-sm text-gray-400">Play sound for notifications</div>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                            <input
                                type="checkbox"
                                checked={settings.soundEnabled}
                                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-full h-full bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    {saved ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved!
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Settings
                        </>
                    )}
                </button>
                <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Reset
                </button>
            </div>

            {saved && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Settings saved successfully! Refresh the page to apply changes.
                    </p>
                </div>
            )}
        </div>
    );
};
