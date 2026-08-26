'use client';

import { useEffect } from 'react';
import MonitoringOperatorShell from '@/components/monitoringOperator/layout/monitoringOperator-shell';
import { useMonitoringOperator } from '@/components/monitoringOperator/layout/monitoringOperator-context';

// Import 4 sections baru
import DashboardSection from '@/components/monitoringOperator/sections/overview-section';
import PantauDroneSection from '@/components/monitoringOperator/sections/pantau-drone-section';
import LogPrediksiSection from '@/components/monitoringOperator/sections/log-prediksi-section';
import SettingsSection from '@/components/monitoringOperator/sections/settings-section';

// Router: menampilkan section berdasarkan tab aktif
function OperatorContentRouter() {
  const { activeTab } = useMonitoringOperator();

  switch (activeTab) {
    case 'pantau-drone':
      return <PantauDroneSection />;
    case 'log-prediksi':
      return <LogPrediksiSection />;
    case 'settings':
      return <SettingsSection />;
    case 'dashboard':
    default:
      return <DashboardSection />;
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