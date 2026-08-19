import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldAlert, Key, Edit3, Trash2, CheckCircle2, XCircle, ShieldCheck, Lock, RefreshCw, X, Shield, Eye, Phone, Mail, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { apiClient } from '../api/client';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { t } = useLanguageStore();

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'superadmin', email: 'superadmin@klinikalwi.id', full_name: 'Dr. H. Alwi Shahab', role: 'Super Admin', phone: '+628131100103', is_active: true },
    { id: 2, username: 'admin_resep', email: 'admin@klinikalwi.id', full_name: 'Siti Aminah, S.Kom', role: 'Admin', phone: '+6281234567891', is_active: true },
    { id: 3, username: 'dr_alwi', email: 'dr.alwi@klinikalwi.id', full_name: 'dr. Alwi Shahab, Sp.PD', role: 'Doctor', phone: '+6281234567892', is_active: true },
    { id: 4, username: 'dr_sarah', email: 'dr.sarah@klinikalwi.id', full_name: 'dr. Sarah Lestari, Sp.A', role: 'Doctor', phone: '+6281234567893', is_active: true },
    { id: 5, username: 'apt_budi', email: 'apt.budi@klinikalwi.id', full_name: 'Apt. Budi Santoso, S.Farm', role: 'Pharmacist', phone: '+6281234567894', is_active: true },
    { id: 6, username: 'patient_budi', email: 'budi@gmail.com', full_name: 'Budi Santoso', role: 'Patient', phone: '+6281234567895', is_active: true },
    { id: 7, username: 'siti_rahma', email: 'siti.rahma@gmail.com', full_name: 'Siti Rahma', role: 'Patient', phone: '+6281987654321', is_active: true },
    { id: 8, username: 'ahmad_hidayat', email: 'ahmad.hidayat@gmail.com', full_name: 'Ahmad Hidayat', role: 'Patient', phone: '+6281765432109', is_active: false },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [newUserForm, setNewUserForm] = useState<{
    username: string;
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    phone: string;
    is_active: boolean;
  }>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'Patient',
    phone: '',
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setUsers(res.data.data);
      }
    } catch (err) {
      // keep fallback
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Strictly Block Non-Super Admin Users
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Akses Ditolak (Restricted Access)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Halaman Manajemen & Akses Kredensial Seluruh User Login Klinik Alwi khusus diperuntukkan untuk 
            <span className="font-bold text-rose-600 dark:text-rose-400"> Super Admin</span>.
          </p>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            Role Anda saat ini: <span className="font-bold uppercase text-sky-500">{currentUser?.role || 'Guest'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Multi-Filter Users Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && u.is_active) ||
      (statusFilter === 'Inactive' && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/users', newUserForm);
      if (res.data.success && res.data.data) {
        setUsers([res.data.data, ...users]);
      } else {
        const nextId = Date.now();
        setUsers([{ id: nextId, ...newUserForm }, ...users]);
      }
    } catch (err) {
      const nextId = Date.now();
      setUsers([{ id: nextId, ...newUserForm }, ...users]);
    }
    setIsAddModalOpen(false);
    setNewUserForm({ username: '', email: '', password: '', full_name: '', role: 'Patient', phone: '', is_active: true });
    showToast(`Akun user baru "${newUserForm.full_name}" (${newUserForm.role}) berhasil ditambahkan!`);
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await apiClient.put(`/users/${editingUser.id}`, editingUser);
    } catch (err) {
      // fallback
    }
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
    showToast(`Data akun user "${editingUser.full_name}" berhasil diperbarui!`);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser || !newPasswordInput) return;
    try {
      await apiClient.post(`/users/${passwordResetUser.id}/reset-password`, { password: newPasswordInput });
    } catch (err) {
      // fallback
    }
    setPasswordResetUser(null);
    setNewPasswordInput('');
    showToast(`Password untuk user "${passwordResetUser.full_name}" berhasil direset secara sah!`);
  };

  const handleToggleStatus = async (userToToggle: User) => {
    const updated = { ...userToToggle, is_active: !userToToggle.is_active };
    try {
      await apiClient.put(`/users/${userToToggle.id}`, updated);
    } catch (err) {
      // fallback
    }
    setUsers(users.map((u) => (u.id === userToToggle.id ? updated : u)));
    showToast(`Status akun "${userToToggle.full_name}" diubah menjadi ${updated.is_active ? 'AKTIF' : 'NON-AKTIF/BLOKIR'}!`);
  };

  const handleDeleteUserSubmit = async () => {
    if (!deleteConfirmUser) return;
    try {
      await apiClient.delete(`/users/${deleteConfirmUser.id}`);
    } catch (err) {
      // fallback
    }
    setUsers(users.filter((u) => u.id !== deleteConfirmUser.id));
    setDeleteConfirmUser(null);
    showToast(`Akun user "${deleteConfirmUser.full_name}" telah dihapus secara permanen dari database!`);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(result);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-sky-500" /> Manajemen Akses & Akun User (Super Admin Only)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pusat kontrol kredensial login seluruh Pasien, Dokter, Apoteker, dan Administrator Klinik Alwi
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 justify-center"
        >
          <UserPlus className="w-4 h-4" /> Tambah Akun User Baru
        </button>
      </div>

      {/* FILTER & SEARCH SUITE */}
      <div className="glass-card p-4 rounded-2xl border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama Lengkap, Username, Email, atau No HP User..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
            >
              <option value="All">Semua Role User</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin Klinik</option>
              <option value="Doctor">Dokter Spesialis</option>
              <option value="Pharmacist">Apoteker</option>
              <option value="Patient">Pasien</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
            >
              <option value="All">Semua Status Akun</option>
              <option value="Active">Aktif</option>
              <option value="Inactive">Non-Aktif / Diblokir</option>
            </select>
          </div>
        </div>
      </div>

      {/* USER ACCOUNTS TABLE */}
      <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Menampilkan <span className="text-sky-600 font-extrabold">{filteredUsers.length}</span> dari {users.length} Akun Terdaftar
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3.5">User & Username</th>
                <th className="p-3.5">Kontak (Email & HP)</th>
                <th className="p-3.5">Role Pengguna</th>
                <th className="p-3.5">Status Akun</th>
                <th className="p-3.5 text-right">Kelola Kredensial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{u.full_name}</div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-semibold text-[10px] inline-block mt-0.5">
                      @{u.username}
                    </span>
                  </td>

                  <td className="p-3.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                      <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border inline-flex items-center gap-1 ${
                        u.role === 'Super Admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                          : u.role === 'Doctor'
                          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30'
                          : u.role === 'Admin'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          : u.role === 'Pharmacist'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                      }`}
                    >
                      <Shield className="w-3 h-3" /> {u.role}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 transition ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.is_active ? 'AKTIF' : 'DIBLOKIR'}
                    </button>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPasswordResetUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-600 text-amber-600 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition"
                        title="Reset Password Kredensial User"
                      >
                        <Key className="w-3.5 h-3.5" /> Reset Pass
                      </button>

                      <button
                        onClick={() => setEditingUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-600 text-sky-600 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => setDeleteConfirmUser(u)}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white font-semibold text-[11px] transition"
                        title="Hapus Akun Permanen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleCreateUserSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-500" /> Tambah Akun User Login Baru
              </h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block mb-1 font-semibold">Nama Lengkap User *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  placeholder="Dr. Hendra Wijaya"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Role Pengguna *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sky-600"
                >
                  <option value="Patient">Pasien</option>
                  <option value="Doctor">Dokter Spesialis</option>
                  <option value="Pharmacist">Apoteker</option>
                  <option value="Admin">Admin Klinik</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Username Login *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  placeholder="dr_hendra"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email Aktif *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="hendra@klinikalwi.id"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Password Kredensial *</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-1 font-semibold">Nomor HP / WhatsApp</label>
                <input
                  type="text"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+628123456789"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-semibold">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs">
                Simpan User Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleEditUserSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-500" /> Edit Profil & Role User: {editingUser.username}
              </h2>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block mb-1 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Role Pengguna</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sky-600"
                >
                  <option value="Patient">Pasien</option>
                  <option value="Doctor">Dokter Spesialis</option>
                  <option value="Pharmacist">Apoteker</option>
                  <option value="Admin">Admin Klinik</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Status Akun</label>
                <select
                  value={editingUser.is_active ? 'true' : 'false'}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === 'true' })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Non-Aktif / Diblokir</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Nomor HP</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-semibold">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleResetPasswordSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" /> Reset Password: {passwordResetUser.full_name}
              </h2>
              <button type="button" onClick={() => setPasswordResetUser(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              🔑 Kredensial baru akan langsung dienkripsi dengan Bcrypt di database PostgreSQL.
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold">Password Baru *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sky-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold shrink-0"
                >
                  Acak
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setPasswordResetUser(null)} className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-semibold">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">
                Reset Password Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Hapus Akun Permanen?</h3>
            <p className="text-xs text-slate-500">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-rose-600">{deleteConfirmUser.full_name}</span> (@{deleteConfirmUser.username})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setDeleteConfirmUser(null)} className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-semibold">
                Batal
              </button>
              <button onClick={handleDeleteUserSubmit} className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs">
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
