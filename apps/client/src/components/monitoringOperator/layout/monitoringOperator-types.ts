import { ReactNode } from 'react';

// 4 menu baru: dashboard | pantau-drone | log-prediksi | settings
export type MonitoringOperatorTab = 'dashboard' | 'pantau-drone' | 'log-prediksi' | 'settings';

export interface NavItem {
  id: MonitoringOperatorTab;
  label: string;       // Bahasa Indonesia (primary)
  labelEn: string;     // Bahasa Inggris (sub-label)
  icon: string;        // SVG path key
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

// Tipe data log prediksi (record satu sesi prediksi)
export interface PredictionLogEntry {
  id: string;           // LOG-001, LOG-002 dst
  sessionId: string;    // Misi #037
  timestamp: string;    // ISO string
  time: string;         // 14:32:17
  date: string;         // 14 Agustus 2026
  location: string;     // Blok A-12 Baris 8
  gps: string;          // 3°21'14.2"N 114°35'48.9"E
  classification: string; // BSR Parah / Sehat
  confidence: number;   // 94
  severity: 'ok' | 'caution' | 'warning' | 'critical';
  healthy: number;      // 12.4
  unhealthy: number;    // 87.6
  disease: string;
  recommendation: string;
  snapshotUrl: string;
  ndviUrl: string;
  // Telemetri drone saat snapshot diambil
  telemetry: {
    battery: number;
    spray: number;
    altitude: number;
    speed: number;
    gpsSignal: string;
    linkQuality: string;
  };
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