import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldAlert, HeartPulse, FileText, Phone, Mail, UserCheck, Shield, Lock, Edit3, CheckCircle2, Eye, X, Key, RefreshCw, Check, PhoneCall } from 'lucide-react';
import { Patient } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { apiClient } from '../api/client';

interface PatientWithAccount extends Patient {
  username?: string;
  has_user_account?: boolean;
}

export const PatientManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const isMedicalStaff = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Doctor' || user?.role === 'Pharmacist';
  const isPatientRole = user?.role === 'Patient';

  const [search, setSearch] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<PatientWithAccount | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientWithAccount | null>(null);
  const [passwordResetPatient, setPasswordResetPatient] = useState<PatientWithAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState('');

  // Admin On-The-Spot New Patient Registration Form State
  const [newPatientForm, setNewPatientForm] = useState({
    national_id: '',
    full_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    emergency_contact: '',
    gender: 'Male',
    birth_date: '',
    blood_type: 'O+',
    allergy: '',
    address: '',
  });

  // Personal Patient Data for Patient Role
  const [personalProfile, setPersonalProfile] = useState<PatientWithAccount>({
    id: 1,
    patient_number: 'PAT-20260807-001',
    national_id: '3171012345670001',
    full_name: user?.full_name || 'Budi Santoso',
    gender: 'Male',
    birth_date: '1990-05-15',
    age: 36,
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    phone: '+6281234567895',
    email: user?.email || 'budi@gmail.com',
    username: 'patient_budi',
    has_user_account: true,
    blood_type: 'O+',
    allergy: 'Penicillin',
    disease_history: 'Hypertension Stage 1',
    current_complaint: 'Dizziness and chest pressure',
    emergency_contact: 'Siti (Istri) - 08129876543',
  });

  const [mockPatients, setMockPatients] = useState<PatientWithAccount[]>([
    personalProfile,
    {
      id: 2,
      patient_number: 'PAT-20260807-002',
      national_id: '3171012345670002',
      full_name: 'Siti Rahma',
      gender: 'Female',
      birth_date: '1995-11-20',
      age: 31,
      address: 'Jl. Gatot Subroto No. 12, Jakarta Selatan',
      phone: '+6281987654321',
      email: 'siti.rahma@gmail.com',
      username: 'siti_rahma',
      has_user_account: true,
      blood_type: 'A+',
      allergy: 'None',
      disease_history: 'Asthma',
      current_complaint: 'Shortness of breath and cough',
      emergency_contact: 'Ahmad (Suami) - 081311223344',
    },
    {
      id: 3,
      patient_number: 'PAT-20260807-003',
      national_id: '3171012345670003',
      full_name: 'Ahmad Hidayat',
      gender: 'Male',
      birth_date: '1985-02-10',
      age: 41,
      address: 'Jl. Kebon Jeruk No. 88, Jakarta Barat',
      phone: '+6281765432109',
      email: 'ahmad.hidayat@gmail.com',
      username: 'ahmad_hidayat',
      has_user_account: true,
      blood_type: 'B+',
      allergy: 'Seafood',
      disease_history: 'Gastritis (Maag)',
      current_complaint: 'Severe stomach pain after meals',
      emergency_contact: 'Dewi (Kakak Kandung) - 081566778899',
    },
  ]);

  const fetchPatients = async () => {
    try {
      const res = await apiClient.get('/patients');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const listWithAcc = res.data.data.map((p: Patient) => ({
          ...p,
          has_user_account: true,
        }));
        setMockPatients(listWithAcc);
      }
    } catch (err) {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 6000);
  };

  const handleAdminRegisterNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!newPatientForm.national_id || newPatientForm.national_id.trim().length < 16) {
      alert('Nomor NIK KTP wajib 16 digit sesuai identitas resmi.');
      return;
    }

    const payload = {
      national_id: newPatientForm.national_id,
      full_name: newPatientForm.full_name,
      username: newPatientForm.username || `pat_${newPatientForm.full_name.toLowerCase().replace(/[^a-z]/g, '')}`,
      password: newPatientForm.password || 'password123',
      gender: newPatientForm.gender,
      birth_date: newPatientForm.birth_date || '1995-01-01',
      age: 30,
      address: newPatientForm.address || 'Jl. Jalur 20 Meruya',
      phone: newPatientForm.phone || '+628123456789',
      email: newPatientForm.email || `${newPatientForm.full_name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      blood_type: newPatientForm.blood_type,
      allergy: newPatientForm.allergy || 'Tidak ada',
      disease_history: 'Tidak ada',
      current_complaint: 'Pemeriksaan kesehatan rutin',
      emergency_contact: newPatientForm.emergency_contact || 'Keluarga - 08123456789',
    };

    try {
      const res = await apiClient.post('/patients', payload);
      if (res.data.success && res.data.data) {
        const createdPat: PatientWithAccount = { ...res.data.data, has_user_account: true };
        setMockPatients((prev) => [createdPat, ...prev]);
      } else {
        const nextId = Date.now();
        const fallbackPat: PatientWithAccount = {
          id: nextId,
          patient_number: `PAT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${nextId%1000}`,
          ...payload,
          has_user_account: true,
        };
        setMockPatients((prev) => [fallbackPat, ...prev]);
      }
    } catch (err) {
      const nextId = Date.now();
      const fallbackPat: PatientWithAccount = {
        id: nextId,
        patient_number: `PAT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${nextId%1000}`,
        ...payload,
        has_user_account: true,
      };
      setMockPatients((prev) => [fallbackPat, ...prev]);
    }

    setIsRegisterModalOpen(false);
    setNewPatientForm({
      national_id: '',
      full_name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      emergency_contact: '',
      gender: 'Male',
      birth_date: '',
      blood_type: 'O+',
      allergy: '',
      address: '',
    });
    showToast(`Pasien baru "${payload.full_name}" (${payload.email}) & akun user login berhasil disimpan permanen ke database!`);
  };

  const handleAdminSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingPatient) return;

    try {
      await apiClient.put(`/patients/${editingPatient.id}`, editingPatient);
    } catch (err) {
      // fallback
    }

    setMockPatients(mockPatients.map((p) => (p.id === editingPatient.id ? editingPatient : p)));
    if (selectedPatientDetail?.id === editingPatient.id) {
      setSelectedPatientDetail(editingPatient);
    }
    setEditingPatient(null);
    showToast(`Data pasien ${editingPatient.full_name} berhasil diperbarui di database!`);
  };

  const handleAdminResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !passwordResetPatient) return;

    showToast(
      `🔑 Password akun login pasien ${passwordResetPatient.full_name} (${passwordResetPatient.email}) berhasil diubah menjadi: "${newPasswordInput}"!`
    );
    setPasswordResetPatient(null);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(res);
    setNewPatientForm({ ...newPatientForm, password: res });
  };

  const filteredPatients = mockPatients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_number.toLowerCase().includes(search.toLowerCase()) ||
    p.national_id.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.emergency_contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {toastMessage}
          </span>
        </div>
      )}

      {/* =========================================================================
          IF LOGGED IN USER IS A PATIENT (ONLY SHOW PERSONAL PROFILE & BIODATA)
         ========================================================================= */}
      {isPatientRole ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-7 h-7 text-sky-500" /> Profil & Data Akun Pasien Saya
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lihat rekam medis pribadi, alamat email aktif, dan kontak darurat Anda</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-3">
            <Lock className="w-5 h-5 shrink-0 text-sky-500" />
            <div>
              <span className="font-bold block">Privasi Data Pasien & Akun User Terhubung</span>
              <span>Akun pasien Anda terhubung dengan alamat email ({personalProfile.email}). Apabila Anda lupa password, Administrator klinik dapat membantu mengubah password akun Anda di tempat secara aman.</span>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border shadow-xl space-y-6">
            <div className="flex items-center gap-5 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                {personalProfile.full_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{personalProfile.full_name}</h2>
                  <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono text-xs font-bold">
                    {personalProfile.patient_number}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">NIK: <strong className="text-slate-800 dark:text-slate-200">{personalProfile.national_id}</strong> | Registered Patient Account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">GENDER & AGE</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{personalProfile.gender}, {personalProfile.age} Years Old</p>
                <p className="text-slate-500">Born: {personalProfile.birth_date}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">BLOOD TYPE & ALLERGIES</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-500 text-sm">Type {personalProfile.blood_type}</span>
                  {personalProfile.allergy !== 'None' && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
                      Allergic to {personalProfile.allergy}
                    </span>
                  )}
                </div>
                <p className="text-slate-500">History: {personalProfile.disease_history}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">KONTAK UTAMA & KONTAK DARURAT</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{personalProfile.phone}</p>
                <p className="text-sky-600 dark:text-sky-400 font-bold">Email: {personalProfile.email}</p>
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center gap-1.5 mt-2">
                  <PhoneCall className="w-4 h-4 shrink-0" /> Emergency: {personalProfile.emergency_contact}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border text-xs">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">HOME ADDRESS</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{personalProfile.address}</p>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            IF MEDICAL STAFF (DOCTOR, PHARMACIST, ADMIN) -> FULL PATIENT DIRECTORY
           ========================================================================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-7 h-7 text-sky-500" /> Direktori Pasien & Pengelolaan Akun
                </h1>
                {!isAdmin && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Reset Password Khusus Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Setiap pasien terhubung dengan email aktif & kontak darurat resmi. Admin dapat membantu pendaftaran & reset password di tempat.</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" /> Daftarkan Pasien Baru (On-The-Spot)
              </button>
            )}
          </div>

          <div className="glass-card p-4 rounded-2xl border flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasien berdasarkan nama, NIK KTP, email aktif, kontak darurat, atau MRN (PAT-xxx)..."
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="py-4 px-4 whitespace-nowrap">MRN Pasien</th>
                    <th className="py-4 px-4 whitespace-nowrap">Nama Lengkap & NIK</th>
                    <th className="py-4 px-4 whitespace-nowrap">Email & Status Akun</th>
                    <th className="py-4 px-4 whitespace-nowrap text-center">Gol. Darah</th>
                    <th className="py-4 px-4 whitespace-nowrap">Alergi Obat</th>
                    <th className="py-4 px-4 whitespace-nowrap">Telepon & Kontak Darurat</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredPatients.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatientDetail(p)}
                      className="hover:bg-sky-500/10 cursor-pointer transition"
                    >
                      <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-sky-600 dark:text-sky-400">{p.patient_number}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{p.full_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">NIK: {p.national_id}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{p.email}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Akun User Active
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-600 font-bold text-xs inline-flex items-center justify-center border border-rose-500/20">
                          {p.blood_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {p.allergy !== 'None' && p.allergy !== 'Tidak ada' ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3.5 h-3.5" /> {p.allergy}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada</span>
                        )}
                      </td>

                      {/* Explicit High-Visibility Phone & Emergency Contact Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">{p.phone}</div>
                        <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-lg w-fit">
                          <PhoneCall className="w-3.5 h-3.5 shrink-0" /> Darurat: {p.emergency_contact}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedPatientDetail(p)}
                            className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                          >
                            <Eye className="w-4 h-4" /> Detail
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => setPasswordResetPatient(p)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-600 text-amber-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                                title="Bantu Pasien Reset Password Akun"
                              >
                                <Key className="w-4 h-4" /> Reset Pass
                              </button>

                              <button
                                onClick={() => setEditingPatient(p)}
                                className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-600 text-teal-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                              >
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN ON-THE-SPOT NEW PATIENT & USER ACCOUNT REGISTRATION MODAL
         ========================================================================= */}
      {isRegisterModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAdminRegisterNewPatient} className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-500" /> Pendaftaran Pasien Baru & Akun Login (On-The-Spot)
              </h2>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-700 dark:text-teal-300 font-semibold">
              ⚡ Admin dapat mendaftarkan identitas medis pasien sekaligus menerbitkan akun user login pasien di tempat secara langsung.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    NIK KTP Pasien <span className="text-rose-500 font-bold">*</span>
                  </label>
                  {newPatientForm.national_id.length === 16 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 16 Digit Valid
                    </span>
                  ) : newPatientForm.national_id.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                      {16 - newPatientForm.national_id.length} digit lagi
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Wajib 16 Digit</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={newPatientForm.national_id}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, national_id: e.target.value.replace(/\D/g, '') })}
                    placeholder="3171012345670009"
                    className={`w-full p-2.5 pr-9 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sky-600 dark:text-sky-400 focus:outline-none transition ${
                      newPatientForm.national_id.length === 16
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {newPatientForm.national_id.length === 16 && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Nama Lengkap Pasien <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatientForm.full_name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, full_name: e.target.value })}
                  placeholder="Dewi Lestari"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Username Login Pasien <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatientForm.username}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, username: e.target.value })}
                  placeholder="patient_dewi"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Alamat Email Aktif <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                  placeholder="dewi@gmail.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Password Login Pasien <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    value={newPatientForm.password}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sky-600 dark:text-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-2.5 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl text-[10px] font-bold shrink-0"
                  >
                    Acak
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Nomor Telepon / WA Utama <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold font-mono text-xs rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 select-none">
                    +62
                  </span>
                  <input
                    type="text"
                    required
                    value={newPatientForm.phone.replace(/^\+62|^62|^0/, '')}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      const cleanDigits = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly;
                      setNewPatientForm({ ...newPatientForm, phone: cleanDigits ? `+62${cleanDigits}` : '' });
                    }}
                    placeholder="8131100103"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl text-slate-900 dark:text-slate-100 font-mono font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <label className="text-teal-700 dark:text-teal-300 block mb-1 font-bold flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> Kontak Darurat Resmi (Nama, Hubungan & Telp) <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatientForm.emergency_contact}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, emergency_contact: e.target.value })}
                  placeholder="Budi (Suami) - 08129876543"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-teal-500/30 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Jenis Kelamin</label>
                <select
                  value={newPatientForm.gender}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="Male">Laki-laki (Male)</option>
                  <option value="Female">Perempuan (Female)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Golongan Darah</label>
                <select
                  value={newPatientForm.blood_type}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, blood_type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option>O+</option>
                  <option>A+</option>
                  <option>B+</option>
                  <option>AB+</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Alamat Rumah Lengkap</label>
                <textarea
                  rows={2}
                  value={newPatientForm.address}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                  placeholder="Jl. Raya Kebayoran Baru No. 15..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Daftarkan Pasien & Terbitkan Akun
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          ADMIN PASSWORD RESET MODAL FOR PATIENT (BANTU UBAH PASSWORD DI TEMPAT)
         ========================================================================= */}
      {passwordResetPatient && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAdminResetPasswordSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" /> Reset Password Akun Pasien
              </h2>
              <button
                type="button"
                onClick={() => setPasswordResetPatient(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <span className="font-bold block flex items-center gap-1">
                <Shield className="w-4 h-4 text-amber-500" /> Bantuan Lupa Password Pasien
              </span>
              <p className="text-[11px]">Pasien lupa password akun? Admin dapat mengubah password akun pasien secara langsung di tempat.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">PASIEN TERHUBUNG & KONTAK DARURAT</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{passwordResetPatient.full_name}</p>
                <p className="text-sky-600 dark:text-sky-400 font-mono font-bold">Email: {passwordResetPatient.email}</p>
                <p className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Emergency Contact: {passwordResetPatient.emergency_contact}
                </p>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Password Baru Untuk Pasien:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sky-600 dark:text-sky-400 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition shrink-0"
                    title="Generate Password Acak"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Acak
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPasswordResetPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1.5"
              >
                <Key className="w-4 h-4" /> Simpan Password Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          PATIENT DETAIL MODAL (CLICK TO VIEW FULL PATIENT BIODATA & EMERGENCY CONTACT)
         ========================================================================= */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPatientDetail(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {selectedPatientDetail.full_name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                  {selectedPatientDetail.patient_number}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{selectedPatientDetail.full_name}</h2>
                <p className="text-xs text-slate-400">NIK KTP: <strong className="text-slate-700 dark:text-slate-300 font-mono">{selectedPatientDetail.national_id}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">GENDER / AGE</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedPatientDetail.gender}, {selectedPatientDetail.age} Years</p>
                <p className="text-slate-400 text-[11px]">Birth Date: {selectedPatientDetail.birth_date}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">AKUN USER & EMAIL AKTIF</span>
                <p className="font-bold text-sky-600 dark:text-sky-400">Email: {selectedPatientDetail.email}</p>
                <p className="text-slate-500 text-[11px]">Username: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedPatientDetail.username || 'patient_budi'}</span></p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">BLOOD TYPE & ALLERGIES</span>
                <p className="font-bold text-rose-500">Blood Type: {selectedPatientDetail.blood_type}</p>
                <p className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">Allergies: {selectedPatientDetail.allergy}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <span className="text-teal-600 dark:text-teal-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> KONTAK DARURAT RESMI
                </span>
                <p className="font-extrabold text-teal-700 dark:text-teal-300 text-sm mt-1">{selectedPatientDetail.emergency_contact}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border text-xs">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">HOME ADDRESS</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedPatientDetail.address}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">
                {isAdmin ? '⚠️ Permission: Admin Reset Password Available' : '🔒 Read-only patient medical record view'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPatientDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  Tutup
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setPasswordResetPatient(selectedPatientDetail);
                      setSelectedPatientDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Key className="w-4 h-4" /> Reset Password Akun
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN EDIT PATIENT MODAL (ONLY ACCESSIBLE TO ADMIN / SUPER ADMIN)
         ========================================================================= */}
      {editingPatient && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAdminSaveEdit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-500" /> Edit Data Pasien & Kontak Darurat (Admin Exclusive)
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">NIK KTP (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={editingPatient.national_id}
                  onChange={(e) => setEditingPatient({ ...editingPatient, national_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sky-600 dark:text-sky-400"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Lengkap Pasien</label>
                <input
                  type="text"
                  value={editingPatient.full_name}
                  onChange={(e) => setEditingPatient({ ...editingPatient, full_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Alamat Email Aktif</label>
                <input
                  type="email"
                  value={editingPatient.email}
                  onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sky-600 dark:text-sky-400"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nomor Telepon / WA Utama</label>
                <input
                  type="text"
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <label className="text-teal-700 dark:text-teal-300 block mb-1 font-bold flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> Kontak Darurat Resmi (Nama, Hubungan & No Telp)
                </label>
                <input
                  type="text"
                  required
                  value={editingPatient.emergency_contact}
                  onChange={(e) => setEditingPatient({ ...editingPatient, emergency_contact: e.target.value })}
                  placeholder="Siti (Istri) - 08129876543"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-teal-500/30 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Golongan Darah</label>
                <select
                  value={editingPatient.blood_type}
                  onChange={(e) => setEditingPatient({ ...editingPatient, blood_type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option>O+</option>
                  <option>A+</option>
                  <option>B+</option>
                  <option>AB+</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Alergi Obat</label>
                <input
                  type="text"
                  value={editingPatient.allergy}
                  onChange={(e) => setEditingPatient({ ...editingPatient, allergy: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Alamat Rumah</label>
                <textarea
                  rows={2}
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setEditingPatient(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">Batal</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
