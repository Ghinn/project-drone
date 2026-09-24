"use client";

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  RotateCw, 
  ClipboardCheck, 
  Cpu,
  Loader2,
  Users
} from 'lucide-react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import Drone3DViewer from './drone-model';
import { useAuth } from '@/providers/auth-provider';

interface Operator {
  id: string;
  name: string | null;
  email?: string;
}

interface DroneData {
  id: string;
  name: string | null;
  operator: Operator[] | null;
  linkFrequency?: string;
}

const T = DRONE_TOKENS;

const PREFLIGHT_ITEMS = [
  { key: 'gyro', label: 'Gyro' },
  { key: 'accelerometer', label: 'Accelerometer' },
  { key: 'magnetometer', label: 'Magnetometer' },
  { key: 'absolute_pressure', label: 'Absolute Pressure' },
  { key: 'differential_pressure', label: 'Differential Pressure' },
  { key: 'gps', label: 'GPS' },
  { key: 'optical_flow', label: 'Optical Flow' },
  { key: 'vision_position', label: 'Vision Position' },
  { key: 'laser_position', label: 'Laser Position' },
  { key: 'external_ground_truth', label: 'External Ground Truth' },
  { key: 'angular_rate_control', label: 'Angular Rate Control' },
  { key: 'attitude_stabilization', label: 'Attitude Stabilization' },
  { key: 'yaw_position', label: 'Yaw Position' },
  { key: 'z_position_control', label: 'Z Position Control' },
  { key: 'xy_position_control', label: 'XY Position Control' },
  { key: 'motor_outputs', label: 'Motor Outputs' },
  { key: 'rc_receiver', label: 'RC Receiver' },
  { key: 'gyro_cal', label: '3D Gyro Calibration' },
  { key: 'accel_cal', label: '3D Accelerometer Calibration' },
  { key: 'mag_cal', label: 'Magnetometer Calibration' },
];

const toDeg = (radians: number) => {
  if (typeof radians !== 'number') return "0.00";
  return (radians * (180 / Math.PI)).toFixed(2);
};

export default function TelemetrySection() {
  const { droneOn, setDroneOn, telemetry, droneStatus } = useMonitoringOperator();
  const { user, status } = useAuth();
  const [droneDetail, setDroneDetail] = useState<DroneData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeDroneId, setActiveDroneId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperatorAndDroneData = async () => {
      if (status === 'loading') return;
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const meRes = await fetch('/api/operator/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!meRes.ok) throw new Error(`HTTP Error Me: ${meRes.status}`);
        const meJson = await meRes.json();
        const meData = meJson.data;

        const fetchedDroneId = meData?.assignedDroneId;

        if (!fetchedDroneId) {
          return;
        }

        setActiveDroneId(fetchedDroneId);

        const droneRes = await fetch('/api/operator/my-drone', {
          method: 'GET',
          credentials: 'include',
        });

        if (!droneRes.ok) throw new Error(`HTTP Error Drone: ${droneRes.status}`);
        const droneJson = await droneRes.json();

        if (droneJson.data) {
          setDroneDetail(droneJson.data);
        }
      } catch (error) {
        console.error('Gagal memuat data operator/drone:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperatorAndDroneData();
  }, [user?.uid, status]);

  const connStatus = droneOn ? 'connected' : 'disconnected';
  const displayMode = telemetry.mode?.startsWith('Mode(') ? 'INITIALIZING' : (telemetry.mode || 'DISARMED');

  const ATTITUDE = [
    { label: 'ROLL', value: toDeg(telemetry.roll) },
    { label: 'PITCH', value: toDeg(telemetry.pitch) },
    { label: 'YAW', value: toDeg(telemetry.yaw) },
  ];

  const RC_SWITCHES = [
    { key: 'loiter', label: 'Loiter', status: telemetry.rc?.ch6 || 'OFF' },
    { key: 'auto', label: 'Auto', status: telemetry.rc?.ch7 || 'OFF' },
    { key: 'rtl', label: 'RTL', status: telemetry.rc?.ch8 || 'OFF' },
    { key: 'spray', label: 'Spray', status: telemetry.rc?.ch9 === 'ON' ? 'ON' : 'ON' },
  ];

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto text-gray-800 dark:text-gray-100 select-none pb-8">
      {/* Status Detail Device Drone */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] shadow-xs overflow-hidden">
        
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#5F802A]/15 dark:bg-[#5F802A]/25 border border-[#5F802A]/30 flex items-center justify-center text-[#5F802A]">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                Status & Detail Device Drone
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
              connStatus === 'connected'
                ? 'bg-[#EAF5D6] text-[#5D7E2A] dark:bg-[#1c2c10] dark:text-[#84cc16]'
                : 'bg-[#FCE8E6] text-[#C84030] dark:bg-[#2e1513] dark:text-[#f87171]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connStatus === 'connected' ? 'bg-[#5D7E2A] dark:bg-[#84cc16] animate-pulse' : 'bg-[#C84030]'}`} />
              {connStatus === 'connected' ? 'TERHUBUNG' : 'OFFLINE'}
            </span>

            <button 
              onClick={() => setDroneOn(!droneOn)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#5F802A] hover:bg-[#506D23] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Reconnect</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-[#222]">
            
            <div className="lg:col-span-4 flex flex-col justify-between pt-4 lg:pt-0 lg:pr-6">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                ORIENTASI 3D MODEL
              </span>

              {/* Visual Drone 3D */}
              <div className="relative w-full aspect-square max-h-[200px] mx-auto flex items-center justify-center my-2">
                <div className="w-full h-full relative flex items-center justify-center">
                  <Drone3DViewer roll={telemetry.roll} pitch={telemetry.pitch} yaw={telemetry.yaw} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {ATTITUDE.map(item => (
                  <div 
                    key={item.label}
                    className="bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-[#262626] rounded-lg py-2.5 px-2 text-center"
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold font-mono text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {item.value}°
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informasi Perangkat */}
            <div className="lg:col-span-4 flex flex-col justify-between pt-6 lg:pt-0 lg:px-6">
              <div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-4">
                  INFORMASI PERANGKAT
                </span>

                <div className="text-xs">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-500 dark:text-gray-400">Model Drone</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {isLoading ? '...' : (droneDetail?.name || 'DreamPalm')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-500 dark:text-gray-400">ID Perangkat</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {isLoading ? '...' : (activeDroneId || 'V1-001')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-500 dark:text-gray-400">Versi Firmware</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                      v4.2.1
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-500 dark:text-gray-400">Frekuensi Link</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                      {droneDetail?.linkFrequency || '5.8 GHz'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RC Switch Status */}
              <div className="pt-4 border-t border-gray-100 dark:border-[#222]">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-3">
                  RC SWITCH STATUS
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {RC_SWITCHES.map(sw => {
                    const isOn = sw.status === 'ON';
                    return (
                      <div 
                        key={sw.key}
                        className="bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-[#262626] rounded-lg px-3 py-2 flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {sw.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${
                          isOn 
                            ? 'bg-[#EAF5D6] text-[#6A9A1E] dark:bg-[#1c2c10] dark:text-[#a3e635]' 
                            : 'bg-[#FCE8E6] text-[#C84030] dark:bg-[#2e1513] dark:text-[#f87171]'
                        }`}>
                          {isOn ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Informasi Penerbangan */}
            <div className="lg:col-span-4 flex flex-col justify-start pt-6 lg:pt-0 lg:pl-6">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-4">
                INFORMASI PENERBANGAN
              </span>

              <div className="text-xs">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Mode Terbang</span>
                  <span className="font-bold text-[#5D7E2A] dark:text-[#84cc16] font-mono tracking-wide">
                    {displayMode}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Baterai</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {telemetry.battery ? `${telemetry.battery.toFixed(0)}%` : '85%'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Tegangan</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {telemetry.voltage ? `${telemetry.voltage.toFixed(1)} V` : '11.4 V'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Arus</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {telemetry.current ? `${telemetry.current.toFixed(2)} A` : '0.00 A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Ketinggian</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {telemetry.altitude ? `${telemetry.altitude.toFixed(1)} m` : '0.0 m'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Kecepatan</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {telemetry.groundSpeed ? `${telemetry.groundSpeed.toFixed(1)} m/s` : '0.0 m/s'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Preflight Section */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] shadow-xs p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck size={18} className="text-[#5D7E2A]" />
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-mono">
            PRE-FLIGHT SYSTEM CHECK
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {PREFLIGHT_ITEMS.map((item, index) => {
            const isHealthy = telemetry.sys_check 
              ? telemetry.sys_check[item.key as keyof typeof telemetry.sys_check] 
              : (index === 0);

            return (
              <div 
                key={item.key}
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#181818] border border-gray-100 dark:border-[#262626] flex items-center gap-2.5 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isHealthy 
                    ? 'bg-[#EAF5D6] text-[#6A9A1E] dark:bg-[#1c2c10] dark:text-[#a3e635]' 
                    : 'bg-[#FCE8E6] text-[#C84030] dark:bg-[#2e1513] dark:text-[#f87171]'
                }`}>
                  {isHealthy ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
