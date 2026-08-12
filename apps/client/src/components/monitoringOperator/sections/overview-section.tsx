"use client";
import { useState, useEffect } from 'react';
import { useMonitoringOperator } from '../layout/monitoringOperator-context';
import { DRONE_TOKENS, AlertItem } from '../layout/monitoringOperator-types';

const FIELD_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

const ALERTS: AlertItem[] = [
  { id: 1, level: 'critical', title: 'Disease Detected', note: 'Manual Spraying Required via RC', loc: 'Block A-12, Row 8', conf: 94, cls: 'BSR Severe', time: '14:32:17' },
  { id: 2, level: 'warning', title: 'Suspected Infection', note: 'Follow-up scan recommended', loc: 'Block C-07, Row 3', conf: 71, cls: 'BSR Moderate', time: '14:30:44' },
  { id: 3, level: 'caution', title: 'Mild Discoloration', note: 'Monitor on next flight', loc: 'Block D-02, Row 15', conf: 55, cls: 'Early Stage', time: '14:28:05' },
  { id: 4, level: 'ok', title: 'Healthy Canopy', note: 'No action required', loc: 'Block B-05, Row 1', conf: 99, cls: 'Normal', time: '14:25:11' },
];

const LEVEL_STYLE = {
  critical: { dot: DRONE_TOKENS.red, badge: DRONE_TOKENS.red, badgeT: '#fff', label: 'CRITICAL' },
  warning:  { dot: DRONE_TOKENS.orange, badge: DRONE_TOKENS.orange, badgeT: '#fff', label: 'WARNING' },
  caution:  { dot: DRONE_TOKENS.amber, badge: DRONE_TOKENS.amber, badgeT: '#1a1a1a', label: 'CAUTION' },
  ok:       { dot: DRONE_TOKENS.greenLight, badge: DRONE_TOKENS.greenLight, badgeT: '#1a1a1a', label: 'HEALTHY' },
};

export default function Dashboard() {
  const { battery, spray } = useMonitoringOperator();
  const [tick, setTick] = useState<Date | null>(null);

  useEffect(() => {
    setTick(new Date());
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const battColor = battery > 50 ? DRONE_TOKENS.greenLight : battery > 20 ? DRONE_TOKENS.amber : DRONE_TOKENS.red;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Live Multispectral Video Feed */}
      <div className="lg:col-span-2 min-h-[380px]">
        <div className="flex flex-col rounded-sm overflow-hidden h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
          <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-gray-200 dark:border-[#1e1e1e]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DRONE_TOKENS.greenLight }} />
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Live Multispectral Video Feed</span>
              <span className="text-xs px-2 py-0.5 rounded-sm font-mono bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400">NDVI</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
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

          <div className="relative flex-1 min-h-[260px] overflow-hidden">
            <img src={FIELD_IMG} alt="Aerial agricultural field" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: DRONE_TOKENS.greenLight }} />
            <div className="absolute bottom-4 left-4 px-2.5 py-1.5 rounded-sm text-xs font-mono bg-black/65 text-emerald-100 backdrop-blur-sm">
              3°21'14.2"N 114°35'48.9"E · ALT 25.3 m
            </div>
          </div>

          <div className="flex items-center gap-5 px-5 py-2.5 shrink-0 border-t border-gray-200 dark:border-[#1e1e1e]">
            {[
              { k: 'NDVI', v: '0.72', c: DRONE_TOKENS.greenLight },
              { k: 'TEMP', v: '32.4°C', c: DRONE_TOKENS.amber },
              { k: 'BAND', v: '5-CH', c: DRONE_TOKENS.green },
              { k: 'RES', v: '1080p', c: '#9ca3af' },
            ].map(i => (
              <div key={i.k} className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400">{i.k}</span>
                <span className="text-xs font-bold font-mono" style={{ color: i.c }}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Alert Panel */}
      <div className="min-h-[380px]">
        <div className="flex flex-col rounded-sm overflow-hidden h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
          <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-gray-200 dark:border-[#1e1e1e]">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">AI Detection &amp; Alerts</span>
            <span
              className="text-xs px-2 py-0.5 rounded-sm font-semibold"
              style={{ background: `${DRONE_TOKENS.red}18`, color: DRONE_TOKENS.red, border: `1px solid ${DRONE_TOKENS.red}44` }}
            >
              1 CRITICAL
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#1e1e1e]">
            {ALERTS.map(a => {
              const lv = LEVEL_STYLE[a.level];
              const isCrit = a.level === 'critical';
              return (
                <div
                  key={a.id}
                  className="px-5 py-4"
                  style={{ background: isCrit ? `${DRONE_TOKENS.red}0d` : 'transparent' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: lv.dot }} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a.title}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{a.time}</span>
                  </div>
                  <p
                    className="text-xs mb-2 pl-4"
                    style={{ color: isCrit ? DRONE_TOKENS.orange : '#9ca3af', fontWeight: isCrit ? 500 : 400 }}
                  >
                    {a.note}
                  </p>
                  <div className="pl-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{a.loc}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{a.conf}%</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-sm font-semibold"
                        style={{ background: lv.badge, color: lv.badgeT, fontSize: 10 }}
                      >
                        {lv.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Telemetry Cards Grid */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Drone Battery', value: battery.toFixed(0), unit: '%', pct: Math.round(battery), color: battColor, note: battery < 20 ? 'LOW' : undefined },
          { label: 'Spray Tank', value: String(spray), unit: '%', pct: spray, color: DRONE_TOKENS.green },
          { label: 'Altitude', value: '25.3', unit: 'm', color: DRONE_TOKENS.greenLight },
          { label: 'Ground Speed', value: '4.2', unit: 'm/s', color: DRONE_TOKENS.amber },
        ].map(item => (
          <div key={item.label} className="rounded-sm p-5 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</span>
              {item.note && <span className="text-xs text-red-500 font-bold">{item.note}</span>}
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
              <span className="text-sm text-gray-400">{item.unit}</span>
            </div>
            {item.pct !== undefined && (
              <>
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#1e1e1e]">
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs font-mono" style={{ color: item.color }}>{item.pct}%</span>
                  <span className="text-xs font-mono text-gray-400">100%</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Mission Status Box */}
      <div>
        <div className="rounded-sm p-5 h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-gray-400">Mission Status</p>
          {[
            { label: 'Mission ID', value: '#37' },
            { label: 'Flight time', value: '18m 42s' },
            { label: 'Distance', value: '2.4 km' },
            { label: 'Detections', value: '3 events' },
            { label: 'Pilot', value: 'Auto (FPV)' },
            { label: 'Comm. link', value: '5.8 GHz · Strong' },
          ].map(r => (
            <div
              key={r.label}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-[#1e1e1e] last:border-b-0"
            >
              <span className="text-xs text-gray-400">{r.label}</span>
              <span className="text-xs font-semibold font-mono text-gray-900 dark:text-gray-100">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}