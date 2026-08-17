"use client";
import { useRouter } from 'next/navigation';
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';

export default function MonitoringOperatorNavbar() {
  const router = useRouter();
  const { activeTab, setActiveTab, collapsed, setCollapsed, navItems } = useMonitoringOperator();

  return (
    <aside
      className="flex flex-col shrink-0 transition-all duration-300 bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-[#1e1e1e]"
      style={{ width: collapsed ? 52 : 212 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3.5 h-14 shrink-0 border-b border-gray-200 dark:border-[#1e1e1e]">
        <span
          className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 text-white"
          style={{ background: DRONE_TOKENS.green }}
        >
          DP
        </span>
        {!collapsed && (
          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
            DreamPalm
          </span>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {navItems.map(n => {
          const isActive = activeTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              className={`flex items-center gap-3 rounded-sm px-2.5 py-2.5 w-full text-left transition-colors text-sm ${
                isActive
                  ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 font-semibold'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900 font-normal'
              }`}
              style={{
                borderLeft: isActive
                  ? `2px solid ${DRONE_TOKENS.greenLight}`
                  : '2px solid transparent',
              }}
            >
              {!collapsed && n.label}
              {collapsed && (
                <span
                  className="text-xs font-bold"
                  style={{ color: isActive ? DRONE_TOKENS.greenLight : 'inherit' }}
                >
                  {n.label.slice(0, 2).toUpperCase()}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to Home */}
      <div className="px-2 pb-3">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-2.5 py-2 w-full rounded-sm text-sm transition-opacity hover:opacity-70 text-gray-500 dark:text-gray-400"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Back to Home</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-3 py-2 rounded-sm flex items-center justify-center transition-opacity hover:opacity-60 bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400"
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