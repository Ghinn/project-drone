"use client";
import { useState, useEffect } from 'react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;
const FIELD_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

export default function LiveCameraSection() {
  const { battery, spray } = useMonitoringOperator();
  const [tick, setTick] = useState<Date | null>(null);
  const [snapshot, setSnapshot] = useState(false);

  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const battColor = battery > 50 ? T.green : battery > 20 ? T.amber : T.red;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: T.red }} />
          <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">Live Camera Feed — Drone DJI Mavic</h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-gray-100 dark:bg-[#1a1a1a] text-gray-500">1080p · 60FPS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">{tick ? tick.toLocaleTimeString('id-ID') : '--:--:--'}</span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: `${T.red}22`, color: T.red, border: `1px solid ${T.red}44` }}
          >
            ● REC
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">

        {/* Video Feed (3/4 width) */}
        <div className="lg:col-span-3 rounded-lg overflow-hidden bg-black border border-gray-200 dark:border-[#1e1e1e] relative min-h-[420px]">
          <img
            src={FIELD_IMG}
            alt="Live aerial view of oil palm plantation"
            className="w-full h-full object-cover"
          />

          {/* HUD Corner Lines */}
          {[
            'top-3 left-3 border-t-2 border-l-2',
            'top-3 right-3 border-t-2 border-r-2',
            'bottom-3 left-3 border-b-2 border-l-2',
            'bottom-3 right-3 border-b-2 border-r-2',
          ].map((pos, i) => (
            <div key={i} className={`absolute w-6 h-6 ${pos}`} style={{ borderColor: T.green }} />
          ))}

          {/* Center Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4" style={{ background: `${T.green}80` }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4" style={{ background: `${T.green}80` }} />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5" style={{ background: `${T.green}80` }} />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-0.5" style={{ background: `${T.green}80` }} />
              <div className="absolute inset-3 rounded-full border" style={{ borderColor: `${T.green}60` }} />
            </div>
          </div>

          {/* Detection Box Overlay */}
          <div
            className="absolute border-2 rounded"
            style={{
              top: '28%', left: '38%', width: '120px', height: '90px',
              borderColor: T.red,
              boxShadow: `0 0 12px ${T.red}66`,
            }}
          >
            <span
              className="absolute -top-5 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: T.red, color: '#fff' }}
            >
              BSR 94%
            </span>
          </div>

          {/* Bottom GPS Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-300">
                GPS: 3°21'14.2"N 114°35'48.9"E
              </span>
              <span className="text-xs font-mono text-emerald-300">
                ALT: 25.3 m · SPEED: 4.2 m/s
              </span>
            </div>
          </div>

          {/* Snapshot Flash */}
          {snapshot && (
            <div className="absolute inset-0 bg-white/60 animate-ping" />
          )}
        </div>

        {/* Right Panel Telemetry */}
        <div className="flex flex-col gap-4">

          {/* Mini Radar Map */}
          <div className="rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4 flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Radar / Peta Posisi</p>
            <div
              className="relative rounded-lg overflow-hidden flex items-center justify-center"
              style={{ height: 160, background: '#0F172A' }}
            >
              {/* Radar rings */}
              {[60, 45, 30, 15].map((r, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border"
                  style={{
                    width: r * 2, height: r * 2,
                    borderColor: `${T.green}${i === 0 ? '18' : i === 1 ? '26' : i === 2 ? '40' : '70'}`,
                  }}
                />
              ))}
              {/* Sweep line */}
              <div
                className="absolute top-1/2 left-1/2 origin-left h-0.5 w-[60px]"
                style={{
                  background: `linear-gradient(to right, transparent, ${T.green}80)`,
                  transform: 'translateY(-50%) rotate(-30deg)',
                }}
              />
              {/* Drone dot */}
              <div className="absolute w-3 h-3 rounded-full border-2 border-white" style={{ background: T.green }} />
              {/* Detection blip */}
              <div
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{ background: T.red, top: '30%', left: '60%' }}
              />
              {/* Cardinal labels */}
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

          {/* Telemetry Stats */}
          <div className="rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Telemetri Drone</p>
            <div className="space-y-3">
              {[
                { label: 'Baterai', value: `${battery.toFixed(0)}%`, pct: battery, color: battColor },
                { label: 'Tangki Semprot', value: `${spray}%`, pct: spray, color: T.violet },
                { label: 'Ketinggian', value: '25.3 m', color: T.green },
                { label: 'Kecepatan', value: '4.2 m/s', color: T.amber },
                { label: 'GPS Signal', value: 'Strong (14 sat)', color: T.green },
                { label: 'Link 5.8 GHz', value: '-72 dBm', color: T.greenLight },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  {item.pct !== undefined && (
                    <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                      <div className="h-1 rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Capture Button */}
          <button
            onClick={() => { setSnapshot(true); setTimeout(() => setSnapshot(false), 300); }}
            className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: T.green }}
          >
            📷 Ambil Snapshot
          </button>
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="flex items-center gap-6 px-5 py-3 rounded-lg bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e]">
        {[
          { k: 'NDVI', v: '0.72', c: T.green },
          { k: 'SUHU KANOPI', v: '32.4°C', c: T.amber },
          { k: 'BANDWIDTH', v: '4.8 Mbps', c: T.violet },
          { k: 'LATENSI', v: '48 ms', c: T.greenLight },
          { k: 'FRAME', v: '60 FPS', c: T.green },
          { k: 'RESOLUSI', v: '1080p', c: '#9ca3af' },
        ].map(i => (
          <div key={i.k} className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400">{i.k}:</span>
            <span className="text-xs font-bold font-mono" style={{ color: i.c }}>{i.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}