"use client";
import { useState, useEffect } from 'react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;

const STAT_CARDS = [
  { label: 'Total Pohon Terdeteksi', value: '1.248', unit: 'pohon', icon: '🌴', color: T.green },
  { label: 'Pohon Sehat', value: '1.037', unit: 'pohon', icon: '✅', color: T.green },
  { label: 'Pohon Tidak Sehat', value: '211', unit: 'pohon', icon: '⚠️', color: T.red },
  { label: 'Persentase Sehat', value: '83.1', unit: '%', icon: '📊', color: T.green },
];

const CLASSIFICATION_DATA = [
  { cls: 'Sehat (Normal)', count: 1037, pct: 83.1, color: T.green },
  { cls: 'BSR Ringan (Early Stage)', count: 98, pct: 7.9, color: T.amber },
  { cls: 'BSR Sedang (Moderate)', count: 79, pct: 6.3, color: T.orange },
  { cls: 'BSR Parah (Severe)', count: 34, pct: 2.7, color: T.red },
];

const RECENT_DETECTIONS = [
  { id: 'DET-037', loc: 'Blok A-12 Baris 8', cls: 'BSR Parah', conf: 94, status: 'critical', time: '14:32:17' },
  { id: 'DET-036', loc: 'Blok C-07 Baris 3', cls: 'BSR Sedang', conf: 71, status: 'warning', time: '14:30:44' },
  { id: 'DET-035', loc: 'Blok D-02 Baris 15', cls: 'BSR Ringan', conf: 55, status: 'caution', time: '14:28:05' },
  { id: 'DET-034', loc: 'Blok B-05 Baris 1', cls: 'Sehat', conf: 99, status: 'ok', time: '14:25:11' },
  { id: 'DET-033', loc: 'Blok A-09 Baris 4', cls: 'Sehat', conf: 97, status: 'ok', time: '14:22:38' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: `${T.red}22`, text: T.red, label: 'KRITIS' },
  warning:  { bg: `${T.orange}22`, text: T.orange, label: 'WASPADA' },
  caution:  { bg: `${T.amber}22`, text: T.amber, label: 'PERHATIAN' },
  ok:       { bg: `${T.green}22`, text: T.green, label: 'SEHAT' },
};

export default function Dashboard() {
  const { battery, spray } = useMonitoringOperator();
  const [tick, setTick] = useState<Date | null>(null);

  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const battColor = battery > 50 ? T.green : battery > 20 ? T.amber : T.red;
  const healthPct = 83.1;
  const unhealthPct = 16.9;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ringkasan Misi Drone</h1>
          <p className="text-xs text-gray-500 mt-0.5">Penerbangan aktif · Update terakhir: {tick ? tick.toLocaleTimeString('id-ID') : '--:--:--'}</p>
        </div>
        <span
          className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}44` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          LIVE · Misi #037
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div
            key={card.label}
            className="rounded-lg p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{card.label}</span>
              <span className="text-lg">{card.icon}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</span>
              <span className="text-sm" style={{ color: card.color }}>{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Donut Chart + Breakdown */}
        <div className="lg:col-span-1 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-6">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Distribusi Klasifikasi Pohon</p>

          {/* Donut Visual */}
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3.5" className="dark:stroke-[#1e1e1e]" />
                {/* Healthy arc */}
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={T.green} strokeWidth="3.5"
                  strokeDasharray={`${healthPct * 0.879} ${100 - healthPct * 0.879}`}
                  strokeLinecap="round"
                />
                {/* Unhealthy arc */}
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={T.red} strokeWidth="3.5"
                  strokeDasharray={`${unhealthPct * 0.879} ${100 - unhealthPct * 0.879}`}
                  strokeDashoffset={`${-(healthPct * 0.879)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">83%</span>
                <span className="text-xs text-gray-400">Sehat</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2.5">
            {CLASSIFICATION_DATA.map(d => (
              <div key={d.cls}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{d.cls}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: d.color }}>{d.pct}%</span>
                    <span className="text-xs text-gray-400">({d.count})</span>
                  </div>
                </div>
                <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                  <div className="h-1 rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Detections Table */}
        <div className="lg:col-span-2 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Deteksi Terbaru</p>
            <p className="text-xs text-gray-400 mt-0.5">Hasil inference AI real-time dari kamera drone</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-xs text-gray-400 uppercase border-b border-gray-100 dark:border-[#1e1e1e]">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Lokasi</th>
                  <th className="px-5 py-3 font-semibold">Klasifikasi</th>
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
                        <span
                          className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: s.bg, color: s.text }}
                        >
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

      {/* Bottom Row - Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Baterai Drone', value: battery.toFixed(0), unit: '%', pct: Math.round(battery), color: battColor },
          { label: 'Tangki Semprot', value: String(spray), unit: '%', pct: spray, color: T.violet },
          { label: 'Ketinggian', value: '25.3', unit: 'm', color: T.green },
          { label: 'Kecepatan', value: '4.2', unit: 'm/s', color: T.amber },
        ].map(item => (
          <div key={item.label} className="rounded-lg p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-3">{item.label}</span>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
              <span className="text-sm" style={{ color: item.color }}>{item.unit}</span>
            </div>
            {item.pct !== undefined && (
              <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}