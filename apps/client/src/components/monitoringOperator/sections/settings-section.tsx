"use client";
import { useState } from 'react';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';
import { Check, Eye, Info, Lock, LockKeyhole, SendHorizonal, User2, Users } from 'lucide-react';

const T = DRONE_TOKENS;

// Drone terdaftar untuk akun ini (read-only, placeholder)
const REGISTERED_DRONES = [
  {
    id: 'DP-DRONE-001',
    model: 'DJI Mavic 3 Enterprise',
    firmware: 'v4.2.1',
    status: 'active',
    registeredAt: '14 Jan 2026',
  },
];

export default function SettingsSection() {
  const [name, setName] = useState('Dio Wirawan');
  const [email, setEmail] = useState('dio@dreampalm.com');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [droneId, setDroneId] = useState('v1-001');
  const [linkedUsers, setLinkedUsers] = useState([
    {
      id: 1,
      name: "Dio Aranda",
      role: 'OPERATOR'
    },
    {
      id: 2,
      name: "Fauzan Aziz",
      role: 'OPERATOR'
    }
  ]);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#0f0f0f] text-sm text-gray-400 dark:text-gray-100 outline-none focus:ring-2 transition-all";
  const inputClsPw = "w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm text-gray-400 dark:text-gray-100 outline-none focus:ring-2 transition-all";
  const focusStyle = { '--tw-ring-color': `${T.green}55` } as React.CSSProperties;

  const revealPw = (type: string) => {
    const input = document.getElementById(type) as HTMLInputElement;
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  };
  
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
              {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#84994F18] text-[#C1D343] tracking-wide`}>
                  OPERATOR
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
                {linkedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 py-1">
                    <span className='rounded-full bg-[#84994F] text-white p-1 font-semibold text-[6px]'>OP</span>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm'>{user.name}</span>
                      <span className='text-xs capitalize bg-gray-200 dark:bg-gray-900 text-gray-400 px-2 py-1 rounded-md'>{user.role}</span>
                    </div>
                  </div>
                ))}
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
              <input id="currentPassword" value={currentPw} onChange={e => setCurrentPw(e.target.value)} type="password" placeholder="••••••••" className={inputCls} style={focusStyle} />
              <Eye size={16} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500' onClick={e => revealPw('currentPassword')}/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kata Sandi Baru</label>
              <div className="relative">
                <input id="password" value={newPw} onChange={e => setNewPw(e.target.value)} type="password" placeholder="••••••••" className={inputCls} style={focusStyle} />
                <Eye size={16} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500' onClick={e => revealPw('password')}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Konfirmasi Kata Sandi Baru</label>
              <div className='relative'>
                <input id="confirmPassword" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} type="password" placeholder="••••••••" className={inputCls} style={focusStyle} />
                {confirmPw && newPw !== confirmPw && (
                  <p className="absolute text-[10px] mt-1" style={{ color: T.red }}>Kata sandi tidak cocok</p>
                )}
                <Eye size={16} className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500' onClick={e => revealPw('confirmPassword')}/>
              </div>
            </div>
          </div>
          <button
          onClick={handleSave}
          className="px-8 py-3 w-full sm:w-auto rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-[#6B8E23] dark:bg-[#495630]">
          Simpan Perubahan
        </button>
        </div>
      </div>

      {/* Notifications Card */}
      {/* <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: T.amber }}>
            🔔
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifikasi / Notifications</h3>
            <p className="text-xs text-gray-400">Atur kapan Anda menerima pemberitahuan sistem DreamPalm</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: 'Notifikasi Email', desc: 'Kirim laporan misi ke email terdaftar setelah penerbangan selesai', val: notifEmail, set: setNotifEmail, color: T.green },
            { label: 'Peringatan Kritis (BSR Detected)', desc: 'Pop-up dan notifikasi ketika AI mendeteksi penyakit BSR parah', val: notifCritical, set: setNotifCritical, color: T.red },
            { label: 'Laporan Otomatis Harian', desc: 'Ringkasan hasil scan harian dikirim tiap pukul 08.00 WIB', val: notifReport, set: setNotifReport, color: T.violet },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-[#1a1a1a] last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => item.set((v: boolean) => !v)}
                className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ml-4"
                style={{ background: item.val ? item.color : '#D1D5DB' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                  style={{ left: item.val ? '22px' : '2px' }}
                />
              </button>
            </div>
          ))}
        </div>
      </div> */}

      {/* Drone Terdaftar Card (BARU) */}
      {/* <div className="rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#1e1e1e] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1e1e1e] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: `linear-gradient(135deg, ${T.green}, ${T.violet})` }}>
            🚁
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Drone Terdaftar / Registered Drones</h3>
            <p className="text-xs text-gray-400">Daftar drone yang terhubung ke akun operator ini. Dikelola oleh Admin DreamPalm.</p>
          </div>
        </div>

        <div className="p-6">
          {REGISTERED_DRONES.map(drone => (
            <div
              key={drone.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-[#1e1e1e] bg-gray-50 dark:bg-[#0f0f0f]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: `${T.green}15` }}
                >
                  🚁
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{drone.model}</p>
                  <p className="text-xs font-mono text-gray-400">{drone.id} · Firmware {drone.firmware}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Terdaftar: {drone.registeredAt}</p>
                </div>
              </div>
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${T.green}20`, color: T.green, border: `1px solid ${T.green}44` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {drone.status === 'active' ? 'AKTIF' : 'TIDAK AKTIF'}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 mt-3">
            * Untuk menambah atau menghapus drone, hubungi Admin DreamPalm. Satu drone dapat dikelola lebih dari satu operator.
          </p>
        </div>
      </div> */}

      {/* Role Info */}
      {/* <div className="rounded-xl p-5 border border-dashed border-gray-200 dark:border-[#2a2a2a]">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Info Akses & Peran / Access & Role Info</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Peran / Role', value: 'Operator Drone' },
            { label: 'Level Akses / Access Level', value: 'Dashboard Operator' },
            { label: 'Platform', value: 'DreamPalm Drone System' },
            { label: 'Terdaftar Sejak', value: '14 Jan 2026' },
            { label: 'Login Terakhir / Last Login', value: 'Hari ini, 09:14 WIB' },
            { label: 'Versi Aplikasi / App Version', value: 'v1.0.0-beta' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5">
              <span className="text-xs text-gray-400">{r.label}</span>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{r.value}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Save Button */}
      <div className="flex items-center justify-start gap-3">
        {saved && (
          <div className='fixed bottom-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100'>
            <span className={`text-xs font-semibold flex items-center gap-3 text-[${T.green}]`}>
              <Check size={16}/> Perubahan berhasil disimpan!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}