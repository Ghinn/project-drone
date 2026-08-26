"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  UserPlus,
  Edit3,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Mail,
  ChevronDown,
} from "lucide-react";
import SearchableDropdown from "@/components/searchable-dropdown";
import FilterDrone from "../userManagementComponents/filter-drone";
import SortDateDropdown, {
  SortOrder,
} from "../userManagementComponents/sort-date";

// Tipe Role sesuai Schema Prisma
type Role = "GUEST" | "FARMER" | "OPERATOR" | "ADMIN";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: ApprovalStatus;
  createdAt: string;
  emailVerified?: string | null;
}

interface Drone {
  id: string;
  name: string;
}

export default function UserManagementSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | Role>("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "FARMER" as Role,
    status: "APPROVED" as ApprovalStatus,
  });

  const [errors, setErrors] = useState({ name: "", email: "" });
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [userDrones, setUserDrones] = useState<Record<string, string>>({});
  const [selectedDroneFilter, setSelectedDroneFilter] = useState<string | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Fetch Real Data dari API Backend
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users?limit=100", {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();
      console.log(json.data);
      const droneList = [
        { id: "1", name: "DJI Mavic 3 Enterprise" },
        { id: "2", name: "DJI Matrice 300 RTK" },
        { id: "3", name: "DJI Phantom 4 RTK" },
        { id: "4", name: "DJI Inspire 3" },
        { id: "5", name: "Autel EVO Max 4T" },
      ];
      if (res.ok && json.data) {
        setUsers(json.data);
        setDrones(droneList);

        // buat dummy drone per user
        const initialUserDrones: Record<string, string> = {};

        json.data.forEach((user: User, index: number) => {
          initialUserDrones[user.id] = droneList[index % droneList.length].id;
        });

        setUserDrones(initialUserDrones);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Perhitungan Statistik Kartu (Summary Cards)
  const stats = useMemo(() => {
    return {
      total: users.length,
      farmer: users.filter((u) => u.role === "FARMER").length,
      operator: users.filter((u) => u.role === "OPERATOR").length,
      admin: users.filter((u) => u.role === "ADMIN").length,
    };
  }, [users]);

  // Filter berdasarkan Tab & Search Query
  const filteredUsers = useMemo(() => {
    const result = users.filter((user) => {
      const matchesTab = activeTab === "ALL" || user.role === activeTab;

      const matchesSearch =
        (user.name &&
          user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDrone =
        !selectedDroneFilter || userDrones[user.id] === selectedDroneFilter;

      return matchesTab && matchesSearch && matchesDrone;
    });

    return [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [
    users,
    activeTab,
    searchQuery,
    selectedDroneFilter,
    userDrones,
    sortOrder,
  ]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handler Form Add / Edit
  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({ name: "", email: "", role: "FARMER", status: "PENDING" });
    setErrors({ name: "", email: "" });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setErrors({ name: "", email: "" });
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    let isValid = true;
    const tempErrors = { name: "", email: "" };

    if (!formData.name.trim()) {
      tempErrors.name = "Nama lengkap wajib diisi";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      tempErrors.email = "Format email tidak valid";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      if (currentUser) {
        // UPDATE USER
        const res = await fetch(`/api/admin/users/${currentUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Gagal memperbarui pengguna.");

        setNotification({
          type: "success",
          message: "Pengguna berhasil diperbarui.",
        });
      } else {
        // CREATE USER (Akan otomatis memicu email undangan)
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Gagal menambahkan pengguna.");

        setNotification({
          type: "success",
          message:
            "Pengguna baru berhasil ditambahkan. Tautan pembuatan sandi telah dikirim!",
        });
      }

      setIsFormModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, email: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Ubah Status
  const handleStatusChange = async (
    userId: string,
    newStatus: ApprovalStatus,
  ) => {
    try {
      // Optimistic Update UI
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
      );

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah status.");
      }
      setNotification({
        type: "success",
        message: `Status berhasil diubah menjadi ${newStatus === "APPROVED" ? "ACTIVE" : "INACTIVE"}`,
      });
    } catch (error: any) {
      setNotification({ type: "error", message: error.message });
      fetchUsers(); // Revert back if fail
    }
  };

  // Handler Delete
  const handleDeleteConfirm = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus pengguna");

      setNotification({
        type: "success",
        message: "Pengguna berhasil dihapus permanen.",
      });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDroneChange = (userId: string, droneId: string) => {
    setUserDrones((prev) => ({
      ...prev,
      [userId]: droneId,
    }));
  };

  const handleSort = () => {
    if (sortOrder == "oldest") {
      setSortOrder("newest");
    } else {
      setSortOrder("oldest");
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    const addZero = (number: string | number | Date) =>
      String(number).padStart(2, "0");

    const day = addZero(date.getDate());
    const month = addZero(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = addZero(date.getHours());
    const minutes = addZero(date.getMinutes());
    const seconds = addZero(date.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="h-full flex flex-col gap-2.5 animate-in fade-in duration-300 min-h-0">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white leading-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-xs text-[#5B6068] mt-0.5">
            Kelola akun dan otorisasi hak akses platform pemantauan.
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

      {/* STATS CARDS (Mengacu pada Gambar Pengguna.png) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">
            Semua Pengguna
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-[#84994F]">akun</span>
          </div>
          <p className="text-[11px] text-[#6A717F] mt-0.5">
            Total terdaftar di sistem
          </p>
        </div>

        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">
            Farmer
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">
              {stats.farmer}
            </span>
            <span className="text-xs font-medium text-[#84994F]">akun</span>
          </div>
          <p className="text-[11px] text-[#6A717F] mt-0.5">
            Petani aktif lapangan
          </p>
        </div>

        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">
            Operator
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">
              {stats.operator}
            </span>
            <span className="text-xs font-medium text-[#84994F]">akun</span>
          </div>
          <p className="text-[11px] text-[#6A717F] mt-0.5">
            Pengendali stasiun
          </p>
        </div>

        <div className="bg-white dark:bg-[#16161a] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold text-[#191919] dark:text-zinc-300">
            Admin
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold text-[#191919] dark:text-white">
              {stats.admin}
            </span>
            <span className="text-xs font-medium text-[#84994F]">akun</span>
          </div>
          <p className="text-[11px] text-[#6A717F] mt-0.5">
            Administrator sistem
          </p>
        </div>
      </div>

      {/* FILTER NAVBAR & ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 shrink-0">
        {/* TABS (Semua Pengguna, Farmer, Operator, Admin) */}
        <div className="flex items-center gap-1 p-1 bg-[#F7F9FB] dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl overflow-x-auto">
          {(["ALL", "FARMER", "OPERATOR", "ADMIN"] as const).map((tab) => {
            const labels: Record<string, string> = {
              ALL: `Semua (${stats.total})`,
              FARMER: "Farmer",
              OPERATOR: "Operator",
              ADMIN: "Admin",
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all
                  ${
                    isActive
                      ? "bg-[#84994F] text-white shadow-sm"
                      : "text-[#5B6068] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white"
                  }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* SEARCH & ACTION TOOLS */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A717F]" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl bg-white dark:bg-[#16161a] text-xs text-[#191919] dark:text-white outline-none focus:border-[#84994F] transition-all"
            />
          </div>

          <FilterDrone
            drones={drones}
            value={selectedDroneFilter}
            onChange={setSelectedDroneFilter}
          />
          {/* <SortDateDropdown
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value);
              setCurrentPage(1);
            }}
          /> */}
          <button
            type="button"
            onClick={() => handleSort()}
            className={`p-2.5 border rounded-xl bg-white dark:bg-[#16161a] transition-color`}
            title="Urutkan tanggal masuk"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          {/* <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#84994F] hover:bg-[#e65c00] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah</span>
          </button> */}
        </div>
      </div>

      {/* USER TABLE CARD */}
      <div className="z-0 flex-1 min-h-0 flex flex-col justify-between bg-white dark:bg-[#16161a] rounded-xl border border-[#E5E7EB] dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#84994F] text-white">
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  Tanggal Bergabung
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  Drone
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-xs text-[#6A717F]"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#84994F]" />
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  const rowNum = (currentPage - 1) * itemsPerPage + index + 1;
                  const shortId = user.id.slice(0, 8).toUpperCase();
                  const joinDate = formatDate(user.createdAt);

                  // Logika Disabled
                  const isUserVerified = !!user.emailVerified;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-xs font-semibold text-[#191919] dark:text-zinc-300">
                        {rowNum}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-mono text-[#6A717F]">
                        #{shortId}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#191919] dark:text-white">
                        <span className="block font-bold leading-tight truncate max-w-37.5">
                          {user.name || "Tanpa Nama"}
                        </span>
                        <span className="block text-[11px] leading-tight font-normal text-[#5B6068] dark:text-zinc-400 truncate max-w-37.5">
                          {user.email}
                        </span>
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#191919] dark:text-zinc-200">
                          <span
                            className={`w-2 h-2 rounded-full 
                            ${
                              user.role === "ADMIN"
                                ? "bg-red-500"
                                : user.role === "OPERATOR"
                                  ? "bg-purple-500"
                                  : user.role === "FARMER"
                                    ? "bg-emerald-500"
                                    : "bg-gray-400"
                            }`}
                          />
                          {user.role}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-xs text-[#5B6068] dark:text-zinc-400 whitespace-nowrap">
                        {joinDate}
                      </td>

                      <td className="px-3 py-2.5 text-xs min-w-35">
                        <SearchableDropdown
                          options={drones}
                          value={userDrones[user.id] ?? null}
                          onChange={(droneId) => {
                            handleDroneChange(user.id, droneId);
                          }}
                          placeholder="Pilih Drone"
                          searchPlaceholder="Cari drone..."
                          getOptionLabel={(drone) => drone.name}
                          getOptionValue={(drone) => drone.id}
                        />
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="relative inline-block">
                          <select
                            value={user.status}
                            disabled={!isUserVerified}
                            onChange={(e) =>
                              handleStatusChange(
                                user.id,
                                e.target.value as ApprovalStatus,
                              )
                            }
                            className={`appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-bold border transition-colors outline-none
                              ${
                                !isUserVerified
                                  ? "bg-gray-100 border-gray-200 text-[#6A717F] cursor-not-allowed opacity-70 dark:bg-[#202024] dark:border-zinc-800 dark:text-zinc-500"
                                  : user.status === "APPROVED"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                              }`}
                          >
                            <option value="APPROVED">ACTIVE</option>
                            <option value="PENDING">INACTIVE</option>
                          </select>
                          <ChevronDown
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none
                            ${
                              !isUserVerified
                                ? "text-gray-400 dark:text-zinc-600"
                                : user.status === "APPROVED"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="px-3 py-1.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 rounded-lg text-[#5B6068] hover:text-[#191919] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Hapus pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-6 text-center text-xs text-[#6A717F]"
                  >
                    Tidak ada pengguna yang sesuai dengan filter/pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="shrink-0 flex items-center justify-between px-3.5 py-1.5 border-t border-[#E5E7EB] dark:border-zinc-800 bg-white dark:bg-[#16161a]">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] dark:border-zinc-800 rounded-lg text-[#5B6068] hover:text-[#191919] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-6 h-6 text-xs font-bold rounded-md transition-all
                    ${
                      currentPage === page
                        ? "bg-[#84994F] text-white shadow-sm"
                        : "text-[#5B6068] hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-[#E5E7EB] dark:border-zinc-800 rounded-lg text-[#5B6068] hover:text-[#191919] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH & EDIT PENGGUNA */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161a] border border-[#E5E7EB] dark:border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#191919] dark:text-white">
                  {currentUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </h2>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-[#6A717F] hover:text-[#191919]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A717F] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Dio Aranda"
                  className={`w-full px-3.5 py-2.5 border rounded-xl bg-white dark:bg-[#111115] text-sm text-[#191919] dark:text-white outline-none transition-colors
                    ${errors.name ? "border-red-500" : "border-[#E5E7EB] dark:border-zinc-800 focus:border-[#84994F]"}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A717F] mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={!!currentUser}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Contoh: dioarandaa@gmail.com"
                  className={`w-full px-3.5 py-2.5 border rounded-xl bg-white dark:bg-[#111115] text-sm text-[#191919] dark:text-white outline-none transition-colors disabled:opacity-50
                    ${errors.email ? "border-red-500" : "border-[#E5E7EB] dark:border-zinc-800 focus:border-[#84994F]"}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6A717F] mb-1.5">
                  Role Akses
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as Role,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] dark:border-zinc-800 rounded-xl bg-white dark:bg-[#111115] text-sm text-[#191919] dark:text-white outline-none focus:border-[#84994F]"
                >
                  <option value="FARMER">FARMER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {!currentUser && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Pengguna akan menerima pesan di email mereka untuk mengatur
                    kata sandi sebelum bisa login ke dalam platform.
                  </span>
                </div>
              )}

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
                    : currentUser
                      ? "Simpan Perubahan"
                      : "Kirim Undangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161a] border border-[#E5E7EB] dark:border-zinc-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <h2 className="text-lg font-bold">Hapus Pengguna?</h2>
            </div>

            <p className="text-sm text-[#5B6068] dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun{" "}
              <span className="font-semibold text-[#191919] dark:text-white">
                {currentUser.name || currentUser.email}
              </span>
              ? Tindakan ini akan menghapus aksesnya secara permanen dari
              sistem.
            </p>

            <div className="flex justify-end gap-3 border-t border-[#E5E7EB] dark:border-zinc-800 pt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#E5E7EB] dark:border-zinc-800 text-[#5B6068] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
