import { ReactNode } from 'react';

export type MonitoringOperatorTab = 'dashboard' | 'camera' | 'ai-log' | 'orientation' | 'settings';

export interface NavItem {
  id: MonitoringOperatorTab;
  label: string;
}

export interface AlertItem {
  id: number;
  level: 'critical' | 'warning' | 'caution' | 'ok';
  title: string;
  note: string;
  loc: string;
  conf: number;
  cls: string;
  time: string;
}

export const DRONE_TOKENS = {
  green:       '#84994F',
  greenLight:  '#C1D343',
  greenBright: '#A7D82E',
  red:         '#990000',
  orange:      '#FF6600',
  amber:       '#FCB53B',
  brick:       '#A72703',
};