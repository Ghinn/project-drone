import { ReactNode } from 'react';

export type AdminTab = 'overview' | 'users' | 'logs' | 'settings';

export interface NavItem {
  id: AdminTab;
  label: string;
  icon: ReactNode;
}