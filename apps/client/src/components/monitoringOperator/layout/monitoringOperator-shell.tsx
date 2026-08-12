"use client";

import React, { useState, useEffect } from 'react';
import { MonitoringOperatorContext } from './monitoringOperator-context';
import type { MonitoringOperatorTab, NavItem } from './monitoringOperator-types';
import MonitoringOperatorNavbar from './monitoringOperator-sidebar';
import AppHeader from './app-header';

export default function MonitoringOperatorShell({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<MonitoringOperatorTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [battery, setBattery] = useState(85);
  const [spray] = useState(62);

  // Simulasi penurunan baterai drone
  useEffect(() => {
    const t = setInterval(() => {
      setBattery(b => Math.max(10, +(b - 0.05).toFixed(1)));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'camera', label: 'Live Camera' },
    { id: 'ai-log', label: 'AI Prediction Log' },
    { id: 'settings', label: 'Settings' },
  ];

  const getPageTitle = () => {
    const current = navItems.find(n => n.id === activeTab);
    return current ? current.label : 'Dashboard';
  };

  return (
    <MonitoringOperatorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        collapsed,
        setCollapsed,
        battery,
        spray,
        navItems,
        getPageTitle,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] font-sans">
        <MonitoringOperatorNavbar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-5">
            {children}
          </main>
        </div>
      </div>
    </MonitoringOperatorContext.Provider>
  );
}