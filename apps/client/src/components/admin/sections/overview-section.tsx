"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Users, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  Droplet, 
  FileText, 
  Drone
} from "lucide-react";
import { useAdminContext } from "../layout/admin-context";

interface LogItem {
  id: string;
  timestamp: string;
  category: "Auth" | "Operator" | "AI" | string;
  actor: string;
  action: string;
  status: "INFO" | "ADMIN" | "SUCCESS" | "ERROR" | string;
}

const DEFAULT_LOGS: LogItem[] = [
  {
    id: "LOG-001",
    timestamp: "2026-08-11 08:00:12",
    category: "Auth",
    actor: "Master Admin",
    action: "Login ke sistem",
    status: "INFO",
  },
  {
    id: "LOG-002",
    timestamp: "2026-08-11 08:15:32",
    category: "Operator",
    actor: "Operator Lapangan",
    action: "Drone-01 lepas landas (Take-off)",
    status: "ADMIN",
  },
  {
    id: "LOG-003",
    timestamp: "2026-08-11 08:22:05",
    category: "AI",
    actor: "System AI",
    action: "Deteksi tidak sehat - Confidence 94%",
    status: "INFO",
  },
  {
    id: "LOG-004",
    timestamp: "2026-08-11 08:30:15",
    category: "AI",
    actor: "System AI",
    action: "Deteksi tidak sehat - Confidence 71%",
    status: "INFO",
  },
  {
    id: "LOG-005",
    timestamp: "2026-08-11 08:45:00",
    category: "Operator",
    actor: "Operator Lapangan",
    action: "Drone-01 mendarat (Landing)",
    status: "SUCCESS",
  },
];

export default function Overview() {
  const router = useRouter();
  const { setActiveTab } = useAdminContext();

  const [stats, setStats] = useState({
    totalDrones: 3,
    totalUsers: 7,
    totalOperators: 3,
    predictedTrees: 5,
    unhealthyTrees: 3,
    totalPesticide: "2.500",
  });

  // Fetch real counts from backend if available
  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, dronesRes] = await Promise.allSettled([
          fetch("/api/admin/users"),
          fetch("/api/admin/drones"),
        ]);

        let userCount = 7;
        let operatorCount = 3;
        let droneCount = 3;

        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const userData = await usersRes.value.json();
          const usersList = userData.data?.users || userData.users || userData.data || [];
          if (Array.isArray(usersList) && usersList.length > 0) {
            userCount = usersList.length;
            operatorCount = usersList.filter(
              (u: any) => u.role === "OPERATOR" || u.role?.toLowerCase() === "operator"
            ).length;
          }
        }

        if (dronesRes.status === "fulfilled" && dronesRes.value.ok) {
          const droneData = await dronesRes.value.json();
          const droneList = droneData.data?.drones || droneData.drones || droneData.data || [];
          if (Array.isArray(droneList) && droneList.length > 0) {
            droneCount = droneList.length;
          }
        }

        setStats((prev) => ({
          ...prev,
          totalUsers: userCount,
          totalOperators: operatorCount,
          totalDrones: droneCount,
        }));
      } catch (err) {
        console.error("Failed to load overview stats:", err);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      label: "TOTAL DRONE",
      value: stats.totalDrones.toString(),
      sub: "drone terdaftar",
      icon: Drone,
      iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-500",
    },
    {
      label: "TOTAL PENGGUNA",
      value: stats.totalUsers.toString(),
      sub: "akun terdaftar",
      icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-500",
    },
    {
      label: "TOTAL OPERATOR",
      value: stats.totalOperators.toString(),
      sub: "operator aktif",
      icon: User,
      iconBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-500",
    },
    {
      label: "POHON DIPREDIKSI",
      value: stats.predictedTrees.toString(),
      sub: "total pohon dipindai",
      icon: TrendingUp,
      iconBg: "bg-[#6B8E23]/10 dark:bg-[#6B8E23]/20 text-[#6B8E23]",
    },
    {
      label: "TIDAK SEHAT",
      value: stats.unhealthyTrees.toString(),
      sub: "terdeteksi tidak sehat",
      icon: AlertTriangle,
      iconBg: "bg-red-50 dark:bg-red-950/40 text-red-500",
    },
    {
      label: "TOTAL PESTISIDA",
      value: stats.totalPesticide,
      unit: "ml",
      sub: "cairan telah disemprotkan",
      icon: Droplet,
      iconBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600",
    },
  ];

  const handleNavigateToLogs = () => {
    setActiveTab("logs");
    router.push("/admin/logs");
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "INFO":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400";
      case "ADMIN":
        return "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400";
      case "SUCCESS":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400";
      case "ERROR":
        return "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-100 select-none pb-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Overview Sistem
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Ringkasan keseluruhan data operasional DreamPalm
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] shadow-xs flex flex-col justify-between hover:border-gray-200 dark:hover:border-[#333] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-[#6B8E23] uppercase">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono tracking-tight text-gray-900 dark:text-white">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {card.unit}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabel Log Terbaru */}
      <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-[#222] overflow-hidden shadow-xs">
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6B8E23]/15 dark:bg-[#6B8E23]/25 flex items-center justify-center text-[#6B8E23]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Log Terbaru
              </h3>
              <p className="text-[11px] text-gray-400">
                Hasil dari log sistem
              </p>
            </div>
          </div>

          {/* Tombol Lihat Semua -> Menuju Log Sistem */}
          <button
            onClick={handleNavigateToLogs}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#202020] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-all cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#161616] text-[10px] font-bold text-[#6B8E23] uppercase tracking-wider border-b border-gray-100 dark:border-[#222]">
                <th className="px-6 py-3.5">TIMESTAMP</th>
                <th className="px-6 py-3.5">ID LOG</th>
                <th className="px-6 py-3.5 text-center">KATEGORI</th>
                <th className="px-6 py-3.5">AKTOR / USER</th>
                <th className="px-6 py-3.5">AKTIVITAS / EVENT</th>
                <th className="px-6 py-3.5 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#1f1f1f] text-xs">
              {DEFAULT_LOGS.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-medium text-xs text-[#6B8E23] dark:text-[#8BAE3A]">
                    {log.timestamp}
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-xs text-gray-900 dark:text-gray-100">
                    {log.id}
                  </td>

                  <td className="pr-4 pl-8 py-4 text-left">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#6B8E23]/15 dark:bg-[#6B8E23]/25 text-[#6B8E23] dark:text-[#8BAE3A]">
                      {log.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                    {log.actor}
                  </td>

                  <td className="px-6 py-4 text-[#6B8E23] dark:text-[#8BAE3A]">
                    {log.action}
                  </td>

                  <td className="pr-4 pl-10 py-4 text-left">
                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${getStatusBadge(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 dark:border-[#222] text-xs text-gray-400 dark:text-gray-500">
          Menampilkan {DEFAULT_LOGS.length} aktivitas terbaru
        </div>
      </div>
    </div>
  );
}