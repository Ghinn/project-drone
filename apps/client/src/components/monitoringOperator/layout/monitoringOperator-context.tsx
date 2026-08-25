"use client";
import { createContext, useContext } from 'react';
import type {
  MonitoringOperatorTab,
  NavItem
} from './monitoringOperator-types';

type MonitoringOperatorContextValue = {
  activeTab: MonitoringOperatorTab;
  setActiveTab: (tab: MonitoringOperatorTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  battery: number;
  spray: number;
  droneOn: boolean;
  setDroneOn: (on: boolean) => void;
  navItems: NavItem[];
  getPageTitle: () => string;
  getPageTitleEn: () => string;
};

export const MonitoringOperatorContext = createContext<MonitoringOperatorContextValue | null>(null);

export const useMonitoringOperator = () => {
  const context = useContext(MonitoringOperatorContext);

  if (!context) {
    throw new Error('useMonitoringOperator must be used within MonitoringOperatorShell');
  }
  
  return context;

};