'use client';
import { useEffect } from "react";
import AdminShell from "@/components/admin/layout/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}