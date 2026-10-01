import { ReactNode } from 'react';

// 5 menu: dashboard | telemetri | pantau-drone | log-prediksi | settings
export type MonitoringOperatorTab = 'dashboard' | 'telemetri' | 'pantau-drone' | 'log-prediksi' | 'settings';

export interface NavItem {
  id: MonitoringOperatorTab;
  label: string;       // Bahasa Indonesia (primary)
  labelEn: string;     // Bahasa Inggris (sub-label)
  icon: string;        // SVG path key
}

export interface AlertItem {
  id: number;
  // level: 'critical' | 'warning' | 'caution' | 'ok';
  level: 'healthy' | 'unhealthy';
  title: string;
  note: string;
  loc: string;
  conf: number;
  cls: string;
  time: string;
}

export interface TelemetryData {
  roll: number;
  pitch: number;
  yaw: number;
  altitude: number;
  latitude: number;
  longitude: number;
  groundSpeed: number;
  climbRate: number;
  distanceToHome: number;
  mode: string;
  flightMode: string;
  battery: number;
  voltage: number;
  current: number;
  sys_check?: SysCheckData;
  rc?: {
    ch6: string;
    ch7: string;
    ch8: string;
    ch9: string;
  };
  radio?: {
    rssi: number;
    remrssi: number;
    noise: number;
    txbuf: number;
  };
}

export interface SysCheckData {
  gyro: boolean;
  accelerometer: boolean;
  magnetometer: boolean;
  absolute_pressure: boolean;
  differential_pressure: boolean;
  gps: boolean;
  optical_flow: boolean;
  vision_position: boolean;
  laser_position: boolean;
  external_ground_truth: boolean;
  angular_rate_control: boolean;
  attitude_stabilization: boolean;
  yaw_position: boolean;
  z_position_control: boolean;
  xy_position_control: boolean;
  motor_outputs: boolean;
  rc_receiver: boolean;
  gyro_cal: boolean;
  accel_cal: boolean;
  mag_cal: boolean;
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
  healthStatus: 'healthy' | 'unhealthy';
  healthy: number;      // 12.4
  unhealthy: number;    // 87.6
  disease: string;
  recommendation: string;
  snapshotUrl: string;
  ndviUrl: string;
  ndviValue?: number;
  freqLink?: number;
  distance?: number;
  elevationSpeed?: number;
  // Telemetri drone saat snapshot diambil
  telemetry: {
    battery: number;
    altitude: number;
    speed: number;
    gpsSignal: string;
    linkQuality: string;
  };
  // Koordinat GPS untuk peta (opsional, diisi backend)
  lat?: number;
  lng?: number;
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