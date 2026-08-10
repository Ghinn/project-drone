import SystemLogs from '@/components/admin/sections/system-logs';

export default function LogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">System Logs</h2>
        <p className="text-sm text-gray-500 mb-6">Pantau aktivitas sistem dan pengguna di sini.</p>
      </div>
      
      {/* Memanggil komponen SystemLogs yang sudah kamu buat sebelumnya */}
      <SystemLogs />
    </div>
  );
}