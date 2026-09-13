import { ReactNode } from 'react';

export type AdminTab = 'overview' | 'users' | 'drones' | 'logs' | 'settings';

export interface NavItem {
  id: AdminTab;
  label: string;
  icon: ReactNode;
  href: string;
}