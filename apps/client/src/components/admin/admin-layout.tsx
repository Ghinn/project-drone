"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/providers/auth-provider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { signOutApp } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // On mobile, close sidebar by default
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

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

  const navItems = [
    { 
      label: 'Overview', 
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    { 
      label: 'User Management', 
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      label: 'System Logs', 
      href: '/admin/logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: 'Settings', 
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.href === pathname);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-[#111111] transition-colors duration-300 font-sans">
      
      {/* ================= MOBILE SIDEBAR BACKDROP ================= */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 
          ${isSidebarOpen ? 'w-64 translate-x-0 border-r' : 'w-0 -translate-x-full md:w-0 md:border-none'} 
          flex-shrink-0 dark:border-zinc-800 bg-white dark:bg-[#16161a] transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
      >
        <div className="w-64 flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b dark:border-zinc-800 shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#84994F] text-white rounded flex items-center justify-center font-bold mr-3 shadow-md">
                DP
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-lg tracking-wide">DREAMPALM</span>
            </div>
            {/* Close button on mobile */}
            <button 
              className="md:hidden p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-[#84994F] text-white font-semibold shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Tombol Logout (Menempel di bawah) */}
          <div className="p-4 pb-8 border-t dark:border-zinc-800 shrink-0">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 rounded-md transition-all duration-200 border border-transparent hover:border-red-100 dark:hover:border-red-950/30"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar Akun
            </button>
          </div>
        </div>
      </aside>
        
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-16 bg-white dark:bg-[#16161a] border-b dark:border-zinc-800 flex items-center justify-between px-6 z-10 transition-colors duration-300 shrink-0">
          
          {/* Bagian Kiri: Hamburger + Breadcrumb */}
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

          {/* Bagian Kanan: Dark Mode + Profile */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {mounted && isDarkMode ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-3 border-l dark:border-zinc-800 pl-4">
              <div className="w-9 h-9 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                MA
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-800 dark:text-zinc-100 leading-none">Master Admin</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">Superuser</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
          {children}
        </div>
        
      </main>
    </div>
  );
}