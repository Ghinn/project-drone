"use client";

import { useState, useEffect, useMemo } from 'react';
import { FileText, MapPin, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;

// Tipe data berdasarkan API Log Prediksi
type PredictionLogData = {
  id: string;
  timestamp: string;
  classification: string;
  ndviAI: number;
  latitudeAI: number;
  longitudeAI: number;
};

export default function DashboardSection() {
  const { setActiveTab } = useMonitoringOperator();
  const [tick, setTick] = useState<Date | null>(null);
  
  // State untuk data API
  const [logs, setLogs] = useState<PredictionLogData[]>([]);
  const [loading, setLoading] = useState(true);

  // Efek untuk jam real-time
  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Efek untuk Fetch Data API
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

  // Kalkulasi Statistik Dinamis
  const totalPohon = logs.length;
  const pohonSehat = logs.filter(l => l.classification === 'sehat').length;
  const pohonTidakSehat = logs.filter(l => l.classification === 'tidak_sehat').length;

  const HEALTH_PCT = totalPohon > 0 ? Number(((pohonSehat / totalPohon) * 100).toFixed(1)) : 0;
  const UNHEALTH_PCT = totalPohon > 0 ? Number(((pohonTidakSehat / totalPohon) * 100).toFixed(1)) : 0;

  // Mendapatkan 5 deteksi terbaru untuk tabel
  const recentDetections = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.slice(0, 5);
  }, [logs]);

  // Data Cards Dinamis
  const STAT_CARDS = [
    { 
      label: 'TOTAL POHON TERDETEKSI', 
      value: totalPohon.toLocaleString('id-ID'), 
      unit: 'pohon', 
      icon: MapPin,
      bg: '#275225', 
      textColor: '#ffffff' 
    },
    { 
      label: 'POHON SEHAT', 
      value: pohonSehat.toLocaleString('id-ID'), 
      unit: 'pohon', 
      icon: CheckCircle2,
      bg: '#4E882A', 
      textColor: '#ffffff' 
    },
    { 
      label: 'POHON TIDAK SEHAT', 
      value: pohonTidakSehat.toLocaleString('id-ID'), 
      unit: 'pohon', 
      icon: AlertTriangle,
      bg: '#8F2828', 
      textColor: '#ffffff' 
    },
  ];

  return (
    <div className="space-y-5 text-gray-800 dark:text-gray-100 select-none pb-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Ringkasan Misi Drone
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Mission Summary · Update terakhir: {tick ? tick.toLocaleTimeString('id-ID') : '20.07.00'}
        </p>
      </div>

      {/* Kartu kartu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div 
              key={card.label} 
              className="rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-xs text-white"
              style={{ backgroundColor: card.bg }}
            >
              <div className="absolute top-2 right-2 opacity-15 pointer-events-none">
                <Icon size={70} strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-bold tracking-wider uppercase block opacity-90">
                  {card.label}
                </span>
                
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold opacity-85">
                    {card.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Donut Chart Card */}
        <div className="rounded-xl p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] flex flex-col items-center justify-between shadow-xs">
          <div className="relative w-24 h-24 my-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4.5" className="dark:stroke-[#1e1e1e]" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#5F802A" strokeWidth="4.5" strokeDasharray={`${HEALTH_PCT * 0.879} ${100 - HEALTH_PCT * 0.879}`} strokeLinecap="round" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#C84030" strokeWidth="4.5" strokeDasharray={`${UNHEALTH_PCT * 0.879} ${100 - UNHEALTH_PCT * 0.879}`} strokeDashoffset={`${-(HEALTH_PCT * 0.879)}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100">{HEALTH_PCT}%</span>
              <span className="text-[8px] text-gray-400 font-medium leading-tight">Sehat</span>
            </div>
          </div>

          <div className="w-full space-y-1 mt-2 px-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#5F802A]" />
                <span className="text-gray-500 dark:text-gray-400">Sehat</span>
              </span>
              <span className="font-bold font-mono text-gray-700 dark:text-gray-300">{HEALTH_PCT}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#C84030]" />
                <span className="text-gray-500 dark:text-gray-400">Tidak Sehat</span>
              </span>
              <span className="font-bold font-mono text-gray-700 dark:text-gray-300">{UNHEALTH_PCT}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Deteksi Terbaru */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] overflow-hidden shadow-xs">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EAF5D6] dark:bg-[#1f2d12] flex items-center justify-center text-[#6A9A1E]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Deteksi Terbaru
              </h3>
              <p className="text-[11px] text-gray-400">
                Hasil inference AI real-time dari kamera drone
              </p>
            </div>
          </div>

          {/* Tombol Lihat Semua -> Menuju Log Prediksi */}
          <button
            onClick={() => setActiveTab('log-prediksi')}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#202020] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-all cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#161616] text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#222]">
                <th className="px-6 py-3.5">ID LOG</th>
                <th className="px-6 py-3.5 text-center">WAKTU DAN TANGGAL</th>
                <th className="px-6 py-3.5 text-center">KOORDINAT GPS</th>
                <th className="px-6 py-3.5 text-center">NILAI NDVI</th>
                <th className="px-6 py-3.5 text-center">KLASIFIKASI AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1f1f1f] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-[#6A717F]">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#84994F]" />
                      <span>Memuat deteksi terbaru...</span>
                    </div>
                  </td>
                </tr>
              ) : recentDetections.length > 0 ? (
                recentDetections.map(d => {
                  const isHealthy = d.classification === 'sehat';
                  
                  // Parsing Tanggal dari Timestamp API
                  const dt = new Date(d.timestamp);
                  const dateStr = dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                  const timeStr = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

                  return (
                    <tr key={d.id} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-gray-500">
                        #{d.id.slice(-7).toUpperCase()}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{timeStr} WIB</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{dateStr}</div>
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-300">
                        <div>{d.latitudeAI.toFixed(4)}°N</div>
                        <div className="mt-0.5">{d.longitudeAI.toFixed(4)}°E</div>
                      </td>

                      <td className="px-6 py-4 text-center font-mono font-bold">
                        <span className={!isHealthy ? 'text-[#C84030]' : 'text-[#5F802A]'}>
                          {d.ndviAI.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-bold">
                        <span className={!isHealthy ? 'text-[#C84030]' : 'text-[#5F802A]'}>
                          {isHealthy ? 'Sehat' : 'Tidak Sehat'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-xs text-gray-400">
                    Tidak ada deteksi yang ditemukan
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