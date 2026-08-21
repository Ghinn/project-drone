"use client";
import { useState } from 'react';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;

const SNAPSHOT_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';
const DATASET_IMG = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800';

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
  ok:       { bg: `${T.green}20`, text: T.green, border: `${T.green}44`, label: 'SEHAT' },
  caution:  { bg: `${T.amber}20`, text: T.amber, border: `${T.amber}44`, label: 'PERHATIAN' },
  warning:  { bg: `${T.orange}20`, text: T.orange, border: `${T.orange}44`, label: 'WASPADA' },
  critical: { bg: `${T.red}18`, text: T.red, border: `${T.red}44`, label: 'KRITIS' },
};

export default function AnalisisPredictionLogSection() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult>(null);
  const [hasSnapshot, setHasSnapshot] = useState(true);

  const handlePredict = () => {
    if (!hasSnapshot) return;
    setIsPredicting(true);
    setResult(null);
    setTimeout(() => {
      setIsPredicting(false);
      setResult(MOCK_RESULT);
    }, 2200);
  };

  const sev = result ? SEVERITY_STYLE[result.severity] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Prediksi AI — Deteksi Penyakit Kelapa Sawit</h2>
        <p className="text-xs text-gray-500 mt-1">
          Ambil snapshot dari kamera drone, lalu bandingkan dengan dataset model CNN untuk mendapatkan hasil klasifikasi penyakit secara otomatis.
        </p>
      </div>

      {/* Two Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Card 1: Snapshot dari Drone */}
        <div className="rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: hasSnapshot ? T.green : '#9ca3af' }} />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Gambar Snapshot Drone</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: hasSnapshot ? `${T.green}20` : '#f3f4f6', color: hasSnapshot ? T.green : '#9ca3af' }}>
              {hasSnapshot ? 'TERSEDIA' : 'BELUM ADA'}
            </span>
          </div>

          <div className="relative aspect-video bg-gray-100 dark:bg-[#0f0f0f] overflow-hidden">
            {hasSnapshot ? (
              <>
                <img src={SNAPSHOT_IMG} alt="Drone snapshot" className="w-full h-full object-cover" />
                {/* HUD Overlay */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: T.green }} />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: T.green }} />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: T.green }} />
                {/* Detection Box */}
                <div
                  className="absolute border-2 rounded"
                  style={{ top: '25%', left: '35%', width: '100px', height: '80px', borderColor: T.red, boxShadow: `0 0 10px ${T.red}55` }}
                >
                  <span className="absolute -top-4 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.red, color: '#fff' }}>
                    ROI
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/75 to-transparent">
                  <span className="text-[10px] font-mono text-emerald-300">Blok A-12 · GPS: 3°21'14.2"N 114°35'48.9"E</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-2">📷</span>
                <span className="text-sm">Belum ada snapshot</span>
                <span className="text-xs mt-1">Ambil dari halaman Live Camera</span>
              </div>
            )}
          </div>

          <div className="px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-[#0f0f0f]">
            <span className="text-xs text-gray-400">Diambil: 14:32:17 WIB</span>
            <button
              onClick={() => setHasSnapshot(h => !h)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80"
              style={{ background: `${T.green}18`, color: T.green }}
            >
              {hasSnapshot ? '↺ Ambil Ulang' : '📷 Ambil Snapshot'}
            </button>
          </div>
        </div>

        {/* Card 2: Referensi Dataset Model */}
        <div className="rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: T.violet }} />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Referensi Dataset Model CNN</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: `${T.violet}20`, color: T.violet }}>
              BSR · v2.4
            </span>
          </div>

          <div className="relative aspect-video bg-gray-100 dark:bg-[#0f0f0f] overflow-hidden">
            <img src={DATASET_IMG} alt="Dataset reference image" className="w-full h-full object-cover" />
            {/* Dataset grid overlay */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(${T.violet}44 1px, transparent 1px), linear-gradient(90deg, ${T.violet}44 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-3 py-2 rounded-lg text-xs font-bold text-white text-center"
                style={{ background: `${T.violet}cc`, backdropFilter: 'blur(4px)' }}>
                Model: CNN ResNet-50<br />
                <span className="font-mono text-[10px] opacity-80">Dataset: 12.847 gambar · Acc: 96.3%</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/75 to-transparent">
              <span className="text-[10px] font-mono" style={{ color: `${T.violet}dd` }}>
                Class: Ganoderma (BSR Severe) · Threshold: ≥65%
              </span>
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 dark:bg-[#0f0f0f]">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Kelas', value: '4' },
                { label: 'Akurasi Model', value: '96.3%' },
                { label: 'Dataset Train', value: '12.8K' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{m.value}</div>
                  <div className="text-[10px] text-gray-400">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Predict Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={handlePredict}
          disabled={isPredicting || !hasSnapshot}
          className="flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.green})` }}
        >
          {isPredicting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menganalisis Gambar...
            </>
          ) : (
            <>
              🤖 Prediksi Sekarang
            </>
          )}
        </button>
      </div>

      {/* Result Panel */}
      {result && sev && (
        <div
          className="rounded-xl border-2 p-6 transition-all"
          style={{ borderColor: sev.border, background: sev.bg }}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: sev.text, color: '#fff' }}
                >
                  {sev.label}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{result.label}</span>
              </div>
              <p className="text-xs text-gray-500">{result.disease}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: sev.text }}>{result.confidence}%</div>
              <div className="text-xs text-gray-400">Tingkat Keyakinan</div>
            </div>
          </div>

          {/* Health vs Unhealthy Bars */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Probabilitas Sehat</span>
                <span className="text-xs font-bold" style={{ color: T.green }}>{result.healthy}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${result.healthy}%`, background: T.green }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Probabilitas Tidak Sehat</span>
                <span className="text-xs font-bold" style={{ color: T.red }}>{result.unhealthy}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${result.unhealthy}%`, background: T.red }} />
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg p-4 bg-white/60 dark:bg-black/20">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">💡 Rekomendasi Tindakan:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{result.recommendation}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
              style={{ background: T.red }}
            >
              🚁 Eksekusi Semprot Sekarang
            </button>
            <button
              className="flex-1 py-2.5 rounded-lg text-xs font-bold transition hover:opacity-90"
              style={{ background: `${T.green}20`, color: T.green }}
            >
              📋 Simpan Laporan
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Riwayat Prediksi Sesi Ini</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#0f0f0f] text-xs text-gray-400 uppercase border-b border-gray-100 dark:border-[#1e1e1e]">
              <th className="px-5 py-3 font-semibold">Waktu</th>
              <th className="px-5 py-3 font-semibold">Lokasi</th>
              <th className="px-5 py-3 font-semibold">Hasil Klasifikasi</th>
              <th className="px-5 py-3 font-semibold">Keyakinan</th>
              <th className="px-5 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-[#1a1a1a] text-sm">
            {[
              { time: '14:32:17', loc: 'Blok A-12 B8', cls: 'BSR Parah', conf: 94, sev: 'critical' },
              { time: '14:28:05', loc: 'Blok D-02 B15', cls: 'BSR Ringan', conf: 55, sev: 'caution' },
              { time: '14:25:11', loc: 'Blok B-05 B1', cls: 'Sehat', conf: 99, sev: 'ok' },
            ].map((r, i) => {
              const s = SEVERITY_STYLE[r.sev as keyof typeof SEVERITY_STYLE];
              return (
                <tr key={i} className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{r.time}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400">{r.loc}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-900 dark:text-gray-100">{r.cls}</td>
                  <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: s.text }}>{r.conf}%</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
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
  );
}