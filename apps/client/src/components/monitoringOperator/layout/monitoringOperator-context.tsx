"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type {
  MonitoringOperatorTab,
  NavItem,
  TelemetryData
} from './monitoringOperator-types';
import { createEventSource } from '@/lib/utils';

export type SseConnectionStatus = 'connecting' | 'connected' | 'error' | 'closed';

export const defaultTelemetry: TelemetryData = {
  roll: 0, pitch: 0, yaw: 0, altitude: 0, latitude: 0, longitude: 0,
  groundSpeed: 0, climbRate: 0, distanceToHome: 0, mode: 'DISARMED', 
  flightMode: 'standby',
  battery: 0, voltage: 0, current: 0,
  sys_check: {
    gyro: false, accelerometer: false, magnetometer: false,
    absolute_pressure: false, differential_pressure: false,
    gps: false, optical_flow: false, vision_position: false,
    laser_position: false, external_ground_truth: false,
    angular_rate_control: false, attitude_stabilization: false,
    yaw_position: false, z_position_control: false,
    xy_position_control: false, motor_outputs: false,
    rc_receiver: false, gyro_cal: false, accel_cal: false, mag_cal: false
  },
  rc: { ch6: 'OFF', ch7: 'OFF', ch8: 'OFF', ch9: 'OFF' },
  radio: { rssi: 0, remrssi: 0, noise: 0, txbuf: 0 } 
};

type MonitoringOperatorContextValue = {
  activeTab: MonitoringOperatorTab;
  setActiveTab: (tab: MonitoringOperatorTab) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  telemetry: TelemetryData;
  flightMode: string;
  droneStatus: 'online' | 'offline' | 'unknown';
  latestSnapshot: any;
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

const SSE_MAX_CONSECUTIVE_ERRORS = 3;

// Custom Hook untuk menangkap SSE
export const useTelemetrySSE = (droneId?: string) => {
  const [telemetry, setTelemetry] = useState<TelemetryData>(defaultTelemetry);
  const [latestSnapshot, setLatestSnapshot] = useState<any>(null);
  const [droneStatus, setDroneStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  const [connectionStatus, setConnectionStatus] = useState<SseConnectionStatus>('connecting');
  const consecutiveErrorsRef = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    consecutiveErrorsRef.current = 0;
    setConnectionStatus('connecting');

    // URL Endpoint Topic_MQTT
    const endpoint = droneId 
      ? `/api/data/stream?droneId=${droneId}`
      : `/api/data/stream`;

    // Tambahkan parameter `true` agar tidak ditimpa oleh NEXT_PUBLIC_API_URL
    const eventSource = createEventSource(endpoint, true);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      consecutiveErrorsRef.current = 0;
      setConnectionStatus('connected');
      console.log(`[SSE] Terhubung ke stream perangkat ${droneId ?? 'ditugaskan'}`);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        if (parsed.type === 'telemetry') {
          setTelemetry((prev) => ({
             ...defaultTelemetry,
             ...parsed.data
          }));
        } else if (parsed.type === 'status') {
          setDroneStatus(parsed.data.status);
        } else if (parsed.type === 'snapshot:new') {
          setLatestSnapshot(parsed.data);
        }
      } catch (error) {
        console.error('[SSE] Gagal memparsing data:', error);
      }
    };

    eventSource.onerror = () => {
      consecutiveErrorsRef.current += 1;
      setDroneStatus('unknown');
      setConnectionStatus('error');

      if (consecutiveErrorsRef.current === 1) {
        console.error(
          `[SSE] Koneksi gagal. Kemungkinan penyebab:\n` +
          `  1. CORS: Server mengembalikan 'Access-Control-Allow-Origin: *' ` +
              `sementara EventSource menggunakan { withCredentials: true }.\n` +
          `  2. Auth: Cookie sesi tidak dikirim (mismatch domain atau secure flag).\n` +
          `  3. Server: Backend tidak berjalan atau endpoint tidak tersedia.\n` +
          `Memeriksa ulang konfigurasi server...`
        );
      }

      if (consecutiveErrorsRef.current >= SSE_MAX_CONSECUTIVE_ERRORS) {
        console.error(
          `[SSE] ${SSE_MAX_CONSECUTIVE_ERRORS} kegagalan berturut-turut terdeteksi. ` +
          `EventSource dihentikan. Periksa CORS dan autentikasi server.`
        );
        eventSource.close();
        setConnectionStatus('closed');
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [droneId]);

  return { telemetry, flightMode: telemetry.flightMode, droneStatus, connectionStatus, latestSnapshot };
};