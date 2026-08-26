"use client";
import { useRouter } from 'next/navigation';
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';

const T = DRONE_TOKENS;

// SVG icons untuk setiap menu
const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
    </svg>
  ),
  camera: (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  ),
  log: (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export default function MonitoringOperatorNavbar() {
  const router = useRouter();
  const { activeTab, setActiveTab, collapsed, setCollapsed, navItems } = useMonitoringOperator();

  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-300 bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-[#1e1e1e]"
      style={{ width: collapsed ? 56 : 220 }}
    >
      {/* Logo DreamPalm */}
      <div className="flex items-center gap-3 px-3.5 h-14 shrink-0 border-b border-gray-200 dark:border-[#1e1e1e]">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 text-white"
          style={{ background: `linear-gradient(135deg, ${T.green}, ${T.violet})` }}
        >
          DP
        </span>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100 tracking-tight">
              DreamPalm
            </span>
            <span className="text-[10px] text-gray-400">Drone Operator</span>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2.5 mb-2">
            Menu
          </p>
        )}
        {navItems.map(n => {
          const isActive = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              title={collapsed ? `${n.label} · ${n.labelEn}` : undefined}
              className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 w-full text-left transition-all duration-150 ${
                isActive
                  ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              style={{
                borderLeft: isActive
                  ? `2px solid ${T.greenLight}`
                  : '2px solid transparent',
              }}
            >
              {/* Icon */}
              <span
                className="shrink-0 transition-colors"
                style={{ color: isActive ? T.greenLight : 'inherit' }}
              >
                {NAV_ICONS[n.icon]}
              </span>

              {/* Label bilingual */}
              {!collapsed && (
                <div className="flex flex-col leading-tight min-w-0">
                  <span className={`text-sm truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {n.label}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    {n.labelEn}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to Home */}
      <div className="px-2 pb-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-2.5 py-2 w-full rounded-md text-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-400 dark:text-gray-500"
          title={collapsed ? 'Kembali ke Beranda' : undefined}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="text-xs">Kembali ke Beranda</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-3 py-2 rounded-md flex items-center justify-center transition-all hover:opacity-70 bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-500"
        title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
          />
        </svg>
      </button>
    </aside>
  );
}