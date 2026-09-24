"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DRONE_TOKENS, type PredictionLogEntry } from '../layout/monitoringOperator-types';
import type { MapWaypoint } from './drone-map';
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Battery, Camera, CheckCircle, CheckCircle2, FileText, Info, MoveHorizontal, Radio, SatelliteDish, Wifi } from 'lucide-react';

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
    classification: 'BSR Parah', confidence: 94, severity: 'critical', healthStatus: 'unhealthy',
    healthy: 12.4, unhealthy: 87.6,
    disease: 'Busuk Pangkal Batang (BSR) — Ganoderma boninense',
    recommendation: 'Segera lakukan penyemprotan fungisida pada area Blok A-12, Baris 8. Isolasi pohon dan tandai koordinat GPS untuk inspeksi lanjutan.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG, ndviValue: 0.18,
    freqLink: 52.4,
    distance: 124.5,
    elevationSpeed: 10.4,
    telemetry: { battery: 85, altitude: 25.3, speed: 4.2, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-72 dBm' },
    lat: 3.3578, lng: 114.6004,
  },
  {
    id: 'LOG-036', sessionId: 'Misi #037', timestamp: '2026-08-25T14:28:05',
    time: '14:28:05', date: '25 Agustus 2026',
    location: 'Blok D-02 Baris 15', gps: '3°21\'12.1"N 114°35\'47.3"E',
    classification: 'BSR Ringan', confidence: 55, severity: 'caution', healthStatus: 'unhealthy',
    healthy: 44.0, unhealthy: 56.0,
    disease: 'BSR Stadium Awal (Early Stage Ganoderma)',
    recommendation: 'Pantau secara berkala setiap 2 minggu. Aplikasikan fungisida preventif pada area sekitar pohon.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG, ndviValue: 0.20,
    freqLink: 52.4,
    distance: 114.5,
    elevationSpeed: 10.4,
    telemetry: { battery: 87, altitude: 24.8, speed: 3.9, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-69 dBm' },
    lat: 3.3566, lng: 114.5990,
  },
  {
    id: 'LOG-035', sessionId: 'Misi #037', timestamp: '2026-08-25T14:25:11',
    time: '14:25:11', date: '25 Agustus 2026',
    location: 'Blok B-05 Baris 1', gps: '3°21\'10.8"N 114°35\'46.0"E',
    classification: 'Sehat', confidence: 99, severity: 'ok', healthStatus: 'unhealthy',
    healthy: 99.2, unhealthy: 0.8,
    disease: 'Tidak terdeteksi penyakit',
    recommendation: 'Pohon dalam kondisi optimal. Lanjutkan pemantauan rutin sesuai jadwal.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG, ndviValue: 0.17,
    freqLink: 52.4,
    distance: 126.5,
    elevationSpeed: 10.4,
    telemetry: { battery: 88, altitude: 26.1, speed: 4.5, gpsSignal: 'Kuat · 13 Satelit', linkQuality: '-68 dBm' },
    lat: 3.3561, lng: 114.5983,
  },
  {
    id: 'LOG-034', sessionId: 'Misi #036', timestamp: '2026-08-24T09:14:22',
    time: '09:14:22', date: '24 Agustus 2026',
    location: 'Blok C-07 Baris 3', gps: '3°21\'09.4"N 114°35\'44.7"E',
    classification: 'BSR Sedang', confidence: 71, severity: 'warning', healthStatus: 'healthy',
    healthy: 28.5, unhealthy: 71.5,
    disease: 'BSR Stadium Sedang (Moderate Ganoderma)',
    recommendation: 'Lakukan penyemprotan fungisida segera dan inspeksi manual pada pangkal batang. Pertimbangkan isolasi dari pohon tetangga.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG, ndviValue: 0.25,
    freqLink: 52.4,
    distance: 194.5,
    elevationSpeed: 10.4,
    telemetry: { battery: 79, altitude: 22.7, speed: 3.5, gpsSignal: 'Sedang · 11 Satelit', linkQuality: '-75 dBm' },
    lat: 3.3556, lng: 114.5977,
  },
  {
    id: 'LOG-033', sessionId: 'Misi #036', timestamp: '2026-08-24T09:02:09',
    time: '09:02:09', date: '24 Agustus 2026',
    location: 'Blok A-09 Baris 4', gps: '3°21\'08.1"N 114°35\'43.2"E',
    classification: 'Sehat', confidence: 97, severity: 'ok', healthStatus: 'healthy',
    healthy: 97.1, unhealthy: 2.9,
    disease: 'Tidak terdeteksi penyakit',
    recommendation: 'Pohon dalam kondisi sangat baik. Pertahankan pola perawatan saat ini.',
    snapshotUrl: LIVE_IMG, ndviUrl: NDVI_IMG, ndviValue: 0.50,
    freqLink: 52.4,
    distance: 143.5,
    elevationSpeed: 10.2,
    telemetry: { battery: 82, altitude: 23.5, speed: 3.8, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-70 dBm' },
    lat: 3.3556, lng: 114.5970,
  },
];

// const SEV_STYLE = {
//   ok:       { bg: `${T.green}20`,  text: T.green,  border: `${T.green}44`,  label: 'SEHAT',     labelEn: 'HEALTHY'  },
//   caution:  { bg: `${T.amber}20`,  text: T.amber,  border: `${T.amber}44`,  label: 'PERHATIAN', labelEn: 'CAUTION'  },
//   warning:  { bg: `${T.orange}20`, text: T.orange, border: `${T.orange}44`, label: 'WASPADA',   labelEn: 'WARNING'  },
//   critical: { bg: `${T.red}18`,    text: T.red,    border: `${T.red}44`,    label: 'KRITIS',    labelEn: 'CRITICAL' },
// };

const HEALTH_STATUS_STYLE = {
  healthy:   { bg: `${T.green}20`,  text: T.green,  border: `${T.green}44`,  label: 'SEHAT',     labelEn: 'HEALTHY' },
  unhealthy: { bg: `${T.red}20`, text: T.red, border: `${T.red}44`, label: 'TIDAK SEHAT', labelEn: 'UNHEALTHY' },
};

// ── Detail View ───────────────────────────────────────────────────────
function LogDetailView({ log, onBack }: { log: PredictionLogEntry & { lat?: number; lng?: number }; onBack: () => void }) {
  const sev = HEALTH_STATUS_STYLE[log.healthStatus];
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
    <div className="space-y-4 mx-auto text-gray-800 dark:text-gray-100 select-none pb-8">
      <button onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 transition hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Log
      </button>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-0 bg-white">
          
          <div className="h-full w-full">
            <DroneMap
              mode="waypoints"
              waypoints={waypoint}
              height={280}
              droneOn={true}
            />
          </div>

          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] p-4 flex flex-col justify-between flex-1 min-h-[170px] shadow-xs">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-bold tracking-wider text-gray-700 dark:text-gray-300 uppercase font-mono">
                INFORMASI PENERBANGAN
              </h3>
            </div>
              <hr/>
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 flex-1 items-center px-1">
              {/* Ketinggian */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {log.telemetry.altitude.toFixed(1)}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Ketinggian</span>
              </div>

              {/* Kecepatan Naik */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <ArrowUp size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {log.elevationSpeed?.toFixed(1)}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m/s</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kecepatan Naik</span>
              </div>

              {/* Batre */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Battery size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {log.telemetry.battery}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">%</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Batre</span>
              </div>

              {/* Jarak dari Home */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <MoveHorizontal size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {log.distance?.toFixed(1)}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Jarak dari Home</span>
              </div>

              {/* Kecepatan Jelajah */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {log.telemetry.speed.toFixed(1)}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m/s</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kecepatan Jelajah</span>
              </div>

              {/* Frekuensi Link */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <SatelliteDish size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {log.freqLink?.toFixed(1)}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">GHz</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Frekuensi Link</span>
              </div>
            </div>
          </div>

        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-[#222]">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Snapshot</h3>
            <span className="text-xs font-mono text-gray-400 font-medium">
              {log.time}
            </span>
          </div>
          
          <div className="relative w-full aspect-[16/10] bg-gray-50 dark:bg-[#151515] overflow-hidden flex items-center justify-center">
                <img
                  src={log.snapshotUrl}
                  alt="Snapshot Pohon"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 text-[11px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {log.lat} {log.lng} · ALT {log.telemetry.altitude}
                </div>
          </div>
        </div>

        <div className={`rounded-xl border shadow-xs p-5 flex flex-col justify-between transition-colors duration-300 ${
          log.healthStatus === 'unhealthy'
            ? 'bg-[#FDF3F0] dark:bg-[#1E1412] border-[#FCE2DB] dark:border-[#38201a]'
            : 'bg-white dark:bg-[#111] border-gray-100 dark:border-[#222]'
        }`}>
          
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Hasil Prediksi AI</h3>
            {log.healthStatus === 'healthy' ? (
              <span className="px-3 py-1 bg-[#EAF5D6] text-[#6A9A1E] font-bold text-xs rounded tracking-wider">
                SEHAT
              </span>
            ) : (
              <span className="px-3 py-1 bg-[#FCE8E6] text-[#C84030] font-bold text-xs rounded tracking-wider">
                TIDAK SEHAT
              </span>
            )}
          </div>

          {/* Metric Center */}
          <div className="my-auto py-4 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              INDEKS NDVI
            </span>
            <div className={`text-5xl sm:text-6xl font-extrabold tracking-tight my-2 font-mono ${
              log.healthStatus === 'healthy'
                ? 'text-[#4D7C0F]'
                : 'text-[#E59819]'
            }`}>
              {log.healthStatus === 'healthy' ? '0.28' : '0.18'}
            </div>

            <div className="w-full max-w-md mt-2">
              <div className="relative w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width:
                      log.healthStatus === 'healthy'
                        ? '28%'
                        : '18%',
                    background:
                      log.healthStatus === 'healthy'
                        ? 'linear-gradient(to right, #7A1414 0%, #C83B2B 60%, #E67E22 100%)'
                        : 'linear-gradient(to right, #7A1414 0%, #C83B2B 100%)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1 px-0.5">
                <span>0.0</span>
                <span>0.2</span>
                <span>0.4</span>
                <span>0.6</span>
                <span>0.8</span>
                <span>1.0</span>
              </div>
            </div>
          </div>

          {/* loading AI ceritanya */}
          {log.healthStatus === 'healthy' ? (
            <div className="bg-[#F4F9EB] dark:bg-[#16210f] border border-[#D5E8B5] dark:border-[#2d421e] rounded-xl p-3.5 flex items-start gap-3 mt-2">
              <CheckCircle className="text-[#65A30D] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#4D7C0F] dark:text-[#84cc16]">Tanaman Sehat</h4>
                <p className="text-xs text-[#3F6212] dark:text-[#a3e635] mt-0.5 leading-relaxed">
                  Tidak diperlukan tindakan. Lanjutkan ke pohon berikutnya.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFF5ED] dark:bg-[#251810] border border-[#FFE4D3] dark:border-[#42291d] rounded-xl p-3.5 flex items-start gap-3 mt-2">
              <AlertTriangle className="text-[#EA580C] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-bold text-[#EA580C]">Tindakan Diperlukan</h4>
                <p className="text-xs text-[#9A3412] dark:text-[#fdba74] mt-0.5 leading-relaxed">
                  Instruksikan pilot untuk menyemprotkan pestisida ke pangkal batang menggunakan Remote Control.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>


      <div className={`bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs p-5 transition-opacity duration-300 opacity-40 pointer-events-none`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Monitor Penyemprotan Pestisida</h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#EAF5D6] text-[#6A9A1E] dark:bg-[#1f2d12] dark:text-[#a3e635] flex items-center gap-1">
            PENYEMPROTAN SELESAI
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#222] gap-y-4 md:gap-y-0">
          
          {/* Durasi */}
          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              DURASI
            </span>
            <div className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 font-mono mt-1">
              01:00
            </div>
            <span className="text-[11px] font-mono text-gray-400 mt-0.5">
              mm:ss
            </span>
          </div>

          {/* Volume Keluar */}
          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              VOLUME KELUAR
            </span>
            <div className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 font-mono mt-1">
              {100}
            </div>
            <span className="text-[11px] font-medium text-gray-400 mt-0.5">
              ml
            </span>
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
    const matchSev = filterSev === 'all' || log.healthStatus === filterSev;
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

  const icons = {
    total: <div className='p-3 rounded-xl bg-[#C1D34318]'>
              <FileText size={18} color={'#C1D343'} />
            </div>,
    critical: <div className='p-3 rounded-xl bg-[#99000018]'>
                <AlertTriangle size={18} color={'#990000'} />
              </div>,
    healthy: <div className='p-3 rounded-xl bg-[#C1D34318]'>
              <CheckCircle2 size={18} color={'#C1D343'} />
            </div>,
  };
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Log Prediksi AI</h1>
          <p className="text-xs text-gray-500 mt-0.5">AI Prediction Log · Riwayat deteksi dan analisis kesehatan sawit</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 border border-slate-300">
          {totalLogs} Log Tersimpan
        </span>
      </div>

      {/* Stat mini cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Log', value: totalLogs, icon: icons.total, color: T.violet },
          { label: 'Tidak Sehat', value: criticalCount, icon: icons.critical, color: T.red },
          { label: 'Pohon Sehat', value: healthyCount, icon: icons.healthy, color: T.green },
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
          <option value="all">Klasifikasi</option>
          <option value="healthy">Sehat</option>
          <option value="unhealthy">Tidak Sehat</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-x-auto lg:overflow-visible">
        <div className="">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-[#1e1e1e]">
                <th className="px-5 py-3 font-semibold">ID Log</th>
                <th className="px-5 py-3 font-semibold">Waktu DAN Tanggal</th>
                <th className="px-5 py-3 font-semibold">Koordinat GPS</th>
                <th className="px-5 py-3 font-semibold">Nilai NDVI</th>
                <th className="px-5 py-3 font-semibold">Klasifikasi AI</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1a1a1a]">
              {filtered.map(log => {
                const healthStat = HEALTH_STATUS_STYLE[log.healthStatus];
                return (
                  <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{log.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-mono text-xs text-gray-700 dark:text-gray-300">{log.time} WIB</span>
                      <span className="block text-[10px] text-gray-400">{log.date}</span>
                    </td>
                    <td className="flex flex-col px-5 py-3.5 text-xs text-[#6B8E23] font-semibold">
                      <span>{log.lat}°N</span>
                      <span>{log.lng}°E</span>
                    </td>
                    <td className={`px-5 py-3.5 text-xs font-bold text-${healthStat.text} dark:text-gray-100`} style={{ color: healthStat.text }}>{log.ndviValue}</td>
                    <td className={`px-5 py-3.5 text-xs font-bold text-[${healthStat.text}]`}>{healthStat.label}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition hover:opacity-80"
                        style={{ background: `${T.violet}15`, color: T.violet }}>
                        <Info size={12}/> Detail
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
