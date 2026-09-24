"use client";

import { useState, useEffect } from 'react';
import { Users, X, Loader2, RefreshCw } from 'lucide-react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import Drone3DViewer from '../sections/drone-model'; 
import { useAuth } from '@/providers/auth-provider';

interface Operator {
  id: string;
  name: string | null;
  email?: string; // Opsional: Sesuaikan dengan data backend
}

interface DroneData {
  id: string;
  name: string | null;
  operator: Operator[] | null;
  linkFrequency?: string;
}

const T = DRONE_TOKENS;

const STAT_CARDS = [
  { label: 'Total Pohon Terdeteksi', labelEn: 'Total Trees Detected', value: '1.248', unit: 'pohon', icon: '🌴', gradient: `linear-gradient(135deg, ${T.green}dd, #166534cc)`, textColor: '#bbf7d0' },
  { label: 'Pohon Sehat', labelEn: 'Healthy Trees', value: '1.037', unit: 'pohon', icon: '✅', gradient: `linear-gradient(135deg, #14532dcc, ${T.greenLight}cc)`, textColor: '#86efac' },
  { label: 'Pohon Tidak Sehat', labelEn: 'Unhealthy Trees', value: '211', unit: 'pohon', icon: '⚠️', gradient: `linear-gradient(135deg, #7f1d1dcc, ${T.red}cc)`, textColor: '#fca5a5' },
];

const HEALTH_PCT = 83.1;
const UNHEALTH_PCT = 16.9;

const RECENT_DETECTIONS = [
  { id: 'DET-037', loc: 'Blok A-12 Baris 8', cls: 'Tidak Sehat', conf: 94, status: 'critical', time: '14:32:17' },
  { id: 'DET-036', loc: 'Blok C-07 Baris 3', cls: 'Tidak Sehat', conf: 71, status: 'warning', time: '14:30:44' },
  { id: 'DET-035', loc: 'Blok D-02 Baris 15', cls: 'Tidak Sehat', conf: 55, status: 'caution', time: '14:28:05' },
  { id: 'DET-034', loc: 'Blok B-05 Baris 1', cls: 'Sehat', conf: 99, status: 'ok', time: '14:25:11' },
  { id: 'DET-033', loc: 'Blok A-09 Baris 4', cls: 'Sehat', conf: 97, status: 'ok', time: '14:22:38' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: `${T.red}22`, text: T.red, label: 'TIDAK SEHAT' },
  warning:  { bg: `${T.red}18`, text: T.red, label: 'TIDAK SEHAT' },
  caution:  { bg: `${T.amber}22`, text: T.amber, label: 'TIDAK SEHAT' },
  ok:       { bg: `${T.green}22`, text: T.green, label: 'SEHAT' },
};

const PREFLIGHT_ITEMS = [
  { key: 'gyro', label: 'Gyro' }, { key: 'accelerometer', label: 'Accelerometer' }, { key: 'magnetometer', label: 'Magnetometer' },
  { key: 'absolute_pressure', label: 'Absolute Pressure' }, { key: 'differential_pressure', label: 'Differential Pressure' },
  { key: 'gps', label: 'GPS' }, { key: 'optical_flow', label: 'Optical Flow' }, { key: 'vision_position', label: 'Vision Position' },
  { key: 'laser_position', label: 'Laser Position' }, { key: 'external_ground_truth', label: 'External Ground Truth' },
  { key: 'angular_rate_control', label: 'Angular Rate Control' }, { key: 'attitude_stabilization', label: 'Attitude Stabilization' },
  { key: 'yaw_position', label: 'Yaw Position' }, { key: 'z_position_control', label: 'Z Position Control' },
  { key: 'xy_position_control', label: 'XY Position Control' }, { key: 'motor_outputs', label: 'Motor Outputs' },
  { key: 'rc_receiver', label: 'RC Receiver' }, { key: 'gyro_cal', label: '3D Gyro Calibration' },
  { key: 'accel_cal', label: '3D Accelerometer Calibration' }, { key: 'mag_cal', label: 'Magnetometer Calibration' },
];


const toDeg = (radians: number) => {
  if (typeof radians !== 'number') return "0.00";
  return (radians * (180 / Math.PI)).toFixed(2);
};


function DeviceDroneSection() {
  const { setDroneOn, telemetry, droneStatus } = useMonitoringOperator();
  const { user, status } = useAuth();
  const [droneDetail, setDroneDetail] = useState<DroneData | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeDroneId, setActiveDroneId] = useState<string | null>(null);
  const [isSendingCommand, setIsSendingCommand] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOperatorAndDroneData = async () => {

      if (isMounted) setIsLoading(true);

      try {
        const timestamp = new Date().getTime();

        const meRes = await fetch(`/api/operator/me?_t=${timestamp}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (!meRes.ok) throw new Error(`HTTP Error Me: ${meRes.status}`);
        const meJson = await meRes.json();

        const fetchedDroneId = meJson.data?.assignedDroneId;
        if (!fetchedDroneId) {
          console.warn('Operator belum memiliki drone yang di-assign.');
          if (isMounted) setIsLoading(false);
          return;
        }

        if (isMounted) setActiveDroneId(fetchedDroneId);

        const droneRes = await fetch(`/api/operator/my-drone?_t=${timestamp}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (!droneRes.ok) throw new Error(`HTTP Error Drone: ${droneRes.status}`);
        const droneJson = await droneRes.json();

        if (droneJson.data && isMounted) {
          setDroneDetail(droneJson.data);
        }
      } catch (error) {
        console.error('Gagal memuat data operator/drone:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOperatorAndDroneData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendCommand = async (targetTopic: 'system' | 'action', commandType: string) => {
  if (!activeDroneId)
    return;
  
  setIsSendingCommand(true);
  try {
    const res = await fetch('/api/operator/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        droneId: activeDroneId, 
        targetTopic: targetTopic,
        command: commandType
      })
    });
    
    const result = await res.json();
    if (result.success && targetTopic === 'system') {
       setDroneOn(false); 
    }
  } catch (err) {
    console.error("HTTP Request gagal:", err);
  } finally {
    setIsSendingCommand(false);
  }
};

  const battColor = telemetry.battery > 50 ? T.green : telemetry.battery > 20 ? T.amber : T.red;
  const connStatus = droneStatus === 'online' ? 'connected' : 'disconnected';
  const displayMode = telemetry.mode?.startsWith('Mode(') ? 'INITIALIZING' : (telemetry.mode || 'UNKNOWN');

  // Helper untuk field yang menunggu REST API
  const renderLoading = () => (
    <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
      <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
    </span>
  );

  // Helper untuk field yang menunggu aliran data Pixhawk
  const renderWaitingTelemetry = () => (
    <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
      <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
    </span>
  );

  const isLinkFreqReady = droneStatus === 'online';

  // Pendekatan Tipe Polimorfik: render loading state atau data aktual
  const DEVICE_INFO: Array<{ label: string; labelEn: string; value: React.ReactNode }> = [
    { 
      label: 'Nama Perangkat', 
      labelEn: 'Device Name', 
      value: isLoading
        ? renderLoading()
        : (droneDetail?.name || 'Tidak Ditemukan'),
    },
    { 
      label: 'ID Drone', 
      labelEn: 'Drone ID', 
      value: isLoading
        ? renderLoading()
        : (activeDroneId || 'Tidak Ditemukan'),
    },
    { 
      label: 'Pengguna Terkait',  
      labelEn: 'Linked Users',   
      value: isLoading ? renderLoading() : (
        droneDetail?.operator && droneDetail.operator.length > 0 ? (
          <div className="flex items-center justify-end">
            <button 
              onClick={() => setIsUserModalOpen(true)} 
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2a2a2a] bg-white dark:bg-[#202024] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors shadow-sm"
              title="Lihat Detail Pengguna"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            Tidak Ditemukan
          </div>
        )
      )
    },
    { 
      label: 'Frekuensi Link',
      labelEn: 'Link Frequency',
      value: !isLinkFreqReady
        ? renderWaitingTelemetry()
        : (droneDetail?.linkFrequency || 
          <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Tidak Ditemukan
          </span>
          ),
    },
  ];

  const TELEMETRY = [
    { label: 'Mode Terbang', labelEn: 'Flight Mode', value: displayMode, color: T.green, icon: '🚁' },
    { label: 'Baterai', labelEn: 'Battery', value: `${(telemetry.battery || 0).toFixed(0)}%`, color: battColor, icon: '🔋' },
    { label: 'Tegangan', labelEn: 'Voltage', value: `${(telemetry.voltage || 0).toFixed(2)} V`, color: T.green, icon: '⚡' },
    { label: 'Arus', labelEn: 'Current', value: `${(telemetry.current || 0).toFixed(2)} A`, color: T.green, icon: '🔌' },
    { label: 'Ketinggian', labelEn: 'Altitude', value: `${(telemetry.altitude || 0).toFixed(1)} m`, color: T.green, icon: '📏' },
    { label: 'Kecepatan', labelEn: 'Speed', value: `${(telemetry.groundSpeed || 0).toFixed(1)} m/s`, color: T.amber, icon: '💨' },
  ]; 

  const ATTITUDE = [
    { label: 'Roll', value: toDeg(telemetry.roll) },
    { label: 'Pitch', value: toDeg(telemetry.pitch) },
    { label: 'Yaw', value: toDeg(telemetry.yaw) },
  ];

  return (
    <>
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        {/* Header Device */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base" style={{ background: `linear-gradient(135deg, ${T.green}, ${T.violet})` }}>🚁</div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Status & Detail Device Drone</h3>
              <p className="text-[11px] text-gray-400">Drone Device Status & Details</p>
            </div>
          </div>

          {/* Status Perangkat */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={connStatus === 'connected' ? { background: `${T.green}20`, color: T.green, border: `1px solid ${T.green}44` } : { background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}33` }}>
              <span className={`w-1.5 h-1.5 rounded-full bg-current ${connStatus === 'connected' ? 'animate-pulse' : ''}`} />
              {connStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
            </span>

            {/* Restart WiFi (System) */}
            <button 
              onClick={() => handleSendCommand('system', 'reboot_os')} 
              disabled={isSendingCommand}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95'}`} 
              style={{ background: `linear-gradient(135deg, ${T.green}, ${T.greenLight})` }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSendingCommand ? 'animate-spin' : ''}`} />
              {isSendingCommand ? 'Loading...' : 'Reconnect'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Orientasi & 3D Viewer */}
            <div className="flex flex-col gap-3 h-full">
              <div className="flex-1 rounded-xl border border-gray-100 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#0a0a0a] relative overflow-hidden flex flex-col min-h-[220px]">
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Orientasi 3D Model</h4>
                  <p className="text-[10px] text-gray-500">Live Viewer</p>
                </div>
                <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
                  <Drone3DViewer roll={telemetry.roll} pitch={telemetry.pitch} yaw={telemetry.yaw} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 shrink-0">
                {ATTITUDE.map(axis => (
                  <div key={axis.label} className="py-2 px-2 rounded-lg bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e] text-center flex flex-col justify-center">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-wider">{axis.label}</span>
                    <span className="block text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5">{axis.value}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informasi Perangkat (Dengan Polimorfisme ReactNode) */}
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Informasi Perangkat</p>
                <div className="flex flex-col gap-2">
                  {DEVICE_INFO.map(info => (
                    <div key={info.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e]">
                      <div>
                        <p className="text-[10px] text-gray-400">{info.label}</p>
                        <p className="text-[9px] text-gray-500">{info.labelEn}</p>
                      </div>
                      <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{info.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* RC Switch */}
              <div className="space-y-2 shrink-0">
                 <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">RC Switch Status</p>
                 <div className="grid grid-cols-2 gap-2">
                    {['loiter', 'auto', 'rtl', 'spray'].map(ch => {
                       const rcVal = telemetry.rc ? telemetry.rc[ch as keyof typeof telemetry.rc] : 'OFF';
                       const isOff = rcVal === 'OFF' || rcVal === 'DISCONNECTED';
                       return (
                          <div key={ch} className="py-2 px-3 rounded bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e] flex justify-between items-center">
                             <span className="text-[10px] text-gray-500 uppercase">{ch}</span>
                             <span className="text-[10px] font-bold" style={{ color: isOff ? T.red : T.green }}>{rcVal}</span>
                          </div>
                       );
                    })}
                 </div>
              </div>
            </div>

            {/* Informasi Penerbangan */}
            <div className="flex flex-col h-full space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 shrink-0">Infomarsi Penerbangan</p>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {TELEMETRY.map(item => (
                  <div key={item.label} className="rounded-lg p-3 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e] flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">{item.label}</span>
                      <span className="text-sm leading-none">{item.icon}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 mb-1">{item.labelEn}</p>
                    <p className="text-base font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-[#1e1e1e]" />

          {/* Pre-flight System Check */}
          <div className="space-y-3">
             <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-2"><span>📋</span> Pre-flight System Check</p>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {PREFLIGHT_ITEMS.map((item) => {
                   const isHealthy = telemetry.sys_check ? telemetry.sys_check[item.key as keyof typeof telemetry.sys_check] : false;
                   return (
                      <div key={item.key} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#1e1e1e] transition-colors">
                         <div className="flex items-center justify-center w-6 h-6 rounded-md shrink-0" style={{ background: isHealthy ? `${T.green}22` : `${T.red}22` }}>
                            <span className="text-[11px]">{isHealthy ? '✅' : '❌'}</span>
                         </div>
                         <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 leading-tight">{item.label}</span>
                      </div>
                   )
                })}
             </div>
          </div>
        </div>
      </div>

      {/* --- MODAL PENGGUNA TERKAIT --- */}
      {isUserModalOpen && droneDetail?.operator && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2a2a2a] w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#191919] dark:text-white">Pengguna Terkait</h2>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3 mb-2">
              {droneDetail.operator.map((op) => (
                <div key={op.id} className="bg-gray-50/50 dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#2a2a2a] rounded-xl p-5 flex flex-col items-center text-center gap-1 shadow-sm">
                  <div className="w-12 h-12 bg-green-900/10 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#191919] dark:text-white text-base">{op.name || "Tanpa Nama"}</h3>
                  {op.email && <p className="text-xs text-gray-500 dark:text-gray-400">{op.email}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// --- [MAIN DASHBOARD COMPONENT] ---
export default function DashboardSection() {
  const [tick, setTick] = useState<Date | null>(null);

  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ringkasan Misi Drone</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Mission Summary · Update terakhir: {tick ? tick.toLocaleTimeString('id-ID') : '--:--:--'}
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}44` }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> LIVE · Misi #037
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="rounded-xl p-5 relative overflow-hidden" style={{ background: card.gradient }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20" style={{ background: '#fff' }} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide block" style={{ color: card.textColor, opacity: 0.8 }}>{card.label}</span>
                  <span className="text-[10px] block mt-0.5" style={{ color: card.textColor, opacity: 0.6 }}>{card.labelEn}</span>
                </div>
                <span className="text-xl">{card.icon}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: '#fff' }}>{card.value}</span>
                <span className="text-sm font-semibold" style={{ color: card.textColor }}>{card.unit}</span>
              </div>
            </div>
          </div>
        ))}
        {/* Pie Chart AI */}
        <div className="rounded-xl p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] flex flex-col items-center justify-center gap-3">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" className="dark:stroke-[#1e1e1e]" />
              <circle cx="18" cy="18" r="14" fill="none" stroke={T.green} strokeWidth="4" strokeDasharray={`${HEALTH_PCT * 0.879} ${100 - HEALTH_PCT * 0.879}`} strokeLinecap="round" />
              <circle cx="18" cy="18" r="14" fill="none" stroke={T.red} strokeWidth="4" strokeDasharray={`${UNHEALTH_PCT * 0.879} ${100 - UNHEALTH_PCT * 0.879}`} strokeDashoffset={`${-(HEALTH_PCT * 0.879)}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{HEALTH_PCT}%</span>
              <span className="text-[9px] text-gray-400 leading-tight text-center">Sehat</span>
            </div>
          </div>
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: T.green }} />
                <span className="text-gray-600 dark:text-gray-400">Sehat</span>
              </span>
              <span className="font-bold font-mono" style={{ color: T.green }}>{HEALTH_PCT}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: T.red }} />
                <span className="text-gray-600 dark:text-gray-400">Tidak Sehat</span>
              </span>
              <span className="font-bold font-mono" style={{ color: T.red }}>{UNHEALTH_PCT}%</span>
            </div>
          </div>
        </div>
      </div>

      <DeviceDroneSection />

      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base" style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}>🔍</div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Deteksi Terbaru</h3>
            <p className="text-[11px] text-gray-400">Recent Detections · Hasil inference AI real-time dari kamera drone</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-[#1e1e1e]">
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Lokasi</th>
                <th className="px-5 py-3 font-semibold">Klasifikasi AI</th>
                <th className="px-5 py-3 font-semibold">Akurasi</th>
                <th className="px-5 py-3 font-semibold">Waktu</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1a1a1a] text-sm">
              {RECENT_DETECTIONS.map(d => {
                const s = STATUS_STYLE[d.status];
                return (
                  <tr key={d.id} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{d.id}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-700 dark:text-gray-300">{d.loc}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-900 dark:text-gray-100">{d.cls}</td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: s.text }}>{d.conf}%</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{d.time}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}