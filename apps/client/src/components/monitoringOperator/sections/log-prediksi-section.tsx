"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DRONE_TOKENS, type PredictionLogEntry } from '../layout/monitoringOperator-types';
import type { MapWaypoint } from './drone-map';

const T = DRONE_TOKENS;

// Leaflet map harus dynamic import (tidak SSR)
const DroneMap = dynamic(() => import('./drone-map'), { ssr: false, loading: () => (
  <div className="w-full rounded-xl bg-[#0f172a] flex items-center justify-center" style={{ height: 280 }}>
    <span className="text-xs text-gray-500">Memuat peta GPS...</span>
  </div>
)});

const LIVE_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';
const NDVI_IMG = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';

// ── Mock log data ──────────────────────────────────────────────────────
const MOCK_LOGS: PredictionLogEntry[] = [
  {
    id: 'LOG-037', sessionId: 'Misi #037', timestamp: '2026-08-25T14:32:17',
    time: '14:32:17', date: '25 Agustus 2026',
    location: 'Blok A-12 Baris 8', gps: '3°21\'14.2"N 114°35\'48.9"E',
    classification: 'BSR Parah', confidence: 94, severity: 'critical',
    healthy: 12.4, unhealthy: 87.6,
    disease: 'Busuk Pangkal Batang (BSR) — Ganoderma boninense',
    recommendation: 'Segera lakukan penyemprotan fungisida pada area Blok A-12, Baris 8. Isolasi pohon dan tandai koordinat GPS untuk inspeksi lanjutan.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG,
    telemetry: { battery: 85, altitude: 25.3, speed: 4.2, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-72 dBm' },
    lat: 3.3578, lng: 114.6004,
  },
  {
    id: 'LOG-036', sessionId: 'Misi #037', timestamp: '2026-08-25T14:28:05',
    time: '14:28:05', date: '25 Agustus 2026',
    location: 'Blok D-02 Baris 15', gps: '3°21\'12.1"N 114°35\'47.3"E',
    classification: 'BSR Ringan', confidence: 55, severity: 'caution',
    healthy: 44.0, unhealthy: 56.0,
    disease: 'BSR Stadium Awal (Early Stage Ganoderma)',
    recommendation: 'Pantau secara berkala setiap 2 minggu. Aplikasikan fungisida preventif pada area sekitar pohon.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG,
    telemetry: { battery: 87, altitude: 24.8, speed: 3.9, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-69 dBm' },
    lat: 3.3566, lng: 114.5990,
  },
  {
    id: 'LOG-035', sessionId: 'Misi #037', timestamp: '2026-08-25T14:25:11',
    time: '14:25:11', date: '25 Agustus 2026',
    location: 'Blok B-05 Baris 1', gps: '3°21\'10.8"N 114°35\'46.0"E',
    classification: 'Sehat', confidence: 99, severity: 'ok',
    healthy: 99.2, unhealthy: 0.8,
    disease: 'Tidak terdeteksi penyakit',
    recommendation: 'Pohon dalam kondisi optimal. Lanjutkan pemantauan rutin sesuai jadwal.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG,
    telemetry: { battery: 88, altitude: 26.1, speed: 4.5, gpsSignal: 'Kuat · 13 Satelit', linkQuality: '-68 dBm' },
    lat: 3.3561, lng: 114.5983,
  },
  {
    id: 'LOG-034', sessionId: 'Misi #036', timestamp: '2026-08-24T09:14:22',
    time: '09:14:22', date: '24 Agustus 2026',
    location: 'Blok C-07 Baris 3', gps: '3°21\'09.4"N 114°35\'44.7"E',
    classification: 'BSR Sedang', confidence: 71, severity: 'warning',
    healthy: 28.5, unhealthy: 71.5,
    disease: 'BSR Stadium Sedang (Moderate Ganoderma)',
    recommendation: 'Lakukan penyemprotan fungisida segera dan inspeksi manual pada pangkal batang. Pertimbangkan isolasi dari pohon tetangga.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG,
    telemetry: { battery: 79, altitude: 22.7, speed: 3.5, gpsSignal: 'Sedang · 11 Satelit', linkQuality: '-75 dBm' },
    lat: 3.3556, lng: 114.5977,
  },
  {
    id: 'LOG-033', sessionId: 'Misi #036', timestamp: '2026-08-24T09:02:09',
    time: '09:02:09', date: '24 Agustus 2026',
    location: 'Blok A-09 Baris 4', gps: '3°21\'08.1"N 114°35\'43.2"E',
    classification: 'Sehat', confidence: 97, severity: 'ok',
    healthy: 97.1, unhealthy: 2.9,
    disease: 'Tidak terdeteksi penyakit',
    recommendation: 'Pohon dalam kondisi sangat baik. Pertahankan pola perawatan saat ini.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG,
    telemetry: { battery: 82, altitude: 23.5, speed: 3.8, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-70 dBm' },
    lat: 3.3556, lng: 114.5970,
  },
];

const SEV_STYLE = {
  ok:       { bg: `${T.green}20`,  text: T.green,  border: `${T.green}44`,  label: 'SEHAT',     labelEn: 'HEALTHY'  },
  caution:  { bg: `${T.amber}20`,  text: T.amber,  border: `${T.amber}44`,  label: 'PERHATIAN', labelEn: 'CAUTION'  },
  warning:  { bg: `${T.orange}20`, text: T.orange, border: `${T.orange}44`, label: 'WASPADA',   labelEn: 'WARNING'  },
  critical: { bg: `${T.red}18`,    text: T.red,    border: `${T.red}44`,    label: 'KRITIS',    labelEn: 'CRITICAL' },
};

// ── Detail View ───────────────────────────────────────────────────────
function LogDetailView({ log, onBack }: { log: PredictionLogEntry & { lat?: number; lng?: number }; onBack: () => void }) {
  const sev = SEV_STYLE[log.severity];
  const battColor = log.telemetry.battery > 50 ? T.green : log.telemetry.battery > 20 ? T.amber : T.red;

  // Waypoint tunggal untuk posisi log ini
  const waypoint: MapWaypoint[] = log.lat && log.lng ? [{
    lat: log.lat,
    lng: log.lng,
    id: log.id,
    label: log.classification,
    status: log.severity,
    time: log.time,
  }] : [];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 transition hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Daftar Log
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${T.violet}20`, color: T.violet }}>
              📂 LOG · {log.sessionId} · {log.date}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
              {sev.label}
            </span>
          </div>
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">
            {log.id} · {log.location}
          </h1>
        </div>
      </div>

      {/* Main Grid: Camera (2) + GPS Map (2) + Telemetri (1) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Camera Snapshot (2 col) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-[#1e1e1e] relative" style={{ minHeight: 280 }}>
            <img src={log.snapshotUrl} alt="Log snapshot" className="w-full h-full object-cover" style={{ minHeight: 280 }} />
            {['top-3 left-3 border-t-2 border-l-2','top-3 right-3 border-t-2 border-r-2','bottom-3 left-3 border-b-2 border-l-2','bottom-3 right-3 border-b-2 border-r-2'].map((pos, i) => (
              <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: T.green }} />
            ))}
            <div className="absolute border-2 rounded" style={{ top: '28%', left: '38%', width: '120px', height: '90px', borderColor: T.red, boxShadow: `0 0 10px ${T.red}55` }}>
              <span className="absolute -top-4 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.red, color: '#fff' }}>{log.confidence}%</span>
            </div>
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
              <span className="text-[10px] font-mono text-emerald-300">DP-DRONE-001 · {log.sessionId}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300">📂 REKAMAN</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-300">GPS: {log.gps}</span>
                <span className="text-xs font-mono text-emerald-300">{log.time} WIB</span>
              </div>
            </div>
          </div>

          {/* Metrics bar — angka saja */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
            {[
              { k: 'NDVI',      v: '0.72',                           c: T.green },
              { k: 'BANDWIDTH', v: '4.8 Mbps',                       c: T.violet },
              { k: 'LATENSI',   v: '48 ms',                          c: T.greenLight },
              { k: 'BATERAI',   v: `${log.telemetry.battery}%`,      c: battColor },
              { k: 'KETINGGIAN',v: `${log.telemetry.altitude} m`,    c: T.green },
              { k: 'KECEPATAN', v: `${log.telemetry.speed} m/s`,     c: T.amber },
              { k: 'GPS',       v: log.telemetry.gpsSignal,          c: T.green },
              { k: 'LINK',      v: log.telemetry.linkQuality,        c: T.greenLight },
            ].map(i => (
              <div key={i.k} className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400">{i.k}:</span>
                <span className="text-[10px] font-bold font-mono" style={{ color: i.c }}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GPS Map Riwayat (2 col) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#1e1e1e]">
            <DroneMap
              mode="waypoints"
              waypoints={waypoint}
              height={280}
              droneOn={true}
            />
          </div>
          {/* Koordinat info */}
          <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between text-[10px]">
            <span className="font-semibold text-gray-400">KOORDINAT GPS:</span>
            <span className="font-mono" style={{ color: T.green }}>{log.gps}</span>
          </div>
        </div>

        {/* Telemetri (1 col) */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4 h-full">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-4">Telemetri Saat Log / Telemetry at Log</p>
            <div className="space-y-4">
              {[
                { label: 'Baterai',    value: `${log.telemetry.battery}%`,   color: battColor,      icon: '🔋' },
                { label: 'GPS Signal', value: log.telemetry.gpsSignal,       color: T.green,        icon: '📡' },
                { label: 'Ketinggian', value: `${log.telemetry.altitude} m`, color: T.green,        icon: '📏' },
                { label: 'Kecepatan',  value: `${log.telemetry.speed} m/s`, color: T.amber,        icon: '⚡' },
                { label: 'Link',       value: log.telemetry.linkQuality,     color: T.greenLight,   icon: '📶' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Result */}
      <div className="rounded-xl overflow-hidden bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base"
              style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}>🤖</div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Hasil Prediksi AI</h2>
              <p className="text-[11px] text-gray-400">Palm Health AI Prediction · CNN ResNet-50 Model</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
            {sev.label} / {sev.labelEn}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NDVI Output */}
            <div className="rounded-xl border border-gray-100 dark:border-[#1e1e1e] overflow-hidden bg-gray-50 dark:bg-[#0f0f0f]">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1e1e1e]">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Output NDVI AI</p>
              </div>
              <div className="relative aspect-video overflow-hidden">
                <img src={log.ndviUrl} alt="NDVI" className="w-full h-full object-cover" />
                <div className="absolute inset-0 opacity-15"
                  style={{ backgroundImage: `linear-gradient(${T.violet}44 1px, transparent 1px), linear-gradient(90deg, ${T.violet}44 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
              </div>
            </div>

            {/* Hasil probabilitas */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{log.disease}</p>
                <p className="text-[10px] text-gray-400">{log.classification} · {log.confidence}% keyakinan</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Sehat / Healthy</span>
                    <span className="text-xs font-bold" style={{ color: T.green }}>{log.healthy}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                    <div className="h-2.5 rounded-full" style={{ width: `${log.healthy}%`, background: `linear-gradient(90deg, ${T.green}, ${T.greenLight})` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Tidak Sehat / Unhealthy</span>
                    <span className="text-xs font-bold" style={{ color: T.red }}>{log.unhealthy}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                    <div className="h-2.5 rounded-full" style={{ width: `${log.unhealthy}%`, background: `linear-gradient(90deg, ${T.red}, ${T.orange})` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-3 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1e1e1e]">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">💡 Rekomendasi:</p>
                <p className="text-xs text-gray-500 leading-relaxed">{log.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main List View ────────────────────────────────────────────────────
export default function LogPrediksiSection() {
  const [selectedLog, setSelectedLog] = useState<PredictionLogEntry | null>(null);
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState<string>('all');

  const filtered = MOCK_LOGS.filter(log => {
    const matchSearch = search === '' ||
      log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.location.toLowerCase().includes(search.toLowerCase()) ||
      log.classification.toLowerCase().includes(search.toLowerCase());
    const matchSev = filterSev === 'all' || log.severity === filterSev;
    return matchSearch && matchSev;
  });

  // Waypoints semua log untuk overview map
  const allWaypoints: MapWaypoint[] = MOCK_LOGS
    .filter(l => (l as PredictionLogEntry & { lat?: number; lng?: number }).lat)
    .map(l => {
      const ll = l as PredictionLogEntry & { lat?: number; lng?: number };
      return {
        lat: ll.lat!,
        lng: ll.lng!,
        id: l.id,
        label: l.classification,
        status: l.severity,
        time: l.time,
      };
    });

  if (selectedLog) {
    return (
      <LogDetailView
        log={selectedLog as PredictionLogEntry & { lat?: number; lng?: number }}
        onBack={() => setSelectedLog(null)}
      />
    );
  }

  // Hitung statistik
  const totalLogs = MOCK_LOGS.length;
  const criticalCount = MOCK_LOGS.filter(l => l.severity === 'critical').length;
  const healthyCount = MOCK_LOGS.filter(l => l.severity === 'ok').length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Log Prediksi AI</h1>
          <p className="text-xs text-gray-500 mt-0.5">AI Prediction Log · Riwayat deteksi dan analisis kesehatan sawit</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: `${T.violet}20`, color: T.violet, border: `1px solid ${T.violet}33` }}>
          {totalLogs} Log Tersimpan
        </span>
      </div>

      {/* Stat mini cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Log', value: totalLogs, icon: '📋', color: T.violet },
          { label: 'Kritis / BSR', value: criticalCount, icon: '🚨', color: T.red },
          { label: 'Pohon Sehat', value: healthyCount, icon: '✅', color: T.green },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-[10px] text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overview GPS Map semua log */}
      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-[#1e1e1e]">
        <div className="px-4 py-3 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Peta Sebaran Deteksi</p>
          <p className="text-[10px] text-gray-400">Klik marker untuk melihat detail log</p>
        </div>
        <DroneMap
          mode="waypoints"
          waypoints={allWaypoints}
          height={260}
          droneOn={true}
          onWaypointClick={(wp) => {
            const log = MOCK_LOGS.find(l => l.id === wp.id);
            if (log) setSelectedLog(log);
          }}
        />
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari ID, lokasi, atau klasifikasi..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 focus:outline-none">
          <option value="all">Semua Status</option>
          <option value="ok">Sehat</option>
          <option value="caution">Perhatian</option>
          <option value="warning">Waspada</option>
          <option value="critical">Kritis</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-[#1e1e1e]">
                <th className="px-5 py-3 font-semibold">ID Log</th>
                <th className="px-5 py-3 font-semibold">Sesi</th>
                <th className="px-5 py-3 font-semibold">Waktu & Tanggal</th>
                <th className="px-5 py-3 font-semibold">Lokasi</th>
                <th className="px-5 py-3 font-semibold">Klasifikasi AI</th>
                <th className="px-5 py-3 font-semibold">Keyakinan</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1a1a1a]">
              {filtered.map(log => {
                const s = SEV_STYLE[log.severity];
                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{log.id}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{log.sessionId}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-mono text-xs text-gray-700 dark:text-gray-300">{log.time} WIB</span>
                      <span className="block text-[10px] text-gray-400">{log.date}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-700 dark:text-gray-300">{log.location}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-900 dark:text-gray-100">{log.classification}</td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: s.text }}>{log.confidence}%</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-md transition hover:opacity-80"
                        style={{ background: `${T.violet}15`, color: T.violet }}>
                        🔍 Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-xs text-gray-400">
                    Tidak ada log yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
