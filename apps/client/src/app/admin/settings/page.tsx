import Settings from '@/components/admin/sections/settings';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Admin Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Kelola preferensi dan pengaturan akun Anda.</p>
      </div>
      
      {/* Memanggil komponen Settings yang sudah kamu buat sebelumnya */}
      <Settings />
    </div>
  );
}