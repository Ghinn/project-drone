"use client";

import React, { useState, useEffect } from 'react';
import { MonitoringOperatorContext, useTelemetrySSE } from './monitoringOperator-context';
import type { MonitoringOperatorTab, NavItem } from './monitoringOperator-types';
import MonitoringOperatorNavbar from './monitoringOperator-sidebar';
import AppHeader from './app-header';

export default function MonitoringOperatorShell({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<MonitoringOperatorTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [spray] = useState(62);
  const [droneOn, setDroneOn] = useState(true);

  // Close sidebar di mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Direct Request ke Express Backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Panggil Custom Hook SSE
  const { telemetry, droneStatus } = useTelemetrySSE(API_URL, 'v1-001');

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', labelEn: 'Overview', icon: 'dashboard' },
    { id: 'telemetri', label: 'Telemetri', labelEn: 'Telemetry', icon: 'telemetry' },
    { id: 'pantau-drone', label: 'Pantau Drone', labelEn: 'Drone Monitor', icon: 'drone' },
    { id: 'log-prediksi', label: 'Log Prediksi', labelEn: 'Prediction Log', icon: 'listClock' },
    { id: 'settings', label: 'Pengaturan', labelEn: 'Settings', icon: 'settings' },
  ];

  const getPageTitle = () => {
    const current = navItems.find(n => n.id === activeTab);
    return current ? current.label : 'Dashboard';
  };

  const getPageTitleEn = () => {
    const current = navItems.find(n => n.id === activeTab);
    return current ? current.labelEn : 'Overview';
  };

  const setCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      setIsSidebarOpen(prev => !val(!prev));
    } else {
      setIsSidebarOpen(!val);
    }
  };

  return (
    <MonitoringOperatorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        collapsed: !isSidebarOpen,
        setCollapsed,
        telemetry,
        droneStatus,
        spray,
        droneOn,
        setDroneOn,
        navItems,
        getPageTitle,
        getPageTitleEn,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] font-sans">
        <MonitoringOperatorNavbar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-5">
            {children}
          </main>
        </div>
      </div>
    </MonitoringOperatorContext.Provider>
  );
}