"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import { 
  AlertTriangle, 
  ArrowRight, 
  ArrowUp, 
  ArrowUpDown,
  Battery,
  CheckCircle,
  CheckCircle2,
  FileText,
  Info,
  MoveHorizontal,
  Wifi,
  Loader2
} from 'lucide-react';
import type { MapWaypoint } from './drone-map';

// Import Logic 3D Client Tanpa SSR
const DroneMap = dynamic(() => import('./drone-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-[#111] flex items-center justify-center min-h-[210px]">
      <span className="text-xs text-gray-400">Memuat peta GPS 3D...</span>
    </div>
  ),
});

const T = DRONE_TOKENS;

type SprayLog = {
  durationSpray: number;
  volumeSpray: number;
};

type PredictionLogData = {
  id: string;
  timestamp: string;
  snapshotRAW: string;
  classification: string;
  ndviRAW: number;
  ndviAI: number;
  altitudeAI: number;
  latitudeAI: number;
  longitudeAI: number;
  groundSpeedAI: number | null;
  climbRateAI: number | null;
  distanceToHomeAI: number | null;
  batteryAI: number | null;
  radioAI: any | null;
  spray: SprayLog | null; // Data relasi 1:1
};

const CLASSIFICATION_STYLE: Record<string, any> = {
  sehat:       { bg: `${T.green}20`, text: T.green, border: `${T.green}44`, label: 'SEHAT' },
  tidak_sehat: { bg: `${T.red}20`,   text: T.red,   border: `${T.red}44`,   label: 'TIDAK SEHAT' },
};

// const SEV_STYLE = {
//   ok:       { bg: `${T.green}20`,  text: T.green,  border: `${T.green}44`,  label: 'SEHAT',     labelEn: 'HEALTHY'  },
//   caution:  { bg: `${T.amber}20`,  text: T.amber,  border: `${T.amber}44`,  label: 'PERHATIAN', labelEn: 'CAUTION'  },
//   warning:  { bg: `${T.orange}20`, text: T.orange, border: `${T.orange}44`, label: 'WASPADA',   labelEn: 'WARNING'  },
//   critical: { bg: `${T.red}18`,    text: T.red,    border: `${T.red}44`,    label: 'KRITIS',    labelEn: 'CRITICAL' },
// };

function LogDetailView({ log, onBack }: { log: PredictionLogData; onBack: () => void }) {

  const [operatorPos, setOperatorPos] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOperatorPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.warn("[GPS] Gagal mendapatkan lokasi perangkat:", error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Parsing Tanggal dan Waktu
  const logDate = new Date(log.timestamp);
  const timeStr = logDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  
  // Format Durasi Spray (mm:ss)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isHealthy = log.classification === 'sehat';
  const cStyle = isHealthy ? CLASSIFICATION_STYLE.sehat : CLASSIFICATION_STYLE.tidak_sehat;

  // Waypoint tunggal untuk posisi log ini
  const waypoint: MapWaypoint[] = [{
    lat: log.latitudeAI,
    lng: log.longitudeAI,
    id: log.id,
    label: log.classification,
    status: isHealthy ? 'ok' : 'critical',
    time: timeStr,
  }];

  // [seed-test-log-prediction.ts] Tentukan Home statis berdasarkan koordinat log
  const homeJonggol = { lat: -6.475715, lng: 107.032235 };
  const homeCikabayan = { lat: -6.552211705425046, lng: 106.7185597960522 };

  // Deteksi dinamis: Jika koordinat log lebih dekat ke Cikabayan, gunakan Home Cikabayan. Sebaliknya ke Jonggol.
  const distToJonggol = Math.abs(log.latitudeAI - homeJonggol.lat) + Math.abs(log.longitudeAI - homeJonggol.lng);
  const distToCikabayan = Math.abs(log.latitudeAI - homeCikabayan.lat) + Math.abs(log.longitudeAI - homeCikabayan.lng);

  const staticHomePos = distToCikabayan < distToJonggol ? homeCikabayan : homeJonggol;

  // Bukan [seed-test-log-prediction.ts]
  const logPosition = { 
    lat: log.latitudeAI, 
    lng: log.longitudeAI, 
    yaw: 0 
  };

  // Parsing radio.rssi (Kualitas Sinyal)
  const rssiVal = log.radioAI?.rssi ? Math.round((log.radioAI.rssi / 254) * 100) : 0;

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
              mode="live"
              waypoints={waypoint}
              height={280}
              droneOn={true}
              dronePosition={logPosition}
              // [seed-test-log-prediction.ts]
              operatorPosition={staticHomePos}
              // Bukan [seed-test-log-prediction.ts]
              // operatorPosition={operatorPos || logPosition}
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
                    {(log.altitudeAI ?? 0).toFixed(2)}{' '}
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
                    {(log.climbRateAI ?? 0).toFixed(2)}{' '}
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
                    {(log.batteryAI ?? 0).toFixed(0)}
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
                    {(log.distanceToHomeAI ?? 0).toFixed(2)}{' '}
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
                    {(log.groundSpeedAI ?? 0).toFixed(2)}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">m/s</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kecepatan Jelajah</span>
              </div>

              {/* Frekuensi Link */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Wifi size={18} className="text-[#3A5A40] dark:text-gray-400 shrink-0 stroke-[2.2]" />
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-800 dark:text-gray-100">
                    {rssiVal}{' '}
                    <span className="text-xs sm:text-sm font-semibold text-[#5D7E2A]">%</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium mt-0.5">Kualitas Sinyal</span>
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
              {timeStr}
            </span>
          </div>
          
          <div className="relative w-full aspect-[16/10] bg-gray-50 dark:bg-[#151515] overflow-hidden flex items-center justify-center">
                <img
                  src={log.snapshotRAW}
                  alt="Snapshot Pohon"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 text-[11px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {log.latitudeAI.toFixed(6)} {log.longitudeAI.toFixed(6)} · ALT {(log.altitudeAI ?? 0).toFixed(2)}
                </div>
          </div>
        </div>

        <div className={`rounded-xl border shadow-xs p-5 flex flex-col justify-between transition-colors duration-300 ${
          !isHealthy
            ? 'bg-[#FDF3F0] dark:bg-[#1E1412] border-[#FCE2DB] dark:border-[#38201a]'
            : 'bg-white dark:bg-[#111] border-gray-100 dark:border-[#222]'
        }`}>
          
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Hasil Prediksi AI</h3>
            {isHealthy ? (
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
              isHealthy
                ? 'text-[#4D7C0F]'
                : 'text-[#E59819]'
            }`}>
              {log.ndviAI.toFixed(2)}
            </div>

            <div className="w-full max-w-md mt-2">
              <div className="relative w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width:
                      `${log.ndviAI * 100}%`,
                    background:
                      isHealthy
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

          {/* Recommendation AI */}
          {isHealthy ? (
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
                  Lakukan peyemprotkan pestisida ke pangkal batang menggunakan Remote Control.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>


      <div className={`bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-[#222] shadow-xs p-5 transition-opacity duration-300 ${
        !log.spray ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">Monitor Penyemprotan Pestisida</h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#EAF5D6] text-[#6A9A1E] dark:bg-[#1f2d12] dark:text-[#a3e635] flex items-center gap-1">
            {log.spray ? 'PENYEMPROTAN SELESAI' : 'PENYEMPROTAN BELUM DILAKUKAN'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#222] gap-y-4 md:gap-y-0">
          
          {/* Durasi */}
          <div className="flex flex-col items-center justify-center px-4 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              DURASI
            </span>
            <div className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 font-mono mt-1">
              {log.spray ? formatDuration(log.spray.durationSpray) : '00:00'}
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
              {log.spray ? log.spray.volumeSpray.toFixed(1) : '0.0'}
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

export default function LogPrediksiSection() {
  const [logs, setLogs] = useState<PredictionLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<PredictionLogData | null>(null);
  
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Real Data dari API Backend
  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/monitoringOperator/log-prediction'); 
        if (res.ok) {
          const result = await res.json();
          if (result.data && isMounted) {
            setLogs(result.data);
          }
        } else {
          console.warn("[Operator] Gagal memuat data /monitoringOperator/log-prediction");
        }
      } catch (error) {
        console.error("[Operator] Gagal fetching monitoringOperator/log-prediction", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLogs();
    return () => { isMounted = false; };
  }, []);

  // Pencarian berdasarkan Klasifikasi
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = search === '' || log.id.toLowerCase().includes(search.toLowerCase());
      const matchSev = filterSev === 'all' || log.classification === filterSev;
      return matchSearch && matchSev;
    });
  }, [logs, search, filterSev]);

  // Reset pagination ketika filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSev]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (selectedLog) {
    return (
      <LogDetailView
        log={selectedLog}
        onBack={() => setSelectedLog(null)}
      />
    );
  }

  // Hitung statistik
  const totalLogs = logs.length;
  const criticalCount = logs.filter(l => l.classification === 'tidak_sehat').length;
  const healthyCount = logs.filter(l => l.classification === 'sehat').length;

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
          <option value="sehat">Sehat</option>
          <option value="tidak_sehat">Tidak Sehat</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto lg:overflow-visible">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-[#1e1e1e]">
                <th className="px-5 py-3 font-semibold">ID Log</th>
                <th className="px-5 py-3 font-semibold">Waktu dan Tanggal</th>
                <th className="px-5 py-3 font-semibold">Koordinat GPS</th>
                <th className="px-5 py-3 font-semibold">Nilai NDVI</th>
                <th className="px-5 py-3 font-semibold">Klasifikasi AI</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1a1a1a]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#6A717F]">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#84994F]" />
                      <span>Memuat data log prediksi...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map(log => {
                  const isHealthy = log.classification === 'sehat';
                  const cStyle = isHealthy ? CLASSIFICATION_STYLE.sehat : CLASSIFICATION_STYLE.tidak_sehat;
                  
                  const dt = new Date(log.timestamp);
                  const dateStr = dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                  const timeStr = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                        #{log.id.slice(-7).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block font-mono text-xs text-gray-700 dark:text-gray-300">{timeStr} WIB</span>
                        <span className="block text-[10px] text-gray-400">{dateStr}</span>
                      </td>
                      <td className="flex flex-col px-5 py-3.5 text-xs text-[#6B8E23] font-semibold">
                        <span>{log.latitudeAI.toFixed(4)}°N</span>
                        <span>{log.longitudeAI.toFixed(4)}°E</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold" style={{ color: cStyle.text }}>
                        {log.ndviAI.toFixed(2)}
                      </td>
                      <td className={`px-5 py-3.5 text-xs font-bold`} style={{ color: cStyle.text }}>
                        {cStyle.label}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition hover:opacity-80"
                          style={{ background: `${T.violet}15`, color: T.violet }}>
                          <Info size={12}/> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-xs text-gray-400">
                    Tidak ada log prediksi yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        {!loading && filteredLogs.length > 0 && (
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#111]">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] dark:border-[#2a2a2a] rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-6 h-6 text-xs font-bold rounded-md transition-all
                    ${
                      currentPage === page
                        ? "bg-[#84994F] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] dark:border-[#2a2a2a] rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

    </div>
  );
}