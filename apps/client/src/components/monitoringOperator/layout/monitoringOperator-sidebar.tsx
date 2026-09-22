"use client";
import { useRouter } from 'next/navigation';
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';
import Image from 'next/image';
import { ClipboardClock, Drone, LayoutDashboard, Menu, Settings, X, SatelliteDish } from 'lucide-react';

const T = DRONE_TOKENS;

// SVG icons untuk setiap menu
const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <LayoutDashboard size={16}/>
  ),
  telemetry: (
    <SatelliteDish size={16}/>
  ),
  drone: (
    <Drone size={16}/>
  ),
  listClock: (
    <ClipboardClock size={16}/>
  ),
  settings: (
    <Settings size={16}/>
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
      <div className="flex items-center gap-3 px-3.5 h-14 shrink-0 border-gray-200 dark:border-[#1e1e1e]">
          <Image
            src="/assets/images/main-logomark.svg"
            alt="DreamPalm Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        {!collapsed && (
          <div className='flex justify-between items-center w-full'>
            <div className="flex flex-col leading-tight">
              <Image
                src="/assets/images/main-logo-logotype.svg"
                alt="DreamPalm Logo"
                width={100}
                height={100}
                className="object-contain"
              />
              <span className="text-[10px] text-gray-400">Drone Operator</span>
            </div>
              {/* Collapse Toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-fit h-fit rounded-md transition-all hover:opacity-70 bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-500"
                title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
              >
                <X size={18}/>
              </button>

          </div>
        )}
      </div>
      {/* Nav List */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {!collapsed ? (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2.5 py-3">
            {/* Menu */}
          </p>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex justify-center items-center pb-2 rounded-md transition-all hover:opacity-70 text-gray-400 dark:text-gray-500`}
            title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
          >
            <Menu size={18}/>
          </button>
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
                  ? 'bg-[#6B8E2326] dark:bg-[#1a1a1a] text-[#6B8E23] dark:text-[#6B8E23]'
                  : 'text-[#6B8E23]/70 hover:bg-[#6B8E2326] hover:text-[#6B8E23]'
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
                  {/* <span className="text-[10px] text-gray-400 truncate">
                    {n.labelEn}
                  </span> */}
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
    </aside>
  );
}