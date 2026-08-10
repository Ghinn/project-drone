"use client";
import { useState, useEffect } from 'react';

export default function Overview() {
  // Mock Data
  const stats = [
    { 
      label: "Drone Aktif", 
      value: "3 / 5", 
      sub: "3 Terbang, 2 Siaga", 
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    },
    { 
      label: "Luas Lahan Terpantau", 
      value: "1.240 Ha", 
      sub: "8 Blok Perkebunan", 
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      label: "Total Sawit Dipindai", 
      value: "18.245", 
      sub: "Akurasi AI: 94.2%", 
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16.01H9" />
        </svg>
      )
    },
    { 
      label: "Deteksi Sakit (BSR)", 
      value: "842 Pohon", 
      sub: "4.6% dari total populasi", 
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ];

  // Secondary metrics
  const quickStats = [
    { label: "Total Pengguna", value: "48", desc: "12 Petani, 6 Teknisi, 2 Admin" },
    { label: "Pohon Sehat", value: "17.403", desc: "95.4% Hijau Lestari" },
    { label: "Pilot / Operator", value: "6 Personel", desc: "Sertifikasi Drone Terdaftar" },
    { label: "Penyemprotan Selesai", value: "620 Titik", desc: "Ditindaklanjuti Manual" }
  ];

  // Live Telemetry Stream Simulation
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[08:21:44] Drone-01 lepas landas menuju Block B",
    "[08:21:52] AI memindai koordinat GPS -1.244, 116.895: Sawit SEHAT (Confidence 98%)",
    "[08:22:05] Drone-02 memasuki Block A (Telemetri OK)",
    "[08:22:15] AI memindai koordinat GPS -1.246, 116.899: DETEKSI PENYAKIT BSR (Confidence 89%)",
    "[08:22:30] Sistem mendaftarkan tanda GPS baru di Blok A-12",
  ]);

  useEffect(() => {
    const coords = [
      { lat: "-1.242", lng: "116.890" },
      { lat: "-1.245", lng: "116.893" },
      { lat: "-1.248", lng: "116.897" },
      { lat: "-1.251", lng: "116.901" }
    ];
    const events = [
      "AI memindai koordinat: Sawit SEHAT (Confidence 96%)",
      "AI memindai koordinat: DETEKSI PENYAKIT BSR (Confidence 91%)",
      "Drone-01: Status baterai 78%, kecepatan angin 12km/h",
      "Drone-03: Menghubungkan video stream WebRTC...",
      "Sistem IoT menerima telemetri GPS drone",
    ];

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const randomCoord = coords[Math.floor(Math.random() * coords.length)];
      
      let logText = `[${time}] ${randomEvent}`;
      if (randomEvent.includes("koordinat")) {
        logText = `[${time}] ${randomEvent} di GPS ${randomCoord.lat}, ${randomCoord.lng}`;
      }

      setTelemetryLogs(prev => [logText, ...prev.slice(0, 7)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Overview Sistem</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pemantauan real-time AI & Telemetri IoT Kebun Kelapa Sawit</p>
        </div>
        <div className="flex gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Server Backend Online
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
            3 Drone Mengudara
          </span>
        </div>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, idx) => (
          <div 
            key={idx} 
            className="p-5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{item.label}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1.5">{item.value}</h3>
              </div>
              <div className={`p-2.5 rounded-lg ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84994F]"></span>
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts & Ticker Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Line Chart (BSR Detection Trends) */}
        <div className="lg:col-span-2 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Tren Temuan Penyakit (BSR)</h2>
              <p className="text-xs text-gray-500">Jumlah kasus terdeteksi AI 6 bulan terakhir</p>
            </div>
            <select className="text-xs border border-gray-200 dark:border-zinc-800 rounded px-2.5 py-1 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              <option>Semua Blok</option>
              <option>Block A</option>
              <option>Block B</option>
              <option>Block C</option>
            </select>
          </div>

          {/* Pure SVG Line Chart */}
          <div className="relative flex-1 min-h-[220px] flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84994F" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#84994F" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Gridlines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" className="dark:stroke-zinc-800/40" strokeDasharray="3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" className="dark:stroke-zinc-800/40" strokeDasharray="3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" className="dark:stroke-zinc-800/40" strokeDasharray="3" />
              
              {/* Area path */}
              <path 
                d="M 10 170 Q 100 130 190 145 T 370 70 T 490 50 L 490 200 L 10 200 Z" 
                fill="url(#chartGradient)"
              />
              
              {/* Curve line */}
              <path 
                d="M 10 170 Q 100 130 190 145 T 370 70 T 490 50" 
                fill="none" 
                stroke="#84994F" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="10" cy="170" r="5" fill="#84994F" stroke="#fff" strokeWidth="2" className="dark:stroke-zinc-900" />
              <circle cx="100" cy="144" r="5" fill="#84994F" stroke="#fff" strokeWidth="2" className="dark:stroke-zinc-900" />
              <circle cx="190" cy="145" r="5" fill="#84994F" stroke="#fff" strokeWidth="2" className="dark:stroke-zinc-900" />
              <circle cx="280" cy="110" r="5" fill="#84994F" stroke="#fff" strokeWidth="2" className="dark:stroke-zinc-900" />
              <circle cx="370" cy="70" r="5" fill="#84994F" stroke="#fff" strokeWidth="2" className="dark:stroke-zinc-900" />
              <circle cx="490" cy="50" r="6" fill="#A7D82E" stroke="#fff" strokeWidth="2.5" className="dark:stroke-zinc-900" />
            </svg>
            
            {/* Tooltip on active point */}
            <div className="absolute right-[5px] top-[15px] bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              Agustus: 842 Sakit
            </div>
          </div>
          
          {/* Chart Labels */}
          <div className="flex justify-between text-[11px] text-gray-400 dark:text-zinc-500 font-medium px-2 mt-3">
            <span>Maret</span>
            <span>April</span>
            <span>Mei</span>
            <span>Juni</span>
            <span>Juli</span>
            <span>Agustus</span>
          </div>
        </div>

        {/* Live Drone Telemetry & Stream Log */}
        <div className="p-6 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Live Telemetry Ticker</h2>
              <p className="text-xs text-gray-500">Aktivitas transmisi data IoT & AI</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px] pr-1">
            {telemetryLogs.map((log, idx) => {
              const isBSR = log.includes("BSR") || log.includes("PENYAKIT");
              return (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded text-xs leading-relaxed border transition-colors ${
                    isBSR 
                      ? "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300" 
                      : "bg-gray-50/50 border-gray-100 text-gray-600 dark:bg-zinc-800/30 dark:border-zinc-800/40 dark:text-zinc-300"
                  }`}
                >
                  <p className="font-mono text-[10.5px] font-medium">{log}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickStats.map((item, idx) => (
          <div 
            key={idx} 
            className="p-5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] shadow-sm"
          >
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase">{item.label}</p>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{item.value}</h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}