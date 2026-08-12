'use client';

import { useEffect } from 'react';
import MonitoringOperatorShell from '@/components/monitoringOperator/layout/monitoringOperator-shell';
import { useMonitoringOperator } from '@/components/monitoringOperator/layout/monitoringOperator-context';

// Import sections Operator
import OverviewSection from '@/components/monitoringOperator/sections/overview-section';
import LiveCameraSection from '@/components/monitoringOperator/sections/live-camera-section';
import AnalisisPredictionLogSection from '@/components/monitoringOperator/sections/analisis-prediction-log-section';
import SettingsSection from '@/components/monitoringOperator/sections/settings-section';

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