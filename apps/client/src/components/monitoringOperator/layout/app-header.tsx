"use client";
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';
import HeaderThemeControls from './header-theme-controls';
import UserProfileDropdown from './user-profile-dropdown';

const T = DRONE_TOKENS;

export default function AppHeader() {
  const { getPageTitle, getPageTitleEn } = useMonitoringOperator();

  return (
    <header className="flex items-center justify-between px-6 h-14 shrink-0 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-[#1e1e1e] transition-colors">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 dark:text-gray-500 font-medium">DreamPalm</span>
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-300 dark:text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {getPageTitle()}
          </span>
          <span className="text-gray-400 dark:text-gray-600 text-xs hidden sm:inline">
            / {getPageTitleEn()}
          </span>
        </div>
      </div>

      {/* Right: Drone Status + Controls */}
      <div className="flex items-center gap-3">
        {/* Drone Connection Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a2a]">
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

        <HeaderThemeControls />
        <UserProfileDropdown />
      </div>
    </header>
  );
}