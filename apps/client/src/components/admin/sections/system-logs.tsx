"use client";
import { useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  actor: string;
  category: 'Auth' | 'Drone' | 'AI Detection' | 'System';
  action: string;
  status: 'success' | 'info' | 'warning' | 'error';
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    coordinates?: string;
    droneId?: string;
    details?: string;
    [key: string]: any;
  };
}

const INITIAL_LOGS: LogEntry[] = [
  { 
    id: 'LOG-001', 
    timestamp: '2026-08-11 08:00:12', 
    actor: 'Budi Santoso (Petani)', 
    category: 'Auth', 
    action: 'Login ke sistem', 
    status: 'success',
    metadata: { ipAddress: '192.168.1.45', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', details: 'Sesi web berhasil diinisialisasi' }
  },
  { 
    id: 'LOG-002', 
    timestamp: '2026-08-11 08:15:32', 
    actor: 'Rangga Dirgantara (Teknisi)', 
    category: 'Drone', 
    action: 'Drone-01 lepas landas (Take-off)', 
    status: 'info',
    metadata: { droneId: 'Drone-01', coordinates: '-1.244, 116.895', details: 'Baterai: 100%, Status GPS: 3D Lock, Satelit: 14' }
  },
  { 
    id: 'LOG-003', 
    timestamp: '2026-08-11 08:22:05', 
    actor: 'System AI', 
    category: 'AI Detection', 
    action: 'Deteksi penyakit sawit BSR (Basal Stem Rot)', 
    status: 'warning',
    metadata: { droneId: 'Drone-01', coordinates: '-1.246, 116.899', confidence: '89.4%', details: 'Pohon diklasifikasikan sebagai SAKIT (Ganoderma Boninense)' }
  },
  { 
    id: 'LOG-004', 
    timestamp: '2026-08-11 08:30:15', 
    actor: 'System AI', 
    category: 'AI Detection', 
    action: 'Deteksi penyakit sawit BSR (Basal Stem Rot)', 
    status: 'warning',
    metadata: { droneId: 'Drone-01', coordinates: '-1.248, 116.901', confidence: '91.2%', details: 'Pohon diklasifikasikan sebagai SAKIT (Ganoderma Boninense)' }
  },
  { 
    id: 'LOG-005', 
    timestamp: '2026-08-11 08:45:00', 
    actor: 'Rangga Dirgantara (Teknisi)', 
    category: 'Drone', 
    action: 'Drone-01 mendarat darurat (Landing)', 
    status: 'warning',
    metadata: { droneId: 'Drone-01', coordinates: '-1.242, 116.890', details: 'Baterai rendah (15%). Prosedur auto-return-to-launch (RTL) berhasil.' }
  },
  { 
    id: 'LOG-006', 
    timestamp: '2026-08-11 09:12:00', 
    actor: 'System Server', 
    category: 'System', 
    action: 'Gagal mengirim notifikasi email laporan harian', 
    status: 'error',
    metadata: { smtpServer: 'smtp.gmail.com:587', error: 'Connection timeout', details: 'Pengiriman email rekapitulasi deteksi harian ke kepala kebun tertunda.' }
  },
  { 
    id: 'LOG-007', 
    timestamp: '2026-08-11 09:30:44', 
    actor: 'Master Admin', 
    category: 'Auth', 
    action: 'Mendaftarkan user baru (Siti Aminah)', 
    status: 'success',
    metadata: { ipAddress: '10.24.1.20', targetUser: 'Siti Aminah', targetRole: 'Petani', details: 'User berhasil dibuat dengan ID U-003' }
  },
  { 
    id: 'LOG-008', 
    timestamp: '2026-08-11 09:45:22', 
    actor: 'Master Admin', 
    category: 'System', 
    action: 'Mengubah AI Confidence Threshold ke 75%', 
    status: 'success',
    metadata: { previousThreshold: '70%', newThreshold: '75%', details: 'Sensitivitas klasifikasi penyakit sawit diperbarui.' }
  },
  { 
    id: 'LOG-009', 
    timestamp: '2026-08-11 10:10:05', 
    actor: 'Danu Kusuma (Teknisi)', 
    category: 'Drone', 
    action: 'Inisialisasi video stream WebRTC Drone-02', 
    status: 'success',
    metadata: { droneId: 'Drone-02', streamUrl: 'webrtc://stream.dreampalm.com/drone02', details: 'Koneksi kamera drone real-time 1080p terjalin' }
  },
  { 
    id: 'LOG-010', 
    timestamp: '2026-08-11 10:15:30', 
    actor: 'System Database', 
    category: 'System', 
    action: 'Backup database otomatis berhasil', 
    status: 'success',
    metadata: { backupSize: '24.5 MB', storageProvider: 'Cloud Storage Bucket', details: 'File backup: backup_dreampalm_20260811.sql' }
  }
];

export default function SystemLogs() {
  const [logs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Search & Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-[#16161a] p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text"
            placeholder="Cari aktor, ID, atau aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-sm text-gray-900 dark:text-white outline-none focus:border-[#84994F] dark:focus:border-[#84994F] transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-sm text-gray-800 dark:text-white outline-none focus:border-[#84994F]"
          >
            <option value="all">Semua Status</option>
            <option value="success">SUCCESS</option>
            <option value="info">INFO</option>
            <option value="warning">WARNING</option>
            <option value="error">ERROR</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-sm text-gray-800 dark:text-white outline-none focus:border-[#84994F]"
          >
            <option value="all">Semua Kategori</option>
            <option value="Auth">Autentikasi (Auth)</option>
            <option value="Drone">Telemetri Drone</option>
            <option value="AI Detection">Deteksi AI</option>
            <option value="System">Sistem Internal</option>
          </select>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white dark:bg-[#16161a] rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-800/20 border-b border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">ID Log</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Aktor / User</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Aktivitas / Event</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/40 text-sm">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 dark:text-zinc-500 shrink-0">{log.timestamp}</td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400">{log.id}</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20 text-gray-500 dark:text-zinc-400">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-zinc-300">{log.actor}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-zinc-400 truncate max-w-xs">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-sm text-xs font-semibold
                        ${log.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 
                          log.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 
                          log.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Tidak ada log aktivitas yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#16161a] border dark:border-zinc-800 w-full max-w-lg p-6 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#84994F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Detail Log Aktivitas
              </h2>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block font-bold text-gray-400 uppercase tracking-wider">Log ID</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-zinc-300">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="block font-bold text-gray-400 uppercase tracking-wider">Timestamp</span>
                  <span className="font-mono text-gray-850 dark:text-zinc-350">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="block font-bold text-gray-400 uppercase tracking-wider">Kategori</span>
                  <span className="font-semibold text-gray-800 dark:text-zinc-300">{selectedLog.category}</span>
                </div>
                <div>
                  <span className="block font-bold text-gray-400 uppercase tracking-wider">Aktor / User</span>
                  <span className="font-semibold text-gray-850 dark:text-zinc-350">{selectedLog.actor}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Aktivitas</span>
                <p className="text-sm bg-gray-50 dark:bg-zinc-800/40 p-2.5 rounded border border-gray-100 dark:border-zinc-800/30 text-gray-800 dark:text-zinc-200">
                  {selectedLog.action}
                </p>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status Keamanan/Keparahan</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-sm text-xs font-semibold
                  ${selectedLog.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 
                    selectedLog.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' : 
                    selectedLog.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'}`}>
                  {selectedLog.status.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payload & Metadata (JSON)</span>
                <pre className="text-[11px] font-mono leading-normal bg-zinc-900 text-green-400 dark:bg-black dark:text-green-500 p-4 rounded-md overflow-x-auto border border-zinc-800 shadow-inner max-h-52">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t dark:border-zinc-800 mt-6">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded text-sm font-semibold border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Tutup Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}