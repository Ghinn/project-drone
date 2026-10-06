"use client";
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from "@/providers/auth-provider";
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import { Check, Eye, EyeOff, Info, Lock, LockKeyhole, SendHorizonal, Users, Loader2 } from 'lucide-react';

const T = DRONE_TOKENS;

// Helper Function
function formatDisplayName(displayName: string | null | undefined, email: string | null | undefined, fallback: string): string {
  if (displayName) return displayName;
  if (email) {
    const namePart = email.split('@')[0];
    return namePart.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return fallback;
}

interface LinkedUser {
  id: string;
  name: string;
  role: string;
}

export default function SettingsSection() {
  const { user, role } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [droneId, setDroneId] = useState('Memuat data...');
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  
  // State untuk Keamanan Akun
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State Interaksi UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sinkronisasi data dasar dari Auth Provider
  useEffect(() => {
    if (user) {
      setName(formatDisplayName(user.displayName, user.email, 'Operator'));
      setEmail(user.email || 'Tidak ada email');
    }
  }, [user]);

  // Fetch Relasional: Profil Operator dan Detail Drone
  useEffect(() => {
    const fetchOperatorData = async () => {
      try {
        const profileRes = await fetch("/api/operator/me", {
          method: "GET",
          credentials: "include"
        });
        
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          const assignedDroneId = profileJson.data?.assignedDroneId;
          
          if (assignedDroneId) {
            setDroneId(assignedDroneId);
            
            const droneRes = await fetch("/api/operator/my-drone", {
              method: "GET",
              credentials: "include"
            });
            
            if (droneRes.ok) {
              const droneJson = await droneRes.json();
              
              const operators = droneJson.data?.operator || [];
              const formattedUsers = operators.map((op: any) => ({
                id: op.id,
                name: op.name || op.email.split('@')[0], 
                role: 'OPERATOR'
              }));
              
              setLinkedUsers(formattedUsers);
            }
          } else {
            setDroneId('Belum ada perangkat terhubung');
            setLinkedUsers([]);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data operator:", error);
        setDroneId("Gagal memuat data perangkat");
      }
    };

    fetchOperatorData();
  }, []);

  const roleLabel = useMemo(() => {
    if (role === 'ADMIN') return 'ADMIN';
    if (role === 'FARMER') return 'FARMER';
    return 'OPERATOR';
  }, [role]);

  // Helper untuk inisial Avatar Profil Utama
  const avatarInitials = useMemo(() => {
    return (name || 'OP').split(' ').map(n => n?.[0]).join('').slice(0, 2).toUpperCase();
  }, [name]);

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
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pengaturan</h1>
        <p className="text-xs text-gray-500 mt-0.5">Pengaturan Akun · Kelola profil dan preferensi akun operator Anda</p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#F36B42]/10`}>
            <Users size={16} className='text-[#F36B42]'/>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Informasi Akun</h3>
            <p className="text-xs text-gray-400">Data profil operator terdaftar di sistem DreamPalm</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg bg-linear-to-br from-[#84994F] to-[#C1D343]">
              {avatarInitials}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#84994F18] text-[#C1D343] tracking-wide`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nama Lengkap</label>
              <input disabled value={name} onChange={e => setName(e.target.value)} className={inputCls} style={focusStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
              <input disabled value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputCls} style={focusStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Drone ID</label>
              <div className='relative'>
                <input disabled value={droneId} onChange={e => setDroneId(e.target.value)} className={`pl-8 ${inputCls}`} style={focusStyle} />
                <SendHorizonal size={16} className='absolute left-2 top-1/2 mt-0.5 -translate-y-1/2 text-gray-300 -rotate-90'/>
                <div className="absolute right-2 bottom-2 flex items-center gap-2 px-2 py-1 text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-900 rounded-md">
                  <Lock size={16}/>
                  <span>ADMIN</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex items-center justify-between w-full'>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pengguna Terkait</label>
                <div className="flex items-center gap-2 p-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-900 mb-1.5 rounded-md">
                  <Lock size={16}/>
                  <span>ADMIN</span>
                </div>
              </div>
              <div className={inputCls}>
                {linkedUsers.length > 0 ? (
                  linkedUsers.map(linkedUser => (
                    <div key={linkedUser.id} className="flex items-center gap-3 py-1">
                      <span className='rounded-full bg-[#84994F] text-white p-1 font-semibold text-[6px] shrink-0 flex items-center justify-center w-5 h-5'>
                        {(linkedUser.name || 'OP').split(' ').map(n => n?.[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <div className='flex items-center justify-between w-full'>
                        <span className='text-sm'>{linkedUser.name}</span>
                        <span className='text-xs capitalize bg-gray-200 dark:bg-gray-900 text-gray-400 px-2 py-1 rounded-md'>{linkedUser.role}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-1 text-sm text-gray-500 dark:text-gray-400">Tidak ada pengguna lain yang terkait</div>
                )}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1 text-sm text-gray-300'><Info size={12}/> Drone ID dan Pengguna Terkait dikelola langsung oleh Admin DreamPalm. Hubungi admin untuk perubahan data.</div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-[#C8553D] bg-[#C8553D1A]">
            <LockKeyhole size={16}/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Keamanan Akun</h3>
            <p className="text-xs text-gray-400">Ubah kata sandi akun operator Anda</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kata Sandi Saat Ini</label>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kata Sandi Baru</label>
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
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 p-1 hover:text-gray-700' 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Konfirmasi Kata Sandi Baru</label>
              <div className='relative'>
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
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 p-1 hover:text-gray-700' 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Alert Error Message */}
          {errorMessage && (
            <p className="text-xs font-semibold" style={{ color: T.red }}>
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={isSubmitting || !newPassword || !confirmPassword}
            className="px-8 py-3 w-full sm:w-auto rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 bg-[#6B8E23] dark:bg-[#495630]">
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