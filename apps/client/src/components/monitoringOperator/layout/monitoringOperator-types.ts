import { ReactNode } from 'react';

export type MonitoringOperatorTab = 'dashboard' | 'camera' | 'ai-log' | 'settings';

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
  green:       '#6B8E23', // Olive Green
  greenLight:  '#8BAE3A',
  greenBright: '#9BBF4A',
  red:         '#C8553D', // Pastel Rust / Warning
  orange:      '#D9644E',
  amber:       '#FCB53B',
  brick:       '#C8553D',
};