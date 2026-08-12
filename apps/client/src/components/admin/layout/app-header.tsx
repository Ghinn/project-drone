"use client";
import { useAdminContext } from './admin-context';
import HeaderThemeControls from './header-theme-controls';
import UserProfileDropdown from './user-profile-dropdown';

export default function AppHeader() {
  const { isSidebarOpen, setIsSidebarOpen, getPageTitle } = useAdminContext();

  return (
    <header className="h-16 bg-white dark:bg-[#16161a] border-b dark:border-zinc-800 flex items-center justify-between px-6 z-10 transition-colors duration-300 shrink-0">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">
          System <span className="mx-1.5">/</span> <span className="font-medium text-gray-800 dark:text-gray-200">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <HeaderThemeControls />
        <UserProfileDropdown />
      </div>
    </header>
  );
}