"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import type {
  MonitoringOperatorTab,
  NavItem
} from './monitoringOperator-types';

export interface DroneTelemetry {
  roll: number; pitch: number; yaw: number;
  altitude: number; latitude: number; longitude: number;
  groundSpeed: number; mode: string;
  battery: number; voltage: number; current: number;

  sys_check: {
    gyro: boolean; accelerometer: boolean; magnetometer: boolean;
    absolute_pressure: boolean; differential_pressure: boolean;
    gps: boolean; optical_flow: boolean; vision_position: boolean;
    laser_position: boolean; external_ground_truth: boolean;
    angular_rate_control: boolean; attitude_stabilization: boolean;
    yaw_position: boolean; z_position_control: boolean;
    xy_position_control: boolean; motor_outputs: boolean;
    rc_receiver: boolean; gyro_cal: boolean; accel_cal: boolean; mag_cal: boolean;
  };
  rc: {
    ch6: string; ch7: string; ch8: string; ch9: string;
  };
}

export const defaultTelemetry: DroneTelemetry = {
  roll: 0, pitch: 0, yaw: 0, altitude: 0, latitude: 0, longitude: 0,
  groundSpeed: 0, mode: 'DISARMED', battery: 0, voltage: 0, current: 0,
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
  rc: { ch6: 'OFF', ch7: 'OFF', ch8: 'OFF', ch9: 'OFF' }
};

type MonitoringOperatorContextValue = {
  activeTab: MonitoringOperatorTab;
  setActiveTab: (tab: MonitoringOperatorTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;

  telemetry: DroneTelemetry; 
  droneStatus: 'online' | 'offline' | 'unknown';
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

// Custom Hook untuk menangkap SSE
export const useTelemetrySSE = (apiUrl: string, droneId?: string) => {
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(defaultTelemetry);
  const [droneStatus, setDroneStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    if (!apiUrl) return; 

    // URL Endpoint Topic_MQTT
    const streamUrl = droneId 
      ? `${apiUrl}/api/drone/telemetryState/stream?droneId=${droneId}`
      : `${apiUrl}/api/drone/telemetryState/stream`;

    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.onopen = () => console.log(`[SSE] Terhubung ke stream perangkat ${droneId ?? 'ditugaskan'}`);
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        if (parsed.type === 'telemetry') {
          setTelemetry(parsed.data);
        } else if (parsed.type === 'status') {
          setDroneStatus(parsed.data.status);
        }
      } catch (error) {
        console.error('[SSE] Gagal memparsing data:', error);
      }
    };

    eventSource.onerror = (error) => {
        console.error('[SSE] Koneksi terputus. Mencoba menghubungkan kembali...', error);
        setDroneStatus('unknown');
    }

    return () => {
      eventSource.close();
    };
  }, [apiUrl, droneId]);

  return { telemetry, droneStatus };
};