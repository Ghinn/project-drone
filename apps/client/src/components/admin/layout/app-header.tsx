"use client";
import { Menu } from 'lucide-react';
import { useAdminContext } from './admin-context';
import HeaderThemeControls from './header-theme-controls';
import UserProfileDropdown from './user-profile-dropdown';

export default function AppHeader() {
  const { setIsSidebarOpen, getPageTitle } = useAdminContext();

  return (
    <header className="h-14 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-[#1e1e1e] flex items-center justify-between px-4 sm:px-6 z-10 transition-colors duration-300 shrink-0">
      
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 -ml-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 transition-colors shrink-0"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
          <span className="text-gray-400 dark:text-gray-500 font-medium shrink-0">DreamPalm</span>
          <span className="text-gray-300 dark:text-gray-600 shrink-0 font-normal">/</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden md:block">
          <HeaderThemeControls />
        </div>
        <UserProfileDropdown />
      </div>
    </header>
  );
}