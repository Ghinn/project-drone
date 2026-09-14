"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  Trash2,
  Loader2,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Plus,
  X,
  Eye,
  Users,
  CircleSlash,
  CircleSlash2
} from "lucide-react";

interface Operator {
  id: string;
  name: string | null;
  email: string;
  status: string; 
  emailVerified: boolean | null;
}

interface Drone {
  id: string;
  name: string | null;
  macAddress: string | null;
  status: string;
  isApproved: boolean;
  createdAt: string;
  operator: Operator[] | null;
}

export default function DroneManagementSection() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [currentDrone, setCurrentDrone] = useState<Drone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const fetchDrones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/drones", {
        method: "GET",
        credentials: "include"
      });
      const json = await res.json();
      
      if (res.ok && json.data) setDrones(json.data);
    } catch (error) {
      console.error("Failed to fetch drones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  // Perhitungan Statistik Kartu
  const stats = useMemo(() => ({
    total: drones.length,
    identified: drones.filter((d) => d.name && d.name.trim() !== "").length,
    unidentified: drones.filter((d) => !d.name || d.name.trim() === "").length,
    online: drones.filter((d) => d.status.toLowerCase() === "online").length,
  }), [drones]);


  const getIdOrder = (drones: Drone[], order = "newest") => {
    const ids = drones.map((drone) => drone.id);
    const numericOrder = ids.map((id) => parseInt(id.substring(3))).sort((a, b) => {
      if (order === "newest") {
        return b - a;
      } else {
        return a - b;
      }
    });
    let sortedIds: string[] = []
    numericOrder.forEach((order) => {
      const id = `v1-${order.toString().padStart(3, "0")}`;
      sortedIds.push(id);
    });

return sortedIds;
  }

  // Filter berdasarkan Tab & Search Query
  const filteredDrones = useMemo(() => {
    const result = drones.filter((drone) => {
      const matchesTab = activeTab === "ALL" || (activeTab === "ONLINE" && drone.status.toLowerCase() === "online") || (activeTab === "OFFLINE" && drone.status.toLowerCase() !== "online");
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = drone.id.toLowerCase().includes(searchStr) || (drone.name && drone.name.toLowerCase().includes(searchStr));
      return matchesTab && matchesSearch;
    });

    const sortedIds = getIdOrder(result, sortOrder);
    
    const sortedDrones = sortedIds
      .map((id) => result.find((drone) => drone.id === id))
      .filter((drone) => drone !== undefined) as Drone[];

    return sortedDrones;
  }, [drones, activeTab, searchQuery, sortOrder]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredDrones.length / itemsPerPage) || 1;
  const paginatedDrones = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrones.slice(start, start + itemsPerPage);
  }, [filteredDrones, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle Logic APPROVAL
  const handleApprovalAction = async (droneId: string, userId: string, action: 'ACCEPT' | 'DECLINE') => {
    setIsSubmitting(true);
    try {
      if (action === 'ACCEPT') {
        const res = await fetch(`/api/admin/drones/${droneId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApproved: true }),
        });
        if (!res.ok) throw new Error("Gagal menyetujui akses drone.");
      } else {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedDroneId: null }),
        });
        if (!res.ok) throw new Error("Gagal menolak/mencabut akses drone.");
      }
      
      setNotification({ type: "success", message: `Berhasil melakukan ${action} pada identifikasi drone.` });
      fetchDrones(); 
    } catch (error: any) {
      setNotification({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentDrone) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/drones/${currentDrone.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus drone.");
      setNotification({ type: "success", message: "Perangkat berhasil dihapus permanen dari sistem." });
      setIsDeleteModalOpen(false);
      fetchDrones();
    } catch (error: any) { 
      alert(error.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const addZero = (num: number) => String(num).padStart(2, "0");
    return `${addZero(date.getDate())}-${addZero(date.getMonth() + 1)}-${date.getFullYear()} ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/drones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Gagal menambahkan drone.");

      setNotification({
        type: "success",
        message:
          "Drone baru berhasil ditambahkan. Tautan pembuatan sandi telah dikirim!",
      });

      fetchDrones();
    } catch (error: any) {
      setNotification({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
      setIsFormModalOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-2.5 animate-in fade-in duration-300 min-h-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white leading-tight">
            Manajemen Drone
          </h1>
          <p className="text-xs text-[#5B6068] mt-0.5">
            Kelola pengenalan dan pantau status konektivitas perangkat keras.
          </p>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`p-2 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shrink-0
          ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline font-normal ml-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">Semua Drone</p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">{stats.total}</span>
            <span className="text-xs font-medium text-[#84994F]">unit</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">Drone Identified</p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">{stats.identified}</span>
            <span className="text-xs font-medium text-[#84994F]">unit</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">Drone Unidentified</p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">{stats.unidentified}</span>
            <span className="text-xs font-medium text-[#84994F]">unit</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">Drone Online</p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">{stats.online}</span>
            <span className="text-xs font-medium text-[#84994F]">unit</span>
          </div>
        </div>
      </div>

      {/* FILTER NAVBAR & ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 p-1 bg-[#F7F9FB] dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl overflow-x-auto">
          {(["ALL", "ONLINE", "OFFLINE"] as const).map((tab) => {
            const labels: Record<string, string> = {
              ALL: `Semua (${stats.total})`,
              ONLINE: "Online",
              OFFLINE: "Offline"
            };
            return <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${activeTab === tab ? "bg-[#84994F] text-white shadow-sm" : "text-[#5B6068] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white"}`}>{labels[tab]}</button>;
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A717F]" />
            <input 
              type="text"
              placeholder="Cari UID atau Nama..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl bg-white dark:bg-[#16161a] text-xs text-[#191919] dark:text-white outline-none focus:border-[#84994F] transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder == "oldest" ? "newest" : "oldest")}
            className="p-2.5 border rounded-xl bg-white dark:bg-[#16161a] transition-colors border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:text-[#191919] dark:hover:text-white"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button onClick={() => {setIsFormModalOpen(true)}} className="flex flex-row items-center gap-2 px-3 py-1.5 border rounded-xl bg-white dark:bg-[#16161a] transition-colors border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:text-[#191919] dark:hover:text-white">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>
      </div>

      {/* DRONE TABLE CARD */}
      <div className="z-0 flex-1 min-h-0 flex flex-col justify-between bg-white dark:bg-[#16161a] rounded-xl border border-[#E5E7EB] dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#84994F] text-white">
                <th className="w-[4%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">No.</th>
                <th className="w-[12%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Drone ID</th>
                <th className="w-[16%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Nama Perangkat</th>
                <th className="w-[12%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Tanggal Bergabung</th>
                <th className="w-[20%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Nama Pengguna</th>
                {/* <th className="w-[12%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Status Drone</th> */}
                <th className="w-[12%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Status Perangkat</th>
                <th className="w-[12%] px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#6A717F]">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#84994F] inline-block mr-2" />
                    <span>Memuat data drone...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedDrones.length > 0 ? (
                paginatedDrones.map((drone, index) => {
                  const rowNum = (currentPage - 1) * itemsPerPage + index + 1;
                  const isOnline = drone.status.toLowerCase() === "online";

                  // Logika Status Drone (Approval)
                  let droneApprovalText = "-";
                  let droneApprovalStyle = "text-gray-400";

                  if (drone.operator && drone.operator.length > 0) {
                    const ops = drone.operator;
                    for (const op of ops) {
                      if (op.status === "PENDING") {
                        if (op.emailVerified) {
                          droneApprovalText = "Disabled Account"; 
                          droneApprovalStyle = "bg-gray-100 text-gray-600 border-gray-200";
                          break;
                        } else {
                          droneApprovalText = "Pending Approval"; 
                          droneApprovalStyle = "bg-amber-50 text-amber-600 border-amber-200";
                          break;
                        }
                      } else if (op.status === "APPROVED") {
                        if (drone.isApproved) {
                          droneApprovalText = "Accepted";
                          droneApprovalStyle = "bg-emerald-50 text-emerald-600 border-emerald-200";
                        } else {
                          droneApprovalText = "Waiting Approval"; 
                          droneApprovalStyle = "bg-blue-50 text-blue-600 border-blue-200";
                        }
                      }
                    }
                  }

                  return (
                    <tr key={drone.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/20 transition-colors">
                      
                      {/* No */}
                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-[#191919] dark:text-zinc-300">
                        {rowNum}
                      </td>

                      {/* User ID */}
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-[#6A717F]">
                        {drone.id}
                      </td>

                      {/* Nama Perangkat */}
                      <td className="px-3 py-2.5 text-center text-xs text-[#191919] dark:text-white">
                        <span className="font-bold">{drone.name || "Menunggu Penamaan..."}</span>
                      </td>

                      {/* Tanggal Bergabung */}
                      <td className="px-3 py-2.5 text-center text-xs text-[#5B6068] dark:text-zinc-400 whitespace-nowrap">
                        {formatDate(drone.createdAt)}
                      </td>

                      {/* Nama Pengguna */}
                      <td className="px-3 py-2.5 text-xs text-[#191919] dark:text-white text-center">
                        {drone.operator && drone.operator.length > 0 ? (
                          <button onClick={() => {
                            setIsUserModalOpen(true); 
                            setCurrentDrone(drone);
                          }} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs font-bold">
                            <div className="flex justify-center items-center gap-2">
                              <Users/>
                            </div>
                          </button>
                          // drone.operator.map((op, idx) => (
                          //   <div key={idx} className="flex flex-col items-center text-center">
                          //     <span className="block font-bold leading-tight truncate w-full">
                          //       {op.name || "Tanpa Nama"}
                          //     </span>
                          //     <span className="block text-[11px] leading-tight font-normal text-[#5B6068] dark:text-zinc-400 truncate w-full">
                          //       {op.email}
                          //     </span>
                          //   </div>
                          // ))
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md text-[#5B6068]">
                              Tidak ada
                            </span>
                          </div>
                        )}
                      </td>
                      
                      {/* Status Drone */}
                      {/* <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${droneApprovalStyle}`}>
                          {droneApprovalText}
                        </span>
                      </td> */}

                      {/* Nama Perangkat */}
                      <td className="px-3 py-2.5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}{isOnline ? "Online" : "Offline"}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-3 py-1.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          
                          {/* Skenario 1: PENDING APPROVAL */}
                          {/* {droneApprovalText === "Pending Approval" && (
                            <div className="p-1.5 text-amber-500 dark:text-amber-400 cursor-help" title="Menunggu Verifikasi Pengguna">
                              <Clock className="w-4 h-4" />
                            </div>
                          )} */}

                          {/* Skenario B: WAITING APPROVAL */}
                          {/* {droneApprovalText === "Waiting Approval" && drone.operator && drone.operator.length > 0 && (
                            <>
                            {drone.operator.map((op, idx) => {
                              return (
                                <div key={idx} className="">
                                  <button onClick={() => handleApprovalAction(drone.id, op.id, 'ACCEPT')} disabled={isSubmitting} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50" title="ACCEPT">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleApprovalAction(drone.id, op.id, 'DECLINE')} disabled={isSubmitting} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50" title="DECLINE">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            })}
                            </>
                          )} */}

                          {/* Skenario C: ACCEPTED / DISABLED / KOSONG */}
                          {(droneApprovalText === "Accepted" || droneApprovalText === "Disabled Account" || droneApprovalText === "-" || (drone.operator && drone.operator.length > 0)) && (
                            <>
                              {droneApprovalText === "Accepted" || (drone.operator && drone.operator.length > 0) ? (
                                /* ikon BAN */
                                <button disabled className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-600 cursor-not-allowed" title="Perangkat sedang aktif digunakan dan tidak dapat dihapus">
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                /* ikon DELETE */
                                <button onClick={() => { setCurrentDrone(drone); setIsDeleteModalOpen(true); }} disabled={isSubmitting} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50" title="Hapus Permanen">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (<tr><td colSpan={8} className="px-6 py-6 text-center text-xs text-[#6A717F]">Tidak ada perangkat yang sesuai dengan filter/pencarian Anda.</td></tr>)}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        {!isLoading && filteredDrones.length > 0 && (
          <div className="shrink-0 flex items-center justify-between px-3.5 py-1.5 border-t border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-[#16161a]">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] dark:border-zinc-800 rounded-lg text-[#5B6068] hover:text-[#191919] disabled:opacity-50 transition-colors">← Prev</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => handlePageChange(page)} className={`w-6 h-6 text-xs font-bold rounded-md transition-all ${currentPage === page ? "bg-[#84994F] text-white shadow-sm" : "text-[#5B6068] hover:bg-gray-100 dark:hover:bg-zinc-800"}`}>{page}</button>
              ))}
            </div>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] dark:border-zinc-800 rounded-lg text-[#5B6068] hover:text-[#191919] disabled:opacity-50 transition-colors">Next →</button>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH DRONE */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161a] border border-[#E5E7EB] dark:border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-[#6A717F] hover:text-[#191919]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#191919] dark:text-white">
                  Tambah Drone Baru
                </h2>
              </div>

              <div className="block text-xs font-bold uppercase tracking-wider text-[#6A717F] mb-1.5">
                <div>Sistem akan membuat drone baru secara otomatis.</div>
                <div>Data seperti ID dan MAC Address akan dibuat oleh sistem.</div>
                <br />
                <div>Apakah anda yakin ingin menambahkan drone baru?</div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E5E7EB] dark:border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#84994F] hover:bg-[#e65c00] transition-colors disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                      : "Generate Drone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* MODAL LIHAT PENGGUNA */}
      {isUserModalOpen && currentDrone && currentDrone.operator && currentDrone.operator.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className=" bg-white dark:bg-[#16161a] border border-[#E5E7EB] dark:border-zinc-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex w-full justify-between pb-8">
              <div className="">
                <h2 className="text-lg font-bold text-[#191919] dark:text-white">Pengguna Terkait</h2>
              </div>
              <button
                onClick={() => {setIsUserModalOpen(false); setCurrentDrone(null)}}
                className="text-[#6A717F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {currentDrone.operator.map((op) => (
              <ul key={op.id} className="text-center px-20 mb-5">
                <li className="list-disc">
                  <span className="block font-bold leading-tight truncate w-full">
                    {op.name || "Tanpa Nama"}
                  </span>
                  <span className="block text-[11px] leading-tight font-normal text-[#5B6068] dark:text-zinc-400 truncate w-full">
                    {op.email}
                  </span>
                </li>
              </ul>
            ))}
          </div>
        </div>
      )}
  
      {/* MODAL KONFIRMASI DELETE */}
      {isDeleteModalOpen && currentDrone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161a] border border-[#E5E7EB] dark:border-zinc-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h2 className="text-lg font-bold text-red-600 mb-2">Hapus Perangkat?</h2>
            <p className="text-sm text-[#5B6068] dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus perangkat <span className="font-semibold text-[#191919] dark:text-white">{currentDrone.name || currentDrone.id}</span> secara permanen dari sistem?
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">Batal</button>
              <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">{isSubmitting ? "Menghapus..." : "Hapus Permanen"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}