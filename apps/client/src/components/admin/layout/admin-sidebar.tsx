"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdminContext } from './admin-context';
import { useAuth } from '@/providers/auth-provider';
import { Menu, X, LogOut, ArrowLeft } from 'lucide-react';

const THEME = {
  green: '#6B8E23',
  greenLight: '#8BAE3A',
};

export default function AdminSidebar() {
  const router = useRouter();
  const { signOutApp } = useAuth();
  const { activeTab, isSidebarOpen, setIsSidebarOpen, navItems } = useAdminContext();

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      try {
        await signOutApp();
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        router.push('/');
      }
    }
  };

  return (
    <>
      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 md:static md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:w-56' : '-translate-x-full md:translate-x-0 md:w-14'}
          w-56 flex-shrink-0 bg-white dark:bg-[#0d0d0d] border-r border-gray-200 dark:border-[#1e1e1e]
          transition-all duration-300 ease-in-out flex flex-col overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-3.5 h-14 shrink-0 border-b border-gray-200 dark:border-[#1e1e1e]">
          <Image
            src="/assets/images/main-logomark.svg"
            alt="DreamPalm Logo"
            width={32}
            height={32}
            className="object-contain shrink-0"
          />
          
          <div className={`flex justify-between items-center w-full ${!isSidebarOpen ? 'hidden md:hidden' : 'flex'}`}>
            <div className="flex flex-col leading-tight">
              <Image
                src="/assets/images/main-logo-logotype.svg"
                alt="DreamPalm Logo"
                width={100}
                height={20}
                className="object-contain"
              />
              <span className="text-[10px] text-gray-400">Master Admin</span>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden w-fit h-fit p-1 rounded-md transition-all hover:opacity-70 bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-500"
              title="Tutup Sidebar"
            >
              <X size={18} />
            </button>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="hidden md:flex w-fit h-fit p-1 rounded-md transition-all hover:opacity-70 bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-500"
              title="Perkecil Sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Expand button di desktop version */}
        {!isSidebarOpen && (
          <div className="hidden md:flex justify-center pt-3 pb-1 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex justify-center items-center p-1 rounded-md transition-all hover:opacity-70 text-gray-400 dark:text-gray-500"
              title="Perlebar Sidebar"
            >
              <Menu size={18} />
            </button>
          </div>
        )}

        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {navItems.filter(item => item.id !== 'settings').map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 w-full text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#6B8E2326] dark:bg-[#1a1a1a] text-[#6B8E23] dark:text-[#6B8E23]'
                    : 'text-[#6B8E23]/70 hover:bg-[#6B8E2326] hover:text-[#6B8E23]'
                } ${!isSidebarOpen ? 'justify-center' : ''}`}
                style={{
                  borderLeft: isActive
                    ? `2px solid ${THEME.greenLight}`
                    : '2px solid transparent',
                }}
              >
                <span
                  className="shrink-0 transition-colors"
                  style={{ color: isActive ? THEME.greenLight : 'inherit' }}
                >
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className={`text-sm truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="px-2 pb-3 pt-2 border-t border-gray-200 dark:border-[#1e1e1e] flex flex-col gap-1 shrink-0">
          <button
            onClick={() => router.push('/')}
            className={`flex items-center gap-2 px-2.5 py-2 w-full rounded-md text-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-400 dark:text-gray-500 ${!isSidebarOpen ? 'justify-center' : ''}`}
            title={!isSidebarOpen ? 'Kembali ke Beranda' : undefined}
          >
            <ArrowLeft size={16} className="shrink-0" />
            {isSidebarOpen && <span className="text-xs">Kembali ke Beranda</span>}
          </button>

          {/* <button 
            onClick={handleLogout}
            title={!isSidebarOpen ? 'Keluar' : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 w-full text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 rounded-md transition-all duration-150 ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={16} className="shrink-0" />
            {isSidebarOpen && (
              <span className="text-xs font-semibold truncate">Keluar</span>
            )}
          </button> */}
        </div>
      </aside>
    </>
  );
}