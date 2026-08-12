"use client";
import { DRONE_TOKENS, AlertItem } from '../layout/monitoringOperator-types';

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

export default function AnalisisPredictionLogSection() {
  return (
    <div className="flex flex-col rounded-sm overflow-hidden bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1e1e1e]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#1e1e1e]">
        <div>
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100">
            AI Prediction Log &amp; Disease Classification
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time inference logs from onboard CNN visual scanner
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-sm font-semibold"
          style={{ background: `${DRONE_TOKENS.red}18`, color: DRONE_TOKENS.red, border: `1px solid ${DRONE_TOKENS.red}44` }}
        >
          1 CRITICAL FOUND
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#16161a] border-b border-gray-200 dark:border-[#1e1e1e] text-gray-400 text-xs uppercase">
              <th className="px-6 py-3 font-semibold">Time</th>
              <th className="px-6 py-3 font-semibold">Classification</th>
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Confidence</th>
              <th className="px-6 py-3 font-semibold">Action Note</th>
              <th className="px-6 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#1e1e1e] text-sm">
            {ALERTS.map(a => {
              const lv = LEVEL_STYLE[a.level];
              return (
                <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-[#181818] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{a.time}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{a.cls}</td>
                  <td className="px-6 py-4 text-gray-500">{a.loc}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                    {a.conf}%
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{a.note}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-sm"
                      style={{ background: lv.badge, color: lv.badgeT }}
                    >
                      {lv.label}
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