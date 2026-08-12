"use client";
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';
import HeaderThemeControls from './header-theme-controls';
import UserProfileDropdown from './user-profile-dropdown';

export default function AppHeader() {
  const { getPageTitle } = useMonitoringOperator();

  return (
    <header className="flex items-center justify-between px-6 h-14 shrink-0 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-[#1e1e1e] transition-colors">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 dark:text-gray-500">Drone</span>
        <span className="text-gray-400 dark:text-gray-500">/</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {getPageTitle()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a2a]">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: DRONE_TOKENS.greenLight }}
          />
          Drone active · Mission #37
        </div>

        <HeaderThemeControls />
        <UserProfileDropdown />
      </div>
    </header>
  );
}