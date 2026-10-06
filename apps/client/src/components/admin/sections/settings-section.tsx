"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@/providers/auth-provider";
import { Users, LockKeyhole, Check, Eye, EyeOff, Loader2 } from 'lucide-react';

// Helper Function
function formatDisplayName(displayName: string | null | undefined, email: string | null | undefined, fallback: string): string {
  if (displayName) return displayName;
  if (email) {
    const namePart = email.split('@')[0];
    return namePart.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return fallback;
}

export default function Settings() {
  const { user } = useAuth(); 
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saved, setSaved] = useState(false);

  // Profile States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const T = { green: '#84994F', red: '#ef4444' };

  // Sinkronisasi data dasar dari Auth Provider
  useEffect(() => {
    if (user) {
      setName(formatDisplayName(user.displayName, user.email, 'Administrator'));
      setEmail(user.email || 'Tidak ada email');
    }
  }, [user]);

  // Integrasi API Update Password
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Jika pengguna hanya menekan simpan tanpa mengubah kata sandi
    if (!currentPassword && !newPassword && !confirmPassword) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Harap isi kata sandi baru dan konfirmasinya.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal terdiri dari 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMessage(data.error || "Gagal memperbarui kata sandi.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi kesalahan pada server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#0f0f0f] text-sm text-gray-400 dark:text-gray-100 outline-none focus:ring-2 transition-all";
  const focusStyle = { '--tw-ring-color': `${T.green}55` } as React.CSSProperties;

  return (
    <div className="w-full min-w-0 space-y-6 animate-in fade-in duration-300">
      
      {/* PROFIL ADMIN */}
      <div className="bg-white dark:bg-[#16161a] border border-gray-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Informasi Akun */}
          <div>
            <div className="py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#F36B42]/10`}>
                <Users size={16} className='text-[#F36B42]'/>
              </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-1">Informasi Akun</h2>
              <p className="text-xs text-gray-500">Kelola identitas utama akun Admin Anda.</p>
            </div>
          </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Alamat Email</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className={`${inputCls} cursor-not-allowed opacity-70 bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-500`}
                  style={focusStyle}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-zinc-800/40" />

          {/* Keamanan Akun */}
          <div>
            <div className="py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-[#C8553D] bg-[#C8553D1A]">
                <LockKeyhole size={16}/>
              </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Keamanan Akun</h2>
              <p className="text-xs text-gray-500">Ubah kata sandi akun admin Anda.</p>
            </div>
          </div>

            <div className="space-y-4 mt-4">
              <div className="w-full md:w-1/2 md:pr-2">
                <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input 
                    id="currentPassword" 
                    value="••••••••" 
                    type="text"
                    disabled 
                    autoComplete="off"
                    className={`${inputCls} cursor-not-allowed opacity-70`} 
                    style={focusStyle}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Kata Sandi Baru</label>
                  <div className="relative">
                    <input 
                      id="newPassword" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      type={showNewPassword ? "text" : "password"} 
                      autoComplete="new-password"
                      placeholder="••••••••" 
                      className={inputCls} 
                      style={focusStyle} 
                    />
                    <button 
                      type="button" 
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input 
                      id="confirmPassword" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      type={showConfirmPassword ? "text" : "password"} 
                      autoComplete="new-password"
                      placeholder="••••••••" 
                      className={inputCls} 
                      style={focusStyle} 
                    />
                    <button 
                      type="button" 
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Error Message */}
            <div className="pt-6 mt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                {errorMessage && (
                  <p className="text-xs font-semibold animate-in fade-in slide-in-from-left-2 duration-300" style={{ color: T.red }}>
                    {errorMessage}
                  </p>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded text-white shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2" 
                style={{ background: T.green }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Save Button Notification */}
      <div className="flex items-center justify-start gap-3">
        {saved && (
          <div className='fixed bottom-4 right-4 z-50 bg-white dark:bg-[#1e1e1e] p-4 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 animate-in slide-in-from-bottom-5 duration-300'>
            <span className={`text-xs font-semibold flex items-center gap-3 text-[${T.green}]`}>
              <Check size={16}/> Kata sandi berhasil diperbarui!
            </span>
          </div>
        )}
      </div>

    </div>
  );
}