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
  green:       '#6B8E23',   // Olive Green (primary)
  greenLight:  '#8BAE3A',   // Olive Green Light
  greenBright: '#9BBF4A',   // Olive Green Bright
  red:         '#C8553D',   // Pastel Rust (disease/alert)
  orange:      '#D9644E',   // Rust Orange
  amber:       '#FCB53B',   // Amber (caution)
  brick:       '#C8553D',   // Pastel Rust
  violet:      '#7C3AED',   // Violet (AI/tech)
  dark:        '#0F172A',   // Slate Dark
};