"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import type { MapWaypoint } from './drone-map';

const T = DRONE_TOKENS;

// Leaflet map harus dynamic import (tidak SSR) karena butuh window
const DroneMap = dynamic(() => import('./drone-map'), { ssr: false, loading: () => (
  <div className="w-full rounded-xl bg-[#0f172a] flex items-center justify-center" style={{ height: 380 }}>
    <span className="text-xs text-gray-500">Memuat peta GPS...</span>
  </div>
)});

const LIVE_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';
const NDVI_IMG = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';

type CameraMode = 'live' | 'riwayat';

type PredictionResult = {
  label: string;
  healthy: number;
  unhealthy: number;
  disease: string;
  confidence: number;
  severity: 'ok' | 'caution' | 'warning' | 'critical';
  recommendation: string;
} | null;

const MOCK_RESULT: PredictionResult = {
  label: 'Terdeteksi Penyakit Ganoderma (BSR)',
  healthy: 12.4,
  unhealthy: 87.6,
  disease: 'Busuk Pangkal Batang (BSR) — Ganoderma boninense',
  confidence: 94.2,
  severity: 'critical',
  recommendation: 'Segera lakukan penyemprotan fungisida pada area Blok A-12, Baris 8. Isolasi pohon dan tandai koordinat GPS untuk inspeksi lanjutan.',
};

const SEVERITY_STYLE = {
  ok:       { bg: `${T.green}20`, text: T.green,  border: `${T.green}44`,  label: 'SEHAT',      labelEn: 'HEALTHY'  },
  caution:  { bg: `${T.amber}20`, text: T.amber,  border: `${T.amber}44`,  label: 'PERHATIAN',  labelEn: 'CAUTION'  },
  warning:  { bg: `${T.orange}20`,text: T.orange, border: `${T.orange}44`, label: 'WASPADA',    labelEn: 'WARNING'  },
  critical: { bg: `${T.red}18`,   text: T.red,    border: `${T.red}44`,    label: 'KRITIS',     labelEn: 'CRITICAL' },
};

// Mock waypoints riwayat drone
const MOCK_WAYPOINTS: MapWaypoint[] = [
  { lat: 3.3556, lng: 114.5977, id: 'REC-033', label: 'Sehat',      status: 'ok',       time: '14:19:05' },
  { lat: 3.3561, lng: 114.5983, id: 'REC-034', label: 'Sehat',      status: 'ok',       time: '14:22:38' },
  { lat: 3.3566, lng: 114.5990, id: 'REC-035', label: 'BSR Ringan', status: 'caution',  time: '14:25:11' },
  { lat: 3.3572, lng: 114.5997, id: 'REC-036', label: 'BSR Sedang', status: 'warning',  time: '14:28:05' },
  { lat: 3.3578, lng: 114.6004, id: 'REC-037', label: 'BSR Parah',  status: 'critical', time: '14:32:17' },
];

// Mock records untuk mode riwayat kamera
const RECORD_HISTORY = [
  { id: 'REC-037', time: '14:32:17', gps: '3°21\'14.2"N 114°35\'48.9"E', cls: 'BSR Parah',  conf: 94, sev: 'critical' as const, wpIndex: 4 },
  { id: 'REC-036', time: '14:28:05', gps: '3°21\'12.1"N 114°35\'47.3"E', cls: 'BSR Ringan', conf: 55, sev: 'caution'  as const, wpIndex: 2 },
  { id: 'REC-035', time: '14:25:11', gps: '3°21\'10.8"N 114°35\'46.0"E', cls: 'Sehat',      conf: 99, sev: 'ok'       as const, wpIndex: 1 },
  { id: 'REC-034', time: '14:22:38', gps: '3°21\'09.4"N 114°35\'44.7"E', cls: 'Sehat',      conf: 97, sev: 'ok'       as const, wpIndex: 0 },
  { id: 'REC-033', time: '14:19:05', gps: '3°21\'08.1"N 114°35\'43.2"E', cls: 'BSR Sedang', conf: 71, sev: 'warning'  as const, wpIndex: 3 },
];

// Mock posisi live drone (simulasi bergerak)
const LIVE_POSITIONS = [
  { lat: 3.3556, lng: 114.5977 },
  { lat: 3.3561, lng: 114.5983 },
  { lat: 3.3566, lng: 114.5990 },
  { lat: 3.3572, lng: 114.5997 },
  { lat: 3.3578, lng: 114.6004 },
];

export default function PantauDroneSection() {
  const { battery, droneOn } = useMonitoringOperator();
  const [tick, setTick] = useState<Date | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('live');
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [snapshotFlash, setSnapshotFlash] = useState(false);
  const [snapshotTime, setSnapshotTime] = useState<string>('');
  const [snapshotGps] = useState('3°21\'14.2"N 114°35\'48.9"E');
  const [isPredicting, setIsPredicting] = useState(false);
  const [predResult, setPredResult] = useState<PredictionResult>(null);
  const [savedToLog, setSavedToLog] = useState(false);
  const [livePosIdx, setLivePosIdx] = useState(0);

  const battColor = battery > 50 ? T.green : battery > 20 ? T.amber : T.red;

  // Clock
  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulasi drone bergerak (live GPS)
  useEffect(() => {
    if (!droneOn || cameraMode !== 'live') return;
    const t = setInterval(() => {
      setLivePosIdx(i => (i + 1) % LIVE_POSITIONS.length);
    }, 3000);
    return () => clearInterval(t);
  }, [droneOn, cameraMode]);

  // Reset saat drone mati
  useEffect(() => {
    if (!droneOn) {
      setSnapshotTaken(false);
      setSnapshotFlash(false);
      setSnapshotTime('');
      setPredResult(null);
      setSavedToLog(false);
      setIsPredicting(false);
    }
  }, [droneOn]);

  const handleSnapshot = () => {
    if (!droneOn) return;
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 350);
    setSnapshotTime(new Date().toLocaleTimeString('id-ID'));
    setSnapshotTaken(true);
    setPredResult(null);
    setSavedToLog(false);
  };

  const handlePredict = () => {
    if (!snapshotTaken) return;
    setIsPredicting(true);
    setPredResult(null);
    setTimeout(() => { setIsPredicting(false); setPredResult(MOCK_RESULT); }, 2400);
  };

  const handleSaveToLog = () => {
    setSavedToLog(true);
    setTimeout(() => setSavedToLog(false), 3000);
  };

  const sev = predResult ? SEVERITY_STYLE[predResult.severity] : null;

  return (
    <div className="space-y-5">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pantau Drone</h1>
          <p className="text-xs text-gray-500 mt-0.5">Drone Monitor · Pemantauan real-time & analisis AI</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={() => setCameraMode('live')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={cameraMode === 'live' ? { background: T.red, color: '#fff' } : { color: '#9ca3af' }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cameraMode === 'live' ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            LIVE
          </button>
          <button
            onClick={() => setCameraMode('riwayat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={cameraMode === 'riwayat' ? { background: T.violet, color: '#fff' } : { color: '#9ca3af' }}
          >
            📁 Riwayat / Record
          </button>
        </div>
      </div>

      {/* ── MAIN GRID: Camera | Map | Telemetri ─────────────── */}
      {/* grid-cols-5: Camera=2, Map=2, Telemetri=1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── CAMERA (2 col) ───────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-3">

          {/* Video Frame */}
          <div className="rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-[#1e1e1e] relative" style={{ minHeight: 380 }}>

            {/* DRONE OFF overlay */}
            {!droneOn && cameraMode === 'live' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ minHeight: 380, background: '#0a0a0a' }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />
                <div className="w-20 h-20 rounded-full flex items-center justify-center border-2" style={{ borderColor: '#333', background: '#111' }}>
                  <svg width="36" height="36" fill="none" stroke="#555" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-base font-bold" style={{ color: '#555' }}>KAMERA TIDAK AKTIF</p>
                  <p className="text-sm" style={{ color: '#444' }}>Camera Offline</p>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#555' }} />
                    Drone tidak aktif · DP-DRONE-001
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-start gap-2 px-4 py-2.5 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e1e' }}>
                  <svg width="14" height="14" fill="none" stroke="#555" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                  </svg>
                  <span style={{ color: '#555' }}>
                    {/* NOTE FOR BACKEND: Replace this offline screen with live stream feed
                        (e.g. WebRTC / RTSP / WebSocket stream) when drone is connected.
                        Condition: droneOn === true → show stream; droneOn === false → show this screen. */}
                    Aktifkan drone dari menu Dashboard untuk memulai kamera live.
                    <em className="block mt-0.5 opacity-60">Activate drone from Dashboard to start live feed.</em>
                  </span>
                </div>
              </div>

            ) : cameraMode === 'live' ? (
              // ── DRONE ON: Live feed ──
              <>
                <img src={LIVE_IMG} alt="Live aerial view kebun sawit" className="w-full h-full object-cover" style={{ minHeight: 380 }} />
                {/* HUD Corners */}
                {['top-3 left-3 border-t-2 border-l-2','top-3 right-3 border-t-2 border-r-2','bottom-3 left-3 border-b-2 border-l-2','bottom-3 right-3 border-b-2 border-r-2'].map((pos, i) => (
                  <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: T.green }} />
                ))}
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4" style={{ background: `${T.green}80` }} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4" style={{ background: `${T.green}80` }} />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5" style={{ background: `${T.green}80` }} />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5" style={{ background: `${T.green}80` }} />
                    <div className="absolute inset-3 rounded-full border" style={{ borderColor: `${T.green}60` }} />
                  </div>
                </div>
                {/* Detection Box */}
                <div className="absolute border-2 rounded" style={{ top: '28%', left: '38%', width: '120px', height: '90px', borderColor: T.red, boxShadow: `0 0 12px ${T.red}66` }}>
                  <span className="absolute -top-5 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.red, color: '#fff' }}>BSR 94%</span>
                </div>
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
                  <span className="text-[10px] font-mono text-emerald-300">DJI Mavic 3 · DP-DRONE-001</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-300">{tick ? tick.toLocaleTimeString('id-ID') : '--:--:--'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${T.red}cc`, color: '#fff' }}>● REC</span>
                  </div>
                </div>
                {/* Bottom GPS Bar */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-300">GPS: {snapshotGps}</span>
                    <span className="text-xs font-mono text-emerald-300">ALT: 25.3 m · {battery.toFixed(0)}% BAT</span>
                  </div>
                </div>
                {snapshotFlash && <div className="absolute inset-0 bg-white/70 animate-ping pointer-events-none" />}
              </>

            ) : (
              // ── RIWAYAT MODE kamera: full-width, tanpa sidebar ──
              <div className="relative w-full" style={{ minHeight: 380 }}>
                <img src={LIVE_IMG} alt="Rekaman" className="w-full h-full object-cover" style={{ minHeight: 380 }} />
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: T.green }} />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: T.green }} />
                {/* Detection box */}
                <div className="absolute border-2 rounded" style={{ top: '28%', left: '38%', width: '120px', height: '90px', borderColor: T.red, boxShadow: `0 0 10px ${T.red}55` }}>
                  <span className="absolute -top-4 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.red, color: '#fff' }}>BSR 94%</span>
                </div>
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
                  <span className="text-[10px] font-mono text-emerald-300">DP-DRONE-001 · Misi #037</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300">📂 REKAMAN</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-300">GPS: {snapshotGps}</span>
                    <span className="text-xs font-mono text-emerald-300">14:32:17 WIB · ALT: 25.3 m</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metrics bar */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
            {[
              { k: 'NDVI',      v: '0.72',    c: T.green },
              { k: 'BANDWIDTH', v: '4.8 Mbps',c: T.violet },
              { k: 'LATENSI',   v: '48 ms',   c: T.greenLight },
              { k: 'BATERAI',   v: `${battery.toFixed(0)}%`, c: battColor },
              { k: 'KETINGGIAN',v: '25.3 m',  c: T.green },
              { k: 'KECEPATAN', v: '4.2 m/s', c: T.amber },
              { k: 'GPS',       v: 'Kuat · 14 sat', c: T.green },
              { k: 'LINK',      v: '5.8 GHz', c: T.greenLight },
            ].map(i => (
              <div key={i.k} className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400">{i.k}:</span>
                <span className="text-[10px] font-bold font-mono" style={{ color: i.c }}>{i.v}</span>
              </div>
            ))}

            {/* Snapshot button */}
            {cameraMode === 'live' && (
              <button
                onClick={handleSnapshot}
                disabled={!droneOn}
                title={!droneOn ? 'Aktifkan drone terlebih dahulu' : 'Ambil snapshot dari kamera'}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: droneOn ? `linear-gradient(135deg, ${T.green}, ${T.greenLight})` : '#2a2a2a',
                  color: droneOn ? '#fff' : '#555',
                  cursor: droneOn ? 'pointer' : 'not-allowed',
                  opacity: droneOn ? 1 : 0.5,
                }}
              >
                📷 {droneOn ? 'Ambil Snapshot' : 'Kamera Tidak Aktif'}
              </button>
            )}
          </div>
        </div>

        {/* ── GPS MAP (2 col) ──────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#1e1e1e]">
            {cameraMode === 'live' ? (
              // LIVE: drone marker bergerak saja, tanpa waypoints
              <DroneMap
                key="map-live"
                mode="live"
                dronePosition={LIVE_POSITIONS[livePosIdx]}
                droneOn={droneOn}
                height={380}
              />
            ) : (
              // Riwayat: tampilkan semua waypoints + polyline jejak
              <DroneMap
                key="map-riwayat"
                mode="waypoints"
                waypoints={MOCK_WAYPOINTS}
                height={380}
              />
            )}
          </div>

          {/* Map info bar */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] text-[10px]">
            {cameraMode === 'live' ? (
              <>
                <span className="font-semibold text-gray-400">POSISI DRONE:</span>
                <span className="font-mono" style={{ color: T.green }}>
                  {LIVE_POSITIONS[livePosIdx].lat.toFixed(5)}°N, {LIVE_POSITIONS[livePosIdx].lng.toFixed(5)}°E
                </span>
                <span className="ml-auto font-semibold text-gray-400">AKURASI GPS:</span>
                <span className="font-mono" style={{ color: T.green }}>±2.1 m</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-400">RIWAYAT KOORDINAT:</span>
                <span className="font-mono text-gray-600">{MOCK_WAYPOINTS.length} titik terdeteksi</span>
                <div className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: T.green }} />Sehat</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />Perhatian</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: T.red }} />Kritis</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── TELEMETRI (1 col) ────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {/* Radar */}
          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Radar / Peta Posisi</p>
            <div className="relative rounded-lg overflow-hidden flex items-center justify-center" style={{ height: 150, background: '#0F172A' }}>
              {[60, 45, 30, 15].map((r, i) => (
                <div key={i} className="absolute rounded-full border"
                  style={{ width: r * 2, height: r * 2, borderColor: `${T.green}${i === 0 ? '18' : i === 1 ? '26' : i === 2 ? '40' : '70'}` }} />
              ))}
              <div className="absolute top-1/2 left-1/2 origin-left h-0.5 w-[60px]"
                style={{ background: `linear-gradient(to right, transparent, ${T.green}80)`, transform: 'translateY(-50%) rotate(-30deg)' }} />
              <div className="absolute w-3 h-3 rounded-full border-2 border-white" style={{ background: T.green }} />
              <div className="absolute w-2 h-2 rounded-full animate-ping" style={{ background: T.red, top: '30%', left: '60%' }} />
              <span className="absolute top-1 text-[9px] font-mono text-gray-500">N</span>
              <span className="absolute bottom-1 text-[9px] font-mono text-gray-500">S</span>
              <span className="absolute left-1 text-[9px] font-mono text-gray-500">W</span>
              <span className="absolute right-1 text-[9px] font-mono text-gray-500">E</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: T.green }} />Drone</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: T.red }} />Deteksi</span>
            </div>
          </div>

          {/* Telemetri (angka, tanpa bar) */}
          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Telemetri Drone / Telemetry</p>
            <div className="space-y-3">
              {[
                { label: 'Baterai',     value: `${battery.toFixed(0)}%`, color: battColor },
                { label: 'GPS Signal',  value: 'Kuat (14 sat)',          color: T.green },
                { label: 'Ketinggian',  value: '25.3 m',                 color: T.green },
                { label: 'Kecepatan',   value: '4.2 m/s',               color: T.amber },
                { label: 'Link 5.8 GHz',value: '-72 dBm',               color: T.greenLight },
                { label: 'NDVI',        value: '0.72',                   color: T.green },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* ── SECTION: AI PREDIKSI KESEHATAN SAWIT ──────── */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base"
              style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}>🤖</div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Prediksi AI Kesehatan Sawit</h2>
              <p className="text-[11px] text-gray-400">Palm Health AI Prediction · CNN ResNet-50 Model</p>
            </div>
          </div>
          {snapshotTaken && !predResult && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${T.green}20`, color: T.green }}>✓ Snapshot Siap</span>
          )}
          {predResult && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${T.violet}20`, color: T.violet }}>✓ Prediksi Selesai</span>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Snapshot Card */}
            <div className="rounded-xl border border-gray-100 dark:border-[#1e1e1e] overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1e1e1e]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: snapshotTaken ? T.green : '#9ca3af' }} />
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Gambar Snapshot Drone</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: snapshotTaken ? `${T.green}20` : '#f3f4f6', color: snapshotTaken ? T.green : '#9ca3af' }}>
                  {snapshotTaken ? 'TERSEDIA' : 'BELUM ADA'}
                </span>
              </div>
              <div className="relative aspect-video bg-gray-100 dark:bg-[#0f0f0f] overflow-hidden">
                {snapshotTaken ? (
                  <>
                    <img src={LIVE_IMG} alt="Drone snapshot" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: T.green }} />
                    <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: T.green }} />
                    <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: T.green }} />
                    <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: T.green }} />
                    <div className="absolute border-2 rounded" style={{ top: '25%', left: '35%', width: '100px', height: '80px', borderColor: T.red, boxShadow: `0 0 10px ${T.red}55` }}>
                      <span className="absolute -top-4 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.red, color: '#fff' }}>ROI</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/75 to-transparent">
                      <span className="text-[10px] font-mono text-emerald-300">GPS: {snapshotGps}</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📷</span>
                    <p className="text-xs text-gray-400">
                      {droneOn ? 'Belum ada snapshot' : 'Drone tidak aktif'}
                    </p>
                    {droneOn && <p className="text-[10px] text-gray-300 dark:text-gray-600">Klik tombol Ambil Snapshot</p>}
                  </div>
                )}
              </div>
              {snapshotTaken && (
                <div className="px-4 py-2.5 flex items-center justify-between border-t border-gray-100 dark:border-[#1e1e1e]">
                  <span className="text-[10px] font-mono text-gray-400">Diambil: {snapshotTime} WIB</span>
                  <button onClick={() => { setSnapshotTaken(false); setPredResult(null); }}
                    className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition">
                    Ulangi Snapshot
                  </button>
                </div>
              )}
            </div>

            {/* Hasil AI */}
            <div className="rounded-xl border border-gray-100 dark:border-[#1e1e1e] overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1e1e1e]">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Hasil Prediksi & NDVI</span>
                <span className="text-[10px] font-mono" style={{ color: T.violet }}>CNN ResNet-50 · v2.4</span>
              </div>
              <div className="relative aspect-video bg-gray-100 dark:bg-[#0f0f0f] overflow-hidden">
                {isPredicting ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-[#2a2a2a] animate-spin" style={{ borderTopColor: T.violet }} />
                    <p className="text-xs font-semibold text-gray-500">Menunggu Prediksi</p>
                    <p className="text-[10px] text-gray-400">AI sedang menganalisis gambar...</p>
                  </div>
                ) : predResult ? (
                  <>
                    <img src={NDVI_IMG} alt="NDVI" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 opacity-15"
                      style={{ backgroundImage: `linear-gradient(${T.violet}44 1px, transparent 1px), linear-gradient(90deg, ${T.violet}44 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-3 py-2 rounded-lg text-center" style={{ background: `${T.violet}cc`, backdropFilter: 'blur(4px)' }}>
                        <p className="text-xs font-bold text-white">NDVI Output</p>
                        <p className="text-[10px] text-white/80">CNN ResNet-50 · {predResult.confidence.toFixed(1)}% conf</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">🤖</span>
                    <p className="text-xs text-gray-400">
                      {snapshotTaken ? 'Siap untuk prediksi' : 'Ambil snapshot terlebih dahulu'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hasil detail prediksi */}
          {predResult && sev && (
            <div className="rounded-xl border-2 p-5 space-y-4" style={{ borderColor: sev.border, background: sev.bg }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: sev.text }}>
                      {sev.label} / {sev.labelEn}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{predResult.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{predResult.disease}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold" style={{ color: sev.text }}>{predResult.confidence.toFixed(1)}%</div>
                  <div className="text-[10px] text-gray-400">Tingkat Keyakinan</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Probabilitas Sehat</span>
                    <span className="text-xs font-bold" style={{ color: T.green }}>{predResult.healthy}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className="h-2.5 rounded-full" style={{ width: `${predResult.healthy}%`, background: T.green }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Probabilitas Tidak Sehat</span>
                    <span className="text-xs font-bold" style={{ color: T.red }}>{predResult.unhealthy}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className="h-2.5 rounded-full" style={{ width: `${predResult.unhealthy}%`, background: T.red }} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-3 bg-white/60 dark:bg-black/20">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">💡 Rekomendasi Tindakan:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{predResult.recommendation}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={handleSaveToLog} disabled={savedToLog}
                  className="flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: `${T.violet}20`, color: T.violet }}>
                  {savedToLog ? '✓ Tersimpan ke Log!' : '💾 Simpan ke Log Prediksi'}
                </button>
                <button onClick={() => { setPredResult(null); setSnapshotTaken(false); }}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800">
                  ↺ Prediksi Ulang
                </button>
              </div>
            </div>
          )}

          {/* Prediksi button */}
          {!predResult && (
            <div className="flex items-center gap-3">
              <button onClick={handlePredict}
                disabled={!snapshotTaken || isPredicting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}>
                {isPredicting ? '⏳ Menganalisis...' : '🤖 Prediksi Sekarang'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
