"use client";
import { useState, useEffect } from 'react';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const FIELD_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

export default function LiveCameraSection() {
  const [tick, setTick] = useState<Date | null>(null);

  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col rounded-sm overflow-hidden h-[calc(100vh-140px)] bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-gray-200 dark:border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DRONE_TOKENS.greenLight }} />
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100">
            Dedicated Live Camera Feed (WebRTC)
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-sm font-mono bg-gray-100 dark:bg-[#1a1a1a] text-gray-500">
            1080p 60FPS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">
            {tick ? tick.toLocaleTimeString() : '--:--:--'}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-sm font-mono font-bold"
            style={{ background: `${DRONE_TOKENS.red}18`, color: DRONE_TOKENS.red, border: `1px solid ${DRONE_TOKENS.red}44` }}
          >
            ● REC
          </span>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img src={FIELD_IMG} alt="Aerial agricultural field full view" className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
        <div className="absolute bottom-6 left-6 px-3 py-2 rounded-sm text-sm font-mono bg-black/70 text-emerald-100 backdrop-blur-sm">
          GPS: 3°21'14.2"N 114°35'48.9"E · ALT: 25.3 m · SPEED: 4.2 m/s
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 shrink-0 border-t border-gray-200 dark:border-[#1e1e1e] bg-gray-50 dark:bg-[#0f0f0f]">
        <div className="flex items-center gap-6">
          {[
            { k: 'INDEX', v: 'NDVI / EVI', c: DRONE_TOKENS.greenLight },
            { k: 'CANOPY TEMP', v: '32.4°C', c: DRONE_TOKENS.amber },
            { k: 'BANDWIDTH', v: '4.8 Mbps', c: DRONE_TOKENS.green },
          ].map(i => (
            <div key={i.k} className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">{i.k}:</span>
              <span className="text-xs font-bold font-mono" style={{ color: i.c }}>{i.v}</span>
            </div>
          ))}
        </div>
        <button
          className="px-4 py-1.5 rounded-sm text-xs font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: DRONE_TOKENS.green }}
        >
          Capture Snapshot
        </button>
      </div>
    </div>
  );
}