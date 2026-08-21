'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import MonitoringOperatorShell from '@/components/monitoringOperator/layout/monitoringOperator-shell';
import { useMonitoringOperator } from '@/components/monitoringOperator/layout/monitoringOperator-context';

// Import sections Operator
import OverviewSection from '@/components/monitoringOperator/sections/overview-section';
import LiveCameraSection from '@/components/monitoringOperator/sections/live-camera-section';
import AnalisisPredictionLogSection from '@/components/monitoringOperator/sections/analisis-prediction-log-section';
import SettingsSection from '@/components/monitoringOperator/sections/settings-section';

// Import komponen 3D secara dinamis dengan SSR dinonaktifkan (Penting untuk WebGL/Three.js)
const Orientation3DSection = dynamic(
  () => import('@/components/monitoringOperator/sections/3d-orientation-model'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full animate-pulse items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
        <span className="text-sm font-medium text-gray-500">Memuat modul 3D Orientation...</span>
      </div>
    )
  }
);

// Komponen internal untuk menangani switching section berdasarkan tab aktif
function OperatorContentRouter() {
  const { activeTab } = useMonitoringOperator();

  switch (activeTab) {
    case 'camera':
      return <LiveCameraSection />;
    case 'ai-log':
      return <AnalisisPredictionLogSection />;
    case 'settings':
      return <SettingsSection />;
    case 'orientation':
      return <Orientation3DSection />;
    case 'dashboard':
    default:
      return <OverviewSection />;
  }
}

export default function MonitoringOperatorPage() {
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
    <MonitoringOperatorShell>
      <div className="flex flex-col min-h-full w-full animate-in fade-in duration-200">
        <OperatorContentRouter />
      </div>
    </MonitoringOperatorShell>
  );
}