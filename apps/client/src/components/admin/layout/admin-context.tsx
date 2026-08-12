'use client';

import { createContext, useContext } from 'react';
import type {
  AdminTab,
  NavItem
} from '@/components/admin/layout/admin-types';

type AdminContextValue = {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  navItems: NavItem[];
  getPageTitle: () => string;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminContext(): AdminContextValue {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdminContext must be used within AdminShell.');
  }

  return context;
}