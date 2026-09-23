'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminContext } from './admin-context';
import type { AdminTab, NavItem } from './admin-types';
import { LayoutDashboard, Users, Drone, ClipboardClock, Settings } from 'lucide-react';
import AdminSidebar from './admin-sidebar';
import AppHeader from './app-header';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const navItems: NavItem[] = [
    { 
      id: 'overview', label: 'Overview', href: '/admin/overview',
      icon: <LayoutDashboard size={16} />
    },
    { 
      id: 'users', label: 'User Management', href: '/admin/users',
      icon: <Users size={16} />
    },
    { 
      id: 'drones', label: 'Drone Management', href: '/admin/drones',
      icon: <Drone size={16} />
    },
    { 
      id: 'logs', label: 'System Logs', href: '/admin/logs',
      icon: <ClipboardClock size={16} />
    },
    { 
      id: 'settings', label: 'Settings', href: '/admin/settings',
      icon: <Settings size={16} />
    },
  ];

  const currentItem = navItems.find(item => pathname.startsWith(item.href));
  const activeTab = currentItem ? currentItem.id : 'overview';

  const setActiveTab = (tab: AdminTab) => {
    const target = navItems.find(n => n.id === tab);
    if (target) router.push(target.href);
  };

  const getPageTitle = () => {
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        navItems,
        getPageTitle,
      }}
    >
      <div className="flex h-screen bg-gray-50/50 dark:bg-[#111111] transition-colors duration-300 font-sans overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppHeader />
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
            {children}
          </div>
        </div>
      </div>
    </AdminContext.Provider>
  );
}