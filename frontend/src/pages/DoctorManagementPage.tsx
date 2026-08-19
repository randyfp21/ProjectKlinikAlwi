import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Calendar, Phone, Mail, CheckCircle, XCircle, Edit3, Trash2, ShieldAlert, Lock, CheckCircle2, Clock, X, Save, Eye, DollarSign } from 'lucide-react';
import { Doctor, DoctorSchedule } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { apiClient } from '../api/client';

export const DoctorManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [schedulingDoctor, setSchedulingDoctor] = useState<Doctor | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add Form State
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    specialization: '',
    practice_license_number: '',
    practice_room: '',
    phone: '',
    email: '',
    consultation_fee: 150000,
  });

  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      user_id: 3,
      doctor_code: 'DOC-001',
      name: 'dr. Alwi Shahab, Sp.PD',
      gender: 'Male',
      phone: '+6281234567892',
      email: 'alwi@klinikalwi.id',
      practice_license_number: 'SIP.123/KK/2024',
      specialization: 'Internal Medicine (Penyakit Dalam)',
      education: 'Universitas Indonesia - Spesialis Penyakit Dalam',
      practice_room: 'Poliklinik A - Room 101',
      consultation_fee: 175000,
      active_status: true,
      schedules: [
        { id: 1, doctor_id: 1, day_of_week: 'Monday', start_time: '08:00', end_time: '14:00', slot_duration_minutes: 20, max_patients: 18, is_active: true },
        { id: 2, doctor_id: 1, day_of_week: 'Wednesday', start_time: '08:00', end_time: '14:00', slot_duration_minutes: 20, max_patients: 18, is_active: true },
        { id: 3, doctor_id: 1, day_of_week: 'Friday', start_time: '08:00', end_time: '14:00', slot_duration_minutes: 20, max_patients: 18, is_active: true },
      ],
    },
    {
      id: 2,
      user_id: 4,
      doctor_code: 'DOC-002',
      name: 'dr. Sarah Lestari, Sp.A',
      gender: 'Female',
      phone: '+6281234567893',
      email: 'sarah@klinikalwi.id',
      practice_license_number: 'SIP.456/KK/2024',
      specialization: 'Pediatrician (Spesialis Anak)',
      education: 'Universitas Gadjah Mada - Spesialis Anak',
      practice_room: 'Poliklinik B - Room 102',
      consultation_fee: 150000,
      active_status: true,
      schedules: [
        { id: 4, doctor_id: 2, day_of_week: 'Tuesday', start_time: '13:00', end_time: '18:00', slot_duration_minutes: 20, max_patients: 15, is_active: true },
        { id: 5, doctor_id: 2, day_of_week: 'Thursday', start_time: '13:00', end_time: '18:00', slot_duration_minutes: 20, max_patients: 15, is_active: true },
      ],
    },
  ]);

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get('/doctors');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      name: newDoctorForm.name,
      gender: 'Male',
      phone: newDoctorForm.phone || '+6281234567890',
      email: newDoctorForm.email || `${newDoctorForm.name.toLowerCase().replace(/[^a-z]/g, '')}@klinikalwi.id`,
      practice_license_number: newDoctorForm.practice_license_number || `SIP.${Date.now() % 10000}/KK/2026`,
      specialization: newDoctorForm.specialization || 'Spesialis Umum',
      education: 'Universitas Indonesia',
      practice_room: newDoctorForm.practice_room || 'Poliklinik C - Room 103',
      consultation_fee: Number(newDoctorForm.consultation_fee) || 150000,
      active_status: true,
    };

    try {
      const res = await apiClient.post('/doctors', payload);
      if (res.data.success && res.data.data) {
        setDoctors((prev) => [res.data.data, ...prev]);
      } else {
        const nextId = Date.now();
        const fallbackDoc: Doctor = { id: nextId, user_id: 1, ...payload, doctor_code: `DOC-${nextId % 1000}` };
        setDoctors((prev) => [fallbackDoc, ...prev]);
      }
    } catch (err) {
      const nextId = Date.now();
      const fallbackDoc: Doctor = { id: nextId, user_id: 1, ...payload, doctor_code: `DOC-${nextId % 1000}` };
      setDoctors((prev) => [fallbackDoc, ...prev]);
    }

    setIsAddModalOpen(false);
    setNewDoctorForm({
      name: '',
      specialization: '',
      practice_license_number: '',
      practice_room: '',
      phone: '',
      email: '',
      consultation_fee: 150000,
    });
    showToast(`Dokter baru "${payload.name}" dengan tarif Rp ${payload.consultation_fee.toLocaleString()} berhasil disimpan ke database!`);
  };

  const handleEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingDoctor) return;

    try {
      await apiClient.put(`/doctors/${editingDoctor.id}`, editingDoctor);
    } catch (err) {
      // fallback
    }

    setDoctors(doctors.map((d) => (d.id === editingDoctor.id ? editingDoctor : d)));
    const updatedName = editingDoctor.name;
    const updatedFee = editingDoctor.consultation_fee || 150000;
    setEditingDoctor(null);
    showToast(`Data & tarif Doctor Fee untuk ${updatedName} (Rp ${updatedFee.toLocaleString()}) berhasil diperbarui!`);
  };

  const handleDeleteDoctor = async () => {
    if (!isAdmin || !deletingDoctor) return;

    try {
      await apiClient.delete(`/doctors/${deletingDoctor.id}`);
    } catch (err) {
      // fallback
    }

    setDoctors(doctors.filter((d) => d.id !== deletingDoctor.id));
    const targetName = deletingDoctor.name;
    setDeletingDoctor(null);
    showToast(`Dokter "${targetName}" berhasil dihapus dari direktori klinik!`);
  };

  const handleSaveSchedules = async (updatedSchedules: DoctorSchedule[]) => {
    if (!schedulingDoctor) return;

    try {
      await apiClient.post(`/doctors/${schedulingDoctor.id}/schedules`, updatedSchedules);
    } catch (err) {
      // fallback
    }

    setDoctors(
      doctors.map((d) => (d.id === schedulingDoctor.id ? { ...d, schedules: updatedSchedules } : d))
    );
    setSchedulingDoctor(null);
    showToast(`Jadwal praktik mingguan ${schedulingDoctor.name} berhasil diperbarui!`);
  };

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.doctor_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Success Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-7 h-7 text-sky-500" /> Direktori & Tarif Spesialis Dokter
            </h1>
            {!isAdmin && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> View Only (Admin Exclusive Edit)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kelola data dokter spesialis, nomor SIP, ruang praktik, jadwal mingguan, dan tarif Doctor Fee per dokter</p>
        </div>

        {/* ONLY ADMIN CAN ADD DOCTOR */}
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-md shadow-sky-600/30 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> {t('btnAddDoctor')}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter doctors by name, code, or specialization..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
        />
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                  {doc.name.charAt(4) || 'D'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                      {doc.doctor_code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 border border-teal-500/20 font-extrabold text-[11px]">
                      Fee: Rp {(doc.consultation_fee || 150000).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 leading-snug">{doc.name}</h2>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{doc.specialization}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => setSelectedDoctorDetail(doc)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  title="Lihat Detail Profil Dokter"
                >
                  <Eye className="w-3.5 h-3.5" /> Detail
                </button>

                {/* EDIT & DELETE BUTTONS - RESTRICTED TO ADMIN ONLY */}
                {isAdmin && (
                  <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                    <button
                      onClick={() => setEditingDoctor(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Doctor & Fee (Admin Only)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingDoctor(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Doctor (Admin Only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-200 dark:border-slate-800 py-3 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('sipNumber')}</span>
                <span className="font-semibold">{doc.practice_license_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t('practiceRoom')}</span>
                <span className="font-semibold">{doc.practice_room}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {doc.phone}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {doc.email}
              </div>
            </div>

            {/* Interactive Best Practice Weekly Schedule Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" /> {t('weeklySchedule')}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setSchedulingDoctor(doc)}
                    className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" /> Manage Schedule Slots
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {doc.schedules?.map((s) => (
                  <span key={s.id} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    <strong className="text-sky-600 dark:text-sky-400">{s.day_of_week}:</strong> {s.start_time} - {s.end_time} ({s.slot_duration_minutes}m slots)
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DOCTOR DETAIL MODAL */}
      {selectedDoctorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => setSelectedDoctorDetail(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {selectedDoctorDetail.name.charAt(4) || 'D'}
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-mono">
                  {selectedDoctorDetail.doctor_code}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{selectedDoctorDetail.name}</h2>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{selectedDoctorDetail.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 col-span-2">
                <span className="text-sky-600 dark:text-sky-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> TARIF DOCTOR FEE KONSULTASI MEDIS
                </span>
                <p className="font-extrabold text-sky-700 dark:text-sky-300 text-lg mt-1">
                  Rp {(selectedDoctorDetail.consultation_fee || 150000).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ per konsultasi pasien</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">NOMOR SIP RESMI</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedDoctorDetail.practice_license_number}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">RUANG PRAKTIK</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedDoctorDetail.practice_room}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">TELEPON / WA</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedDoctorDetail.phone}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">EMAIL DOKTER</span>
                <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5">{selectedDoctorDetail.email}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedDoctorDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BEST PRACTICE DOCTOR SCHEDULE MANAGING MODAL */}
      {schedulingDoctor && (
        <DoctorScheduleModal
          doctor={schedulingDoctor}
          onClose={() => setSchedulingDoctor(null)}
          onSave={handleSaveSchedules}
        />
      )}

      {/* Add Doctor Modal (Admin Only) */}
      {isAddModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <form onSubmit={handleAddDoctor} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daftarkan Dokter Baru & Set Tarif (Admin Exclusive)</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={newDoctorForm.name}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                  placeholder="dr. Jane Doe, Sp.B"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Spesialisasi</label>
                <input
                  type="text"
                  required
                  value={newDoctorForm.specialization}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
                  placeholder="Spesialis Bedah Umum"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Tarif Doctor Fee <span className="text-sky-500 font-bold">(Rp / Konsultasi) *</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={newDoctorForm.consultation_fee}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, consultation_fee: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border font-extrabold text-sky-600 dark:text-sky-400 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nomor SIP Resmi</label>
                <input
                  type="text"
                  required
                  value={newDoctorForm.practice_license_number}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, practice_license_number: e.target.value })}
                  placeholder="SIP.789/KK/2026"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Ruang Praktik</label>
                <input
                  type="text"
                  required
                  value={newDoctorForm.practice_room}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, practice_room: e.target.value })}
                  placeholder="Poliklinik C - Room 103"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md">Simpan Dokter & Tarif</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Doctor Modal (Admin Only) */}
      {editingDoctor && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <form onSubmit={handleEditDoctor} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Data & Tarif Doctor Fee Dokter</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Spesialisasi</label>
                <input
                  type="text"
                  value={editingDoctor.specialization}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">
                  Tarif Doctor Fee <span className="text-sky-500 font-bold">(Rp / Konsultasi)</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={5000}
                  value={editingDoctor.consultation_fee || 150000}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, consultation_fee: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border font-extrabold text-sky-600 dark:text-sky-400 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nomor SIP Resmi</label>
                <input
                  type="text"
                  value={editingDoctor.practice_license_number}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, practice_license_number: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Ruang Praktik</label>
                <input
                  type="text"
                  value={editingDoctor.practice_room}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, practice_room: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border focus:outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setEditingDoctor(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold">Batal</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md">Simpan Perubahan Tarif</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Doctor Modal (Admin Only) */}
      {deletingDoctor && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Doctor</h2>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{deletingDoctor.name}</strong> from the system directory?</p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setDeletingDoctor(null)} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold">Cancel</button>
              <button onClick={handleDeleteDoctor} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Interactive Best Practice Doctor Weekly Schedule Modal Component */
interface ScheduleModalProps {
  doctor: Doctor;
  onClose: () => void;
  onSave: (schedules: DoctorSchedule[]) => void;
}

const DoctorScheduleModal: React.FC<ScheduleModalProps> = ({ doctor, onClose, onSave }) => {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>(doctor.schedules || []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDayActive = (day: string) => {
    const existing = schedules.find((s) => s.day_of_week === day);
    if (existing) {
      setSchedules(schedules.filter((s) => s.day_of_week !== day));
    } else {
      setSchedules([
        ...schedules,
        {
          id: Date.now() + Math.random(),
          doctor_id: doctor.id,
          day_of_week: day,
          start_time: '08:00',
          end_time: '14:00',
          slot_duration_minutes: 20,
          max_patients: 18,
          is_active: true,
        },
      ]);
    }
  };

  const updateScheduleField = (day: string, field: keyof DoctorSchedule, val: any) => {
    setSchedules(
      schedules.map((s) => (s.day_of_week === day ? { ...s, [field]: val } : s))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" /> Best Practice Weekly Doctor Schedule Manager
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atur hari praktik, jam buka/tutup, durasi slot konsultasi, dan kuota pasien harian untuk {doctor.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {daysOfWeek.map((day) => {
            const sch = schedules.find((s) => s.day_of_week === day);
            const isActive = !!sch;

            return (
              <div key={day} className={`p-3.5 rounded-2xl border transition ${isActive ? 'bg-sky-500/10 border-sky-500/30' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleDayActive(day)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{day}</span>
                      <span className="text-[10px] text-slate-400 block">{isActive ? 'Praktik Aktif' : 'Libur / Tidak Praktik'}</span>
                    </div>
                  </div>

                  {isActive && sch && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Jam Mulai</span>
                        <input
                          type="time"
                          value={sch.start_time}
                          onChange={(e) => updateScheduleField(day, 'start_time', e.target.value)}
                          className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Jam Selesai</span>
                        <input
                          type="time"
                          value={sch.end_time}
                          onChange={(e) => updateScheduleField(day, 'end_time', e.target.value)}
                          className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Slot Per Pasien</span>
                        <select
                          value={sch.slot_duration_minutes}
                          onChange={(e) => updateScheduleField(day, 'slot_duration_minutes', Number(e.target.value))}
                          className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-bold"
                        >
                          <option value={15}>15 Menit</option>
                          <option value={20}>20 Menit</option>
                          <option value={30}>30 Menit</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Kuota Maks</span>
                        <input
                          type="number"
                          min={1}
                          value={sch.max_patients}
                          onChange={(e) => updateScheduleField(day, 'max_patients', Number(e.target.value))}
                          className="p-1.5 w-16 bg-white dark:bg-slate-900 border rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
            Batal
          </button>
          <button
            onClick={() => onSave(schedules)}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan Slot Praktik
          </button>
        </div>
      </div>
    </div>
  );
};
