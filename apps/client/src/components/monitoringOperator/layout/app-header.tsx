"use client";
import { Menu } from 'lucide-react';
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';
import HeaderThemeControls from './header-theme-controls';
import UserProfileDropdown from './user-profile-dropdown';

const T = DRONE_TOKENS;

export default function AppHeader() {
  const { setIsSidebarOpen, getPageTitle } = useMonitoringOperator();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 shrink-0 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-[#1e1e1e] transition-colors">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 -ml-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 transition-colors shrink-0"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
          <span className="text-gray-400 dark:text-gray-500 font-medium shrink-0">DreamPalm</span>
          <span className="text-gray-300 dark:text-gray-600 shrink-0 font-normal">/</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Drone Connection Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a2a]">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
            style={{ background: T.greenLight }}
          />
          <span>Drone Aktif</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="font-mono" style={{ color: T.greenLight }}>Misi #037</span>
        </div>

        {/* LIVE badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold"
          style={{ background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}33` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          LIVE
        </div>

        <div className="hidden md:block">
          <HeaderThemeControls />
        </div>
        <UserProfileDropdown />
      </div>
    </header>
  );
}