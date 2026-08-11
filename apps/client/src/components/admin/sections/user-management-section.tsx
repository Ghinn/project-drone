"use client";
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  role: 'Petani' | 'Teknisi' | 'Admin';
  email: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_USERS: User[] = [
  { id: 'U-001', name: 'Budi Santoso', role: 'Petani', email: 'budi@gmail.com', status: 'Active' },
  { id: 'U-002', name: 'Rangga Dirgantara', role: 'Teknisi', email: 'rangga.ops@dreampalm.com', status: 'Active' },
  { id: 'U-003', name: 'Siti Aminah', role: 'Petani', email: 'siti.aminah@gmail.com', status: 'Active' },
  { id: 'U-004', name: 'Danu Kusuma', role: 'Teknisi', email: 'danu.k@dreampalm.com', status: 'Active' },
  { id: 'U-005', name: 'Master Admin', role: 'Admin', email: 'admin@drone.research.ac.id', status: 'Active' },
];

export default function UserManagementSection() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active User states for Edit/Delete
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Petani' as User['role'],
    status: 'Active' as User['status']
  });
  
  const [errors, setErrors] = useState({ name: '', email: '' });

  // Filtered Users
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Form handlers
  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({ name: '', email: '', role: 'Petani', status: 'Active' });
    setErrors({ name: '', email: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setErrors({ name: '', email: '' });
    setIsFormModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    const tempErrors = { name: '', email: '' };

    if (!formData.name.trim()) {
      tempErrors.name = 'Nama lengkap wajib diisi';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Alamat email wajib diisi';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (currentUser) {
      // Edit User
      setUsers(prev => 
        prev.map(u => u.id === currentUser.id ? { ...u, ...formData } : u)
      );
    } else {
      // Add User
      const lastIdNum = parseInt(users[users.length - 1]?.id.split('-')[1] || '0');
      const newId = `U-${String(lastIdNum + 1).padStart(3, '0')}`;
      const newUser: User = {
        id: newId,
        ...formData
      };
      setUsers(prev => [...prev, newUser]);
    }
    setIsFormModalOpen(false);
  };

  // Delete handlers
  const openDeleteModal = (user: User) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (currentUser) {
      setUsers(prev => prev.filter(u => u.id !== currentUser.id));
      setIsDeleteModalOpen(false);
      setCurrentUser(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun Petani, Teknisi, dan Hak Akses Sistem.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-white shadow-sm hover:shadow-md transition-all duration-200" 
          style={{ background: '#84994F' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </button>
      </div>

      {/* Control Panel (Search) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text"
            placeholder="Cari berdasarkan nama, email, atau role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#16161a] text-sm text-gray-900 dark:text-white outline-none focus:border-[#84994F] dark:focus:border-[#84994F] transition-all"
          />
        </div>
      </div>

      {/* User Table Card */}
      <div className="bg-white dark:bg-[#16161a] rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-800/20 border-b border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Nama & Email</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/40">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-zinc-400">{user.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold
                        ${user.role === 'Petani' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' : 
                          user.role === 'Teknisi' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400' : 
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold
                        ${user.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-gray-50 text-gray-500 dark:bg-zinc-800/30 dark:text-zinc-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="text-xs font-semibold px-3 py-1.5 rounded border border-transparent text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    Tidak ada pengguna yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#16161a] border dark:border-zinc-800 w-full max-w-md p-6 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {currentUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h2>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Contoh: Ahmad Hidayat"
                  className={`w-full px-3.5 py-2 border rounded-md bg-white dark:bg-[#111115] text-sm text-gray-900 dark:text-white outline-none transition-colors
                    ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#84994F]'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Alamat Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: ahmad@gmail.com"
                  className={`w-full px-3.5 py-2 border rounded-md bg-white dark:bg-[#111115] text-sm text-gray-900 dark:text-white outline-none transition-colors
                    ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#84994F]'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Role / Peran</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-sm text-gray-950 dark:text-white outline-none focus:border-[#84994F]"
                  >
                    <option value="Petani">Petani</option>
                    <option value="Teknisi">Teknisi</option>
                    <option value="Admin">Admin (Super)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Status Akses</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#111115] text-sm text-gray-955 dark:text-white outline-none focus:border-[#84994F]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t dark:border-zinc-800 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded text-sm font-semibold border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: '#84994F' }}
                >
                  {currentUser ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#16161a] border dark:border-zinc-800 w-full max-w-sm p-6 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-lg font-bold">Hapus Pengguna?</h2>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-gray-800 dark:text-white">{currentUser.name}</span> ({currentUser.email})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3 border-t dark:border-zinc-800 pt-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded text-sm font-semibold border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}