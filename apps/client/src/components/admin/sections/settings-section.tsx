"use client";
import { useState } from 'react';

type SettingsTab = 'profile' | 'ai-iot' | 'map' | 'danger';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Settings State
  const [profile, setProfile] = useState({
    name: 'Master Admin',
    email: 'admin@drone.research.ac.id',
    password: '',
    confirmPassword: ''
  });

  const [aiIot, setAiIot] = useState({
    confidenceThreshold: 75,
    connectionTimeout: 10,
    videoQuality: 'High',
    telemetryRate: 2
  });

  const [mapDefaults, setMapDefaults] = useState({
    latitude: '-1.2442',
    longitude: '116.8921',
    zoom: '15'
  });

  const [systemDefaults, setSystemDefaults] = useState({
    logRetention: '90',
    maxCaptureSize: '10'
  });

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSave = (e: React.FormEvent, sectionName: string) => {
    e.preventDefault();
    
    // Custom check for password mismatch in profile tab
    if (activeTab === 'profile' && profile.password) {
      if (profile.password !== profile.confirmPassword) {
        triggerToast('Error: Konfirmasi password tidak cocok!');
        return;
      }
    }

    triggerToast(`Sukses: Pengaturan ${sectionName} berhasil disimpan.`);
  };

  const handleResetLogs = () => {
    if (confirm('APAKAH ANDA YAKIN? Tindakan ini akan menghapus permanen seluruh log aktivitas sistem dari database.')) {
      triggerToast('Sukses: Seluruh log sistem berhasil di-reset!');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      
      {/* Settings Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-zinc-800 flex gap-6 overflow-x-auto pb-px">
        {(['profile', 'ai-iot', 'map', 'danger'] as SettingsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize whitespace-nowrap transition-colors border-b-2 -mb-px outline-none ${
              activeTab === tab
                ? 'border-[#84994F] text-[#84994F]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'
            }`}
          >
            {tab === 'profile' && 'Profil Admin'}
            {/* {tab === 'ai-iot' && 'Parameter AI & IoT'}
            {tab === 'map' && 'Peta & Spot Marking'}
            {tab === 'danger' && 'Zona Bahaya'} */}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-[#16161a] border border-gray-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={(e) => handleSave(e, 'Profil')} className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">Informasi Akun</h2>
              <p className="text-xs text-gray-500">Kelola identitas utama Superuser Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-800 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Alamat Email</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-800 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-zinc-800/40" />

            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Ubah Kata Sandi</h2>
              <p className="text-xs text-gray-500">Biarkan kosong jika Anda tidak ingin memperbarui password.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-850 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Konfirmasi Kata Sandi</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-850 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>
            </div>

            <div className="pt-4 border-t dark:border-zinc-800 flex justify-end">
              <button 
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded text-white shadow-sm hover:opacity-90 transition-opacity" 
                style={{ background: '#84994F' }}
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* AI & IOT TAB */}
        {activeTab === 'ai-iot' && (
          <form onSubmit={(e) => handleSave(e, 'AI & IoT')} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">Parameter Machine Learning & Drone</h2>
              <p className="text-xs text-gray-500">Konfigurasi batas aman sensitivitas AI dan komunikasi IoT.</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">AI Confidence Threshold (BSR)</label>
                  <span className="text-xs font-bold text-[#84994F]">{aiIot.confidenceThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={aiIot.confidenceThreshold}
                  onChange={(e) => setAiIot({ ...aiIot, confidenceThreshold: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#84994F]" 
                />
                <span className="block text-[10.5px] text-gray-400 mt-1">Batas minimum akurasi model AI sebelum merekam spot marking pohon sawit sakit ke peta.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">IoT Connection Timeout (Detik)</label>
                  <input 
                    type="number" 
                    min="3" 
                    max="60"
                    value={aiIot.connectionTimeout}
                    onChange={(e) => setAiIot({ ...aiIot, connectionTimeout: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-800 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                  />
                  <span className="block text-[10.5px] text-gray-400 mt-1">Detik jeda data hilang sebelum drone dianggap offline.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Live Camera WebRTC Quality</label>
                  <select 
                    value={aiIot.videoQuality}
                    onChange={(e) => setAiIot({ ...aiIot, videoQuality: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-gray-800 dark:text-white outline-none focus:border-[#84994F]"
                  >
                    <option value="Low">Low (480p, Hemat Bandwidth)</option>
                    <option value="Medium">Medium (720p, Keseimbangan)</option>
                    <option value="High">High (1080p, Akurasi Maksimal)</option>
                  </select>
                  <span className="block text-[10.5px] text-gray-400 mt-1">Resolusi stream video yang dikompresi dari kamera Raspberry Pi di drone.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-zinc-800 flex justify-end">
              <button 
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded text-white shadow-sm hover:opacity-90 transition-opacity" 
                style={{ background: '#84994F' }}
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* MAP DEFAULT TAB */}
        {activeTab === 'map' && (
          <form onSubmit={(e) => handleSave(e, 'Peta')} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">Koordinat Default Perkebunan</h2>
              <p className="text-xs text-gray-500">Tentukan titik awal fokus peta Spot Marking digital.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Default Latitude</label>
                <input 
                  type="text" 
                  value={mapDefaults.latitude}
                  onChange={(e) => setMapDefaults({ ...mapDefaults, latitude: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-800 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Default Longitude</label>
                <input 
                  type="text" 
                  value={mapDefaults.longitude}
                  onChange={(e) => setMapDefaults({ ...mapDefaults, longitude: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-800 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Map Zoom Level (1-20)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20"
                  value={mapDefaults.zoom}
                  onChange={(e) => setMapDefaults({ ...mapDefaults, zoom: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-850 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-zinc-800/40" />

            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Batasan File Sistem</h2>
              <p className="text-xs text-gray-500">Konfigurasi kapasitas data visual.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Masa Simpan Log (Hari)</label>
                <select 
                  value={systemDefaults.logRetention}
                  onChange={(e) => setSystemDefaults({ ...systemDefaults, logRetention: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-gray-800 dark:text-white outline-none focus:border-[#84994F]"
                >
                  <option value="30">30 Hari</option>
                  <option value="90">90 Hari</option>
                  <option value="180">180 Hari</option>
                  <option value="0">Selamanya (Jangan Dihapus)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Maks. Ukuran File Foto Drone (MB)</label>
                <input 
                  type="number" 
                  min="1"
                  max="50"
                  value={systemDefaults.maxCaptureSize}
                  onChange={(e) => setSystemDefaults({ ...systemDefaults, maxCaptureSize: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111115] text-gray-850 dark:text-white rounded-md outline-none focus:border-[#84994F]" 
                />
              </div>
            </div>

            <div className="pt-4 border-t dark:border-zinc-800 flex justify-end">
              <button 
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded text-white shadow-sm hover:opacity-90 transition-opacity" 
                style={{ background: '#84994F' }}
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-red-600 dark:text-red-500 mb-1">Zona Risiko Tinggi</h2>
              <p className="text-xs text-gray-500">Tindakan berikut akan mempengaruhi kestabilan database sistem secara permanen.</p>
            </div>

            <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Reset Seluruh Database Log</h3>
                <p className="text-xs text-red-650/80 dark:text-red-400/60 mt-0.5">Tindakan ini menghapus seluruh riwayat log aktivitas yang tersimpan.</p>
              </div>
              <button 
                onClick={handleResetLogs}
                className="px-4 py-2 text-xs font-semibold rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/20 transition-all shrink-0"
              >
                Hapus Seluruh Log
              </button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/10 border border-gray-200 dark:border-zinc-800 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-300">Kosongkan Cache File Telemetri</h3>
                <p className="text-xs text-gray-500 mt-0.5">Menghapus file cache visual drone sementara di server.</p>
              </div>
              <button 
                onClick={() => triggerToast('Sukses: Cache telemetri berhasil dibersihkan.')}
                className="px-4 py-2 text-xs font-semibold rounded border border-gray-300 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all shrink-0"
              >
                Bersihkan Cache
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          {toastMessage.startsWith('Sukses') ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}