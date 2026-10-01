"use client";
import { Menu } from 'lucide-react';
import { useMonitoringOperator } from './monitoringOperator-context';
import { DRONE_TOKENS } from './monitoringOperator-types';
import HeaderThemeControls from './header-theme-controls';
import UserProfileDropdown from './user-profile-dropdown';
import { LocaleToggle } from '@/components/locale-toggle'; 

const T = DRONE_TOKENS;

export default function AppHeader() {
  const { setIsSidebarOpen, getPageTitle, telemetry } = useMonitoringOperator();

  const flightMode = telemetry?.flightMode || 'standby';

  // Helper untuk menentukan gaya Badge berdasarkan status Pixhawk
  const getFlightStateBadge = (mode: string) => {
    switch (mode) {
      case 'in-flight':
        // Sedang terbang (Sensor ketinggian berubah, landed = false)
        return { 
          bg: `${T.red}18`, text: T.red, border: `1px solid ${T.red}33`, 
          label: 'IN-FLIGHT', pulse: true 
        };
      case 'armed':
        // Motor berputar (spin when armed), siap lepas landas
        return { 
          bg: '#F59E0B18', text: '#F59E0B', border: '1px solid #F59E0B33', 
          label: 'ARMED', pulse: true 
        };
      case 'standby':
      default:
        // Disarmed, motor mati, sensor aktif
        return { 
          bg: '#9CA3AF18', text: '#9CA3AF', border: '1px solid #9CA3AF33', 
          label: 'STANDBY', pulse: false 
        };
    }
  };

  const badgeStyle = getFlightStateBadge(flightMode);

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
        {/* Flight State Badge */}
        <div
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a2a] transition-all duration-300"
          style={{ background: badgeStyle.bg, color: badgeStyle.text, border: badgeStyle.border }}
        >
          <span className={`w-1.5 h-1.5 rounded-full bg-current ${badgeStyle.pulse ? 'animate-pulse' : ''}`} />
          {badgeStyle.label}
        </div>

        {/* Toggle Bahasa */}
        <LocaleToggle />

        {/* Toggle Dark/Light Mode */}
        <div className="hidden md:block">
          <HeaderThemeControls />

        {/* User Profile Dropdown */}
        </div>
        <UserProfileDropdown />
      </div>
    </header>
  );
}