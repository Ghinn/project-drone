"use client";
import { useRouter } from 'next/navigation';
import { useAdminContext } from './admin-context';
import { useAuth } from '@/providers/auth-provider';

export default function AdminSidebar() {
  const router = useRouter();
  const { signOutApp } = useAuth();
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, navItems } = useAdminContext();

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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 
          ${isSidebarOpen ? 'w-64 translate-x-0 border-r' : 'w-0 -translate-x-full md:w-0 md:border-none'} 
          flex-shrink-0 dark:border-zinc-800 bg-white dark:bg-[#16161a] transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
      >
        <div className="w-64 flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b dark:border-zinc-800 shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#6B8E23] text-white rounded flex items-center justify-center font-bold mr-3 shadow-md">
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

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-[#6B8E23] text-white font-semibold shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          
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
    </>
  );
}