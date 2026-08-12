"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function UserProfileDropdown() {
  const router = useRouter();
  const { signOutApp } = useAuth();

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      try {
        await signOutApp();
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        router.push('/');
      }
    }
  };

  return (
    <div className="flex items-center gap-3 border-l dark:border-zinc-800 pl-4 group relative cursor-pointer">
      <div className="w-9 h-9 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
        MA
      </div>
      <div className="hidden sm:flex flex-col text-left">
        <span className="text-sm font-semibold text-gray-800 dark:text-zinc-100 leading-none">Master Admin</span>
        <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">Superuser</span>
      </div>
      
      {/* Dropdown Menu (Opsional untuk dikembangkan, saat ini Logout menempel di Sidebar berdasarkan file asal, tapi fungsi ini disiapkan untuk Header jika diperlukan) */}
    </div>
  );
}