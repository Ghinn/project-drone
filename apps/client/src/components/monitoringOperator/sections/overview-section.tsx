"use client";
import { useState, useEffect } from 'react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;

// ── Stat Cards (3 cards only, pie chart is separate) ──────────────────
const STAT_CARDS = [
  {
    label: 'Total Pohon Terdeteksi', labelEn: 'Total Trees Detected',
    value: '1.248', unit: 'pohon', icon: '🌴',
    gradient: `linear-gradient(135deg, ${T.green}dd, #166534cc)`,
    textColor: '#bbf7d0',
  },
  {
    label: 'Pohon Sehat', labelEn: 'Healthy Trees',
    value: '1.037', unit: 'pohon', icon: '✅',
    gradient: `linear-gradient(135deg, #14532dcc, ${T.greenLight}cc)`,
    textColor: '#86efac',
  },
  {
    label: 'Pohon Tidak Sehat', labelEn: 'Unhealthy Trees',
    value: '211', unit: 'pohon', icon: '⚠️',
    gradient: `linear-gradient(135deg, #7f1d1dcc, ${T.red}cc)`,
    textColor: '#fca5a5',
  },
];

const HEALTH_PCT   = 83.1;
const UNHEALTH_PCT = 16.9;

// ── Recent Detections ───────────────────────────────────────────────────
const RECENT_DETECTIONS = [
  { id: 'DET-037', loc: 'Blok A-12 Baris 8', cls: 'Tidak Sehat', conf: 94, status: 'critical', time: '14:32:17' },
  { id: 'DET-036', loc: 'Blok C-07 Baris 3', cls: 'Tidak Sehat', conf: 71, status: 'warning', time: '14:30:44' },
  { id: 'DET-035', loc: 'Blok D-02 Baris 15', cls: 'Tidak Sehat', conf: 55, status: 'caution', time: '14:28:05' },
  { id: 'DET-034', loc: 'Blok B-05 Baris 1', cls: 'Sehat', conf: 99, status: 'ok', time: '14:25:11' },
  { id: 'DET-033', loc: 'Blok A-09 Baris 4', cls: 'Sehat', conf: 97, status: 'ok', time: '14:22:38' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: `${T.red}22`,    text: T.red,    label: 'TIDAK SEHAT' },
  warning:  { bg: `${T.red}18`,    text: T.red,    label: 'TIDAK SEHAT' },
  caution:  { bg: `${T.amber}22`,  text: T.amber,  label: 'TIDAK SEHAT' },
  ok:       { bg: `${T.green}22`,  text: T.green,  label: 'SEHAT' },
};

// ── Device Drone Section ────────────────────────────────────────────────
function DeviceDroneSection({ battery }: { battery: number }) {
  const { droneOn, setDroneOn } = useMonitoringOperator();
  const battColor = battery > 50 ? T.green : battery > 20 ? T.amber : T.red;
  const connStatus = droneOn ? 'connected' : 'disconnected';

  const DEVICE_INFO = [
    { label: 'Model Drone',    labelEn: 'Drone Model',    value: 'DJI Mavic 3 Enterprise' },
    { label: 'ID Perangkat',   labelEn: 'Device ID',      value: 'DP-DRONE-001' },
    { label: 'Versi Firmware', labelEn: 'Firmware',       value: 'v4.2.1' },
    { label: 'Frekuensi Link', labelEn: 'Link Frequency', value: '5.8 GHz' },
    { label: 'Tipe Baterai',   labelEn: 'Battery Type',   value: 'LiPo 6S 5000mAh' },
  ];

  const TELEMETRY = [
    { label: 'Baterai',     labelEn: 'Battery',    value: `${battery.toFixed(0)}%`, color: battColor,  icon: '🔋' },
    { label: 'GPS Signal',  labelEn: 'GPS Signal', value: 'Kuat · 14 Satelit',      color: T.green,    icon: '📡' },
    { label: 'Ketinggian',  labelEn: 'Altitude',   value: '25.3 m',                 color: T.green,    icon: '📏' },
    { label: 'Kecepatan',   labelEn: 'Speed',      value: '4.2 m/s',               color: T.amber,    icon: '⚡' },
  ];

  return (
    <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base"
            style={{ background: `linear-gradient(135deg, ${T.green}, ${T.violet})` }}>
            🚁
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Status & Detail Device Drone</h3>
            <p className="text-[11px] text-gray-400">Drone Device Status & Details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={connStatus === 'connected'
              ? { background: `${T.green}20`, color: T.green, border: `1px solid ${T.green}44` }
              : { background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}33` }}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${connStatus === 'connected' ? 'animate-pulse' : ''}`} />
            {connStatus === 'connected' ? 'TERHUBUNG' : 'TIDAK TERHUBUNG'}
          </span>

          {/* Reconnect Button */}
          <button
            onClick={() => setDroneOn(!droneOn)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${T.green}, ${T.greenLight})` }}
          >
            🔄 Reconnect
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Top Grid: 3D Model (kosong) + Device Info + Telemetri */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Card: 3D Model Orientation (placeholder untuk backend) */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-col items-center justify-center min-h-[200px] gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${T.violet}15`, border: `1px dashed ${T.violet}44` }}>
              🛸
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400">Orientasi 3D Model</p>
              <p className="text-xs text-gray-400 mt-0.5">3D Model Orientation</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-2 px-2">
                {/* NOTE FOR BACKEND: Tambahkan komponen 3D GLB model orientation drone di sini */}
                Area ini dipersiapkan untuk visualisasi model 3D drone.<br />
                <em>Reserved for backend 3D model integration.</em>
              </p>
            </div>
          </div>

          {/* Device Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Informasi Perangkat / Device Information
            </p>
            <div className="space-y-2">
              {DEVICE_INFO.map(info => (
                <div key={info.label}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e]">
                  <div>
                    <p className="text-[10px] text-gray-400">{info.label}</p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600">{info.labelEn}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{info.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetri (angka saja, tanpa bar) */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Telemetri Real-time / Telemetry
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TELEMETRY.map(item => (
                <div key={item.label}
                  className="rounded-lg p-3 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">{item.label}</span>
                    <span className="text-sm leading-none">{item.icon}</span>
                  </div>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600 mb-1">{item.labelEn}</p>
                  <p className="text-base font-bold" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2.5 rounded-lg p-3 text-xs"
          style={{ background: `${T.amber}12`, border: `1px solid ${T.amber}33` }}>
          <span className="text-base leading-none shrink-0">ℹ️</span>
          <p style={{ color: T.amber }}>
            Status perangkat ini akan tersinkronisasi secara otomatis oleh sistem backend.
            Data yang ditampilkan saat ini merupakan indikator awal sebelum penerbangan.
            <em className="block mt-0.5 opacity-75">Device status will be auto-synced by the backend system.</em>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── AI Health Rate Section (lebar, dua bar) ────────────────────────────
function HealthRateSection() {
  return null; // Digantikan oleh pie chart di stat cards row
}

// ── Main Dashboard Component ────────────────────────────────────────────
export default function DashboardSection() {
  const { battery } = useMonitoringOperator();
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
        <span className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}44` }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          LIVE · Misi #037
        </span>
      </div>

      {/* ① Stat Cards (3) + Pie Chart (1) — satu baris */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 3 stat cards */}
        {STAT_CARDS.map(card => (
          <div key={card.label} className="rounded-xl p-5 relative overflow-hidden"
            style={{ background: card.gradient }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20" style={{ background: '#fff' }} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide block"
                    style={{ color: card.textColor, opacity: 0.8 }}>{card.label}</span>
                  <span className="text-[10px] block mt-0.5"
                    style={{ color: card.textColor, opacity: 0.6 }}>{card.labelEn}</span>
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

        {/* Pie Chart — Kesehatan AI */}
        <div className="rounded-xl p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] flex flex-col items-center justify-center gap-3">
          {/* SVG Pie */}
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* Track */}
              <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" className="dark:stroke-[#1e1e1e]" />
              {/* Sehat arc */}
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={T.green} strokeWidth="4"
                strokeDasharray={`${HEALTH_PCT * 0.879} ${100 - HEALTH_PCT * 0.879}`}
                strokeLinecap="round"
              />
              {/* Tidak sehat arc */}
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={T.red} strokeWidth="4"
                strokeDasharray={`${UNHEALTH_PCT * 0.879} ${100 - UNHEALTH_PCT * 0.879}`}
                strokeDashoffset={`${-(HEALTH_PCT * 0.879)}`}
                strokeLinecap="round"
              />
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{HEALTH_PCT}%</span>
              <span className="text-[9px] text-gray-400 leading-tight text-center">Sehat</span>
            </div>
          </div>

          {/* Legend */}
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
            <p className="text-[9px] text-gray-300 dark:text-gray-600 pt-0.5 border-t border-gray-100 dark:border-[#2a2a2a]">
              Deteksi AI · CNN ResNet-50
            </p>
          </div>
        </div>
      </div>

      {/* ② Device Drone Section */}
      <DeviceDroneSection battery={battery} />

      {/* ④ Deteksi Terbaru (paling bawah) */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base"
            style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}>
            🔍
          </div>
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
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.text }}>
                        {s.label}
                      </span>
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