'use client';
import { useEffect } from "react";
import AdminShell from "@/components/admin/layout/admin-shell";
import { useAdminContext } from "@/components/admin/layout/admin-context";
import Overview from "@/components/admin/sections/overview-section";
import UserManagementSection from "@/components/admin/sections/user-management-section";
import SystemLogs from "@/components/admin/sections/system-logs-section";
import Settings from "@/components/admin/sections/settings-section";

// Komponen internal untuk menangani switching section berdasarkan tab aktif
function AdminContentRouter() {
  const { activeTab } = useAdminContext();

  switch (activeTab) {
    case 'users':
      return <UserManagementSection />;
    case 'logs':
      return <SystemLogs />;
    case 'settings':
      return <Settings />;
    case 'overview':
    default:
      return <Overview />;
  }
}

export default function AdminPage() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    window.scrollTo(0, 0);
    const scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <AdminShell>
      <main className="flex flex-col min-h-full w-full animate-in fade-in duration-200">
        <AdminContentRouter />
      </main>
    </AdminShell>
  );
}