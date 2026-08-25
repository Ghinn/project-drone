"use client";
import { useState } from 'react';
import { DRONE_TOKENS, type PredictionLogEntry } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;

const LIVE_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';
const NDVI_IMG = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';

// ── Mock data log prediksi ──────────────────────────────
const MOCK_LOGS: PredictionLogEntry[] = [
  {
    id: 'LOG-037',
    sessionId: 'Misi #037',
    timestamp: '2026-08-25T14:32:17',
    time: '14:32:17',
    date: '25 Agustus 2026',
    location: 'Blok A-12 Baris 8',
    gps: '3°21\'14.2"N 114°35\'48.9"E',
    classification: 'BSR Parah',
    confidence: 94,
    severity: 'critical',
    healthy: 12.4,
    unhealthy: 87.6,
    disease: 'Busuk Pangkal Batang (BSR) — Ganoderma boninense',
    recommendation: 'Segera lakukan penyemprotan fungisida pada area Blok A-12, Baris 8. Isolasi pohon dan tandai koordinat GPS untuk inspeksi lanjutan.',
    snapshotUrl: LIVE_IMG,
    ndviUrl: NDVI_IMG,
    telemetry: { battery: 85, spray: 62, altitude: 25.3, speed: 4.2, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-72 dBm' },
  },
  {
    id: 'LOG-036',
    sessionId: 'Misi #037',
    timestamp: '2026-08-25T14:28:05',
    time: '14:28:05',
    date: '25 Agustus 2026',
    location: 'Blok D-02 Baris 15',
    gps: '3°21\'12.1"N 114°35\'47.3"E',
    classification: 'BSR Ringan',
    confidence: 55,
    severity: 'caution',
    healthy: 44.0,
    unhealthy: 56.0,
    disease: 'BSR Stadium Awal (Early Stage Ganoderma)',
    recommendation: 'Pantau secara berkala setiap 2 minggu. Aplikasikan fungisida preventif pada area sekitar pohon.',
    snapshotUrl: LIVE_IMG,
    ndviUrl: NDVI_IMG,
    telemetry: { battery: 87, spray: 65, altitude: 24.8, speed: 3.9, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-69 dBm' },
  },
  {
    id: 'LOG-035',
    sessionId: 'Misi #037',
    timestamp: '2026-08-25T14:25:11',
    time: '14:25:11',
    date: '25 Agustus 2026',
    location: 'Blok B-05 Baris 1',
    gps: '3°21\'10.8"N 114°35\'46.0"E',
    classification: 'Sehat',
    confidence: 99,
    severity: 'ok',
    healthy: 99.2,
    unhealthy: 0.8,
    disease: 'Tidak terdeteksi penyakit',
    recommendation: 'Pohon dalam kondisi optimal. Lanjutkan pemantauan rutin sesuai jadwal.',
    snapshotUrl: LIVE_IMG,
    ndviUrl: NDVI_IMG,
    telemetry: { battery: 88, spray: 67, altitude: 26.1, speed: 4.5, gpsSignal: 'Kuat · 13 Satelit', linkQuality: '-68 dBm' },
  },
  {
    id: 'LOG-034',
    sessionId: 'Misi #036',
    timestamp: '2026-08-24T09:14:22',
    time: '09:14:22',
    date: '24 Agustus 2026',
    location: 'Blok C-07 Baris 3',
    gps: '3°21\'09.4"N 114°35\'44.7"E',
    classification: 'BSR Sedang',
    confidence: 71,
    severity: 'warning',
    healthy: 28.5,
    unhealthy: 71.5,
    disease: 'BSR Stadium Sedang (Moderate Ganoderma)',
    recommendation: 'Lakukan penyemprotan fungisida segera dan inspeksi manual pada pangkal batang. Pertimbangkan isolasi dari pohon tetangga.',
    snapshotUrl: LIVE_IMG,
    ndviUrl: NDVI_IMG,
    telemetry: { battery: 79, spray: 51, altitude: 22.7, speed: 3.5, gpsSignal: 'Sedang · 11 Satelit', linkQuality: '-75 dBm' },
  },
  {
    id: 'LOG-033',
    sessionId: 'Misi #036',
    timestamp: '2026-08-24T09:02:09',
    time: '09:02:09',
    date: '24 Agustus 2026',
    location: 'Blok A-09 Baris 4',
    gps: '3°21\'08.1"N 114°35\'43.2"E',
    classification: 'Sehat',
    confidence: 97,
    severity: 'ok',
    healthy: 97.1,
    unhealthy: 2.9,
    disease: 'Tidak terdeteksi penyakit',
    recommendation: 'Pohon dalam kondisi sangat baik. Pertahankan pola perawatan saat ini.',
    snapshotUrl: LIVE_IMG,
    ndviUrl: NDVI_IMG,
    telemetry: { battery: 82, spray: 55, altitude: 23.5, speed: 3.8, gpsSignal: 'Kuat · 14 Satelit', linkQuality: '-70 dBm' },
  },
];

// ── Severity style map ─────────────────────────────────
const SEV_STYLE = {
  ok:       { bg: `${T.green}20`, text: T.green, border: `${T.green}44`, label: 'SEHAT', labelEn: 'HEALTHY' },
  caution:  { bg: `${T.amber}20`, text: T.amber, border: `${T.amber}44`, label: 'PERHATIAN', labelEn: 'CAUTION' },
  warning:  { bg: `${T.orange}20`, text: T.orange, border: `${T.orange}44`, label: 'WASPADA', labelEn: 'WARNING' },
  critical: { bg: `${T.red}18`, text: T.red, border: `${T.red}44`, label: 'KRITIS', labelEn: 'CRITICAL' },
};

// ── Komponen: Detail Log (layout mirip Pantau Drone, read-only) ──────
function LogDetailView({ log, onBack }: { log: PredictionLogEntry; onBack: () => void }) {
  const sev = SEV_STYLE[log.severity];
  const battColor = log.telemetry.battery > 50 ? T.green : log.telemetry.battery > 20 ? T.amber : T.red;

  return (
    <div className="space-y-5">

      {/* Header Detail */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 transition hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]"
        >
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

      {/* Main Grid: Camera View + Telemetri saat itu */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Camera Snapshot (3/4) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-[#1e1e1e] relative min-h-[320px]">
            <img
              src={log.snapshotUrl}
              alt="Log snapshot"
              className="w-full h-full object-cover"
              style={{ minHeight: 320 }}
            />
            {/* HUD */}
            {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((pos, i) => (
              <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: T.green }} />
            ))}
            {/* Detection Box */}
            <div
              className="absolute border-2 rounded"
              style={{ top: '28%', left: '38%', width: '120px', height: '90px', borderColor: T.red, boxShadow: `0 0 10px ${T.red}55` }}
            >
              <span className="absolute -top-4 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.red, color: '#fff' }}>
                {log.confidence}%
              </span>
            </div>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
              <span className="text-[10px] font-mono text-emerald-300">DP-DRONE-001 · {log.sessionId}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                📂 REKAMAN
              </span>
            </div>
            {/* GPS bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-300">GPS: {log.gps}</span>
                <span className="text-xs font-mono text-emerald-300">{log.time} WIB · ALT: {log.telemetry.altitude} m</span>
              </div>
            </div>
          </div>

          {/* Bottom bar info */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400">SESI:</span>
              <span className="text-[10px] font-bold font-mono text-gray-700 dark:text-gray-300">{log.sessionId}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400">WAKTU:</span>
              <span className="text-[10px] font-bold font-mono" style={{ color: T.green }}>{log.time} WIB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400">LOKASI:</span>
              <span className="text-[10px] font-bold font-mono text-gray-700 dark:text-gray-300">{log.location}</span>
            </div>
          </div>
        </div>

        {/* Telemetri saat log diambil (1/4) */}
        <div className="flex flex-col gap-3">
          {/* Radar */}
          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Posisi Saat Rekaman</p>
            <div className="relative rounded-lg overflow-hidden flex items-center justify-center" style={{ height: 130, background: '#0F172A' }}>
              {[50, 37, 25, 12].map((r, i) => (
                <div key={i} className="absolute rounded-full border" style={{ width: r * 2, height: r * 2, borderColor: `${T.green}${i === 0 ? '18' : i === 1 ? '26' : i === 2 ? '40' : '70'}` }} />
              ))}
              <div className="absolute w-3 h-3 rounded-full border-2 border-white" style={{ background: T.green }} />
              <div className="absolute w-2 h-2 rounded-full" style={{ background: T.red, top: '30%', left: '60%' }} />
              <span className="absolute top-1 text-[8px] font-mono text-gray-500">N</span>
              <span className="absolute bottom-1 text-[8px] font-mono text-gray-500">S</span>
              <span className="absolute left-1 text-[8px] font-mono text-gray-500">W</span>
              <span className="absolute right-1 text-[8px] font-mono text-gray-500">E</span>
            </div>
          </div>

          {/* Telemetri saat itu */}
          <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Telemetri Saat Rekaman
            </p>
            <div className="space-y-3">
              {[
                { label: 'Baterai', value: `${log.telemetry.battery}%`, pct: log.telemetry.battery, color: battColor },
                { label: 'Tangki Semprot', value: `${log.telemetry.spray}%`, pct: log.telemetry.spray, color: T.violet },
                { label: 'Ketinggian', value: `${log.telemetry.altitude} m`, color: T.green },
                { label: 'Kecepatan', value: `${log.telemetry.speed} m/s`, color: T.amber },
                { label: 'GPS Signal', value: log.telemetry.gpsSignal, color: T.green },
                { label: 'Link Quality', value: log.telemetry.linkQuality, color: T.greenLight },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  {item.pct !== undefined && (
                    <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                      <div className="h-1 rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Hasil Prediksi AI (read-only, mirip pantau drone) ── */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}>
            🤖
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Hasil Prediksi AI — {log.id}</h2>
            <p className="text-[11px] text-gray-400">Palm Health AI Prediction Result · CNN ResNet-50</p>
          </div>
          <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: sev.bg, color: sev.text }}>
            {sev.label} · {log.confidence}%
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Snapshot */}
            <div className="rounded-xl border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1e1e1e]">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Snapshot Drone</span>
                <span className="text-[10px] text-gray-400 font-mono">{log.time} WIB</span>
              </div>
              <div className="relative aspect-video overflow-hidden">
                <img src={log.snapshotUrl} alt="Snapshot" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: T.green }} />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/75 to-transparent">
                  <span className="text-[10px] font-mono text-emerald-300">{log.gps}</span>
                </div>
              </div>
            </div>

            {/* NDVI */}
            <div className="rounded-xl border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1e1e1e]">
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Hasil NDVI Dataset</span>
                <span className="text-[10px] font-mono" style={{ color: T.violet }}>CNN · v2.4</span>
              </div>
              <div className="relative aspect-video overflow-hidden">
                <img src={log.ndviUrl} alt="NDVI" className="w-full h-full object-cover" />
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: `linear-gradient(${T.violet}44 1px, transparent 1px), linear-gradient(90deg, ${T.violet}44 1px, transparent 1px)`,
                  backgroundSize: '28px 28px',
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-3 py-2 rounded-lg text-center" style={{ background: `${T.violet}cc`, backdropFilter: 'blur(4px)' }}>
                    <p className="text-xs font-bold text-white">NDVI Output</p>
                    <p className="text-[10px] text-white/80">Dataset Ref · {log.confidence}% conf</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hasil detail */}
          <div className="rounded-xl border-2 p-5 space-y-4" style={{ borderColor: sev.border, background: sev.bg }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: sev.text }}>
                    {sev.label} / {sev.labelEn}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{log.classification}</span>
                </div>
                <p className="text-xs text-gray-500">{log.disease}</p>
                <p className="text-[10px] text-gray-400 mt-1">📍 {log.gps} · 🕐 {log.time} WIB · 📅 {log.date}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold" style={{ color: sev.text }}>{log.confidence}%</div>
                <div className="text-[10px] text-gray-400">Tingkat Keyakinan</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Probabilitas Sehat</span>
                  <span className="text-xs font-bold" style={{ color: T.green }}>{log.healthy}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-2.5 rounded-full" style={{ width: `${log.healthy}%`, background: T.green }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Probabilitas Tidak Sehat</span>
                  <span className="text-xs font-bold" style={{ color: T.red }}>{log.unhealthy}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className="h-2.5 rounded-full" style={{ width: `${log.unhealthy}%`, background: T.red }} />
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 bg-white/60 dark:bg-black/20">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">💡 Rekomendasi Tindakan:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{log.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama: Daftar Log ──────────────────────────
type FilterSeverity = 'all' | 'ok' | 'caution' | 'warning' | 'critical';

export default function LogPrediksiSection() {
  const [selectedLog, setSelectedLog] = useState<PredictionLogEntry | null>(null);
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState<FilterSeverity>('all');

  // Filter
  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchSearch =
      log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.location.toLowerCase().includes(search.toLowerCase()) ||
      log.classification.toLowerCase().includes(search.toLowerCase()) ||
      log.sessionId.toLowerCase().includes(search.toLowerCase());
    const matchSev = filterSev === 'all' || log.severity === filterSev;
    return matchSearch && matchSev;
  });

  // Jika sedang lihat detail
  if (selectedLog) {
    return <LogDetailView log={selectedLog} onBack={() => setSelectedLog(null)} />;
  }

  // Summary counts
  const counts = {
    total: MOCK_LOGS.length,
    critical: MOCK_LOGS.filter(l => l.severity === 'critical').length,
    warning: MOCK_LOGS.filter(l => l.severity === 'warning').length,
    ok: MOCK_LOGS.filter(l => l.severity === 'ok').length,
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Log Prediksi</h1>
          <p className="text-xs text-gray-500 mt-0.5">Prediction Log · Riwayat lengkap hasil analisis AI semua sesi</p>
        </div>
        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{ background: `${T.violet}15`, color: T.violet, border: `1px solid ${T.violet}33` }}>
          {MOCK_LOGS.length} Total Log
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Log', labelEn: 'Total Records', value: counts.total, color: T.green, icon: '📋' },
          { label: 'Kritis', labelEn: 'Critical', value: counts.critical, color: T.red, icon: '🚨' },
          { label: 'Waspada', labelEn: 'Warning', value: counts.warning, color: T.orange, icon: '⚠️' },
          { label: 'Sehat', labelEn: 'Healthy', value: counts.ok, color: T.green, icon: '✅' },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] text-gray-400">{c.label}</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600">{c.labelEn}</p>
              </div>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari log, lokasi, atau klasifikasi..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-sm text-gray-900 dark:text-gray-100 outline-none"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-[#1a1a1a]">
          {([
            { key: 'all', label: 'Semua' },
            { key: 'critical', label: 'Kritis' },
            { key: 'warning', label: 'Waspada' },
            { key: 'caution', label: 'Perhatian' },
            { key: 'ok', label: 'Sehat' },
          ] as { key: FilterSeverity; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilterSev(f.key)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={
                filterSev === f.key
                  ? { background: T.violet, color: '#fff' }
                  : { color: '#9ca3af' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Daftar Log Prediksi</p>
            <p className="text-xs text-gray-400">Prediction Log List · {filteredLogs.length} hasil ditemukan</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-[#1e1e1e]">
                <th className="px-5 py-3 font-semibold">Log ID</th>
                <th className="px-5 py-3 font-semibold">Waktu / Sesi</th>
                <th className="px-5 py-3 font-semibold">Lokasi</th>
                <th className="px-5 py-3 font-semibold">Klasifikasi AI</th>
                <th className="px-5 py-3 font-semibold">Keyakinan</th>
                <th className="px-5 py-3 font-semibold">Baterai</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1a1a1a]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                    Tidak ada log yang sesuai dengan filter
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const s = SEV_STYLE[log.severity];
                  const battColor = log.telemetry.battery > 50 ? T.green : log.telemetry.battery > 20 ? T.amber : T.red;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                      {/* Log ID */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{log.id}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{log.sessionId}</div>
                      </td>
                      {/* Waktu */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-mono text-gray-700 dark:text-gray-300">{log.time} WIB</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{log.date}</div>
                      </td>
                      {/* Lokasi */}
                      <td className="px-5 py-4">
                        <div className="text-xs text-gray-700 dark:text-gray-300">{log.location}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-[140px]">{log.gps}</div>
                      </td>
                      {/* Klasifikasi */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{log.classification}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[160px] mt-0.5">{log.disease}</div>
                      </td>
                      {/* Keyakinan */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm font-bold" style={{ color: s.text }}>{log.confidence}%</div>
                      </td>
                      {/* Baterai saat itu */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold" style={{ color: battColor }}>{log.telemetry.battery}%</div>
                        <div className="w-16 h-1 rounded-full bg-gray-100 dark:bg-[#2a2a2a] mt-1">
                          <div className="h-1 rounded-full" style={{ width: `${log.telemetry.battery}%`, background: battColor }} />
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
                          {s.label}
                        </span>
                      </td>
                      {/* Aksi */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between">
          <p className="text-xs text-gray-400">{filteredLogs.length} dari {MOCK_LOGS.length} log ditampilkan</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-md text-xs text-gray-400 border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-40" disabled>
              ← Sebelumnya
            </button>
            <button className="px-3 py-1.5 rounded-md text-xs font-bold text-white" style={{ background: T.violet }}>1</button>
            <button className="px-3 py-1.5 rounded-md text-xs text-gray-400 border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-40" disabled>
              Berikutnya →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
