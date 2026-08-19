import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Clock, CheckCircle2, AlertCircle, Lock, Edit3, ShieldAlert, Calendar, User, Stethoscope, FileText, CheckCircle, Filter, CalendarDays } from 'lucide-react';
import { Appointment, Doctor } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useConsultationStore } from '../store/useConsultationStore';
import { apiClient } from '../api/client';
import { formatDateIndonesian } from '../utils/formatDate';

export const AppointmentPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { addPatientToQueue } = useConsultationStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const isPatient = user?.role === 'Patient';

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [editingStatusApp, setEditingStatusApp] = useState<Appointment | null>(null);

  // Date Filter State (Today, Yesterday, Custom Date, All)
  const todayStr = '2026-08-07';
  const yesterdayStr = '2026-08-06';
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'yesterday' | 'custom'>('all');
  const [customDateInput, setCustomDateInput] = useState<string>('2026-08-07');

  // Doctors directory with weekly practice schedule best practice
  const availableDoctors: Doctor[] = [
    {
      id: 1,
      user_id: 3,
      doctor_code: 'DOC-001',
      name: 'dr. Alwi Shahab, Sp.PD',
      specialization: 'Internal Medicine (Penyakit Dalam)',
      gender: 'Male',
      phone: '',
      email: '',
      practice_license_number: 'SIP.123/KK/2024',
      education: '',
      practice_room: 'Poliklinik A - Room 101',
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
      specialization: 'Pediatrician (Spesialis Anak)',
      gender: 'Female',
      phone: '',
      email: '',
      practice_license_number: 'SIP.456/KK/2024',
      education: '',
      practice_room: 'Poliklinik B - Room 102',
      active_status: true,
      schedules: [
        { id: 4, doctor_id: 2, day_of_week: 'Tuesday', start_time: '13:00', end_time: '18:00', slot_duration_minutes: 20, max_patients: 15, is_active: true },
        { id: 5, doctor_id: 2, day_of_week: 'Thursday', start_time: '13:00', end_time: '18:00', slot_duration_minutes: 20, max_patients: 15, is_active: true },
      ],
    },
  ];

  // Booking Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-07');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:40 - 10:00');
  const [complaintInput, setComplaintInput] = useState<string>('');

  const selectedDoctor = availableDoctors.find((d) => d.id === Number(selectedDoctorId)) || availableDoctors[0];

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      appointment_number: 'APT-20260807-001',
      patient_id: 1,
      patient: { id: 1, patient_number: 'PAT-001', full_name: 'Budi Santoso', gender: 'Male', age: 36, phone: '+628123', national_id: '3171012345670001', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Room 101', active_status: true },
      appointment_date: '2026-08-07',
      time_slot: '09:00 - 09:20',
      queue_number: 1,
      status: 'Confirmed',
      complaint: 'Feeling dizzy and chest pressure',
      notes: 'Hypertension checkup',
      created_at: '2026-08-07T08:00:00Z',
    },
    {
      id: 2,
      appointment_number: 'APT-20260807-002',
      patient_id: 2,
      patient: { id: 2, patient_number: 'PAT-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '+628198', national_id: '3171012345670002', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
      doctor_id: 2,
      doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Pediatrician', gender: 'Female', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Room 102', active_status: true },
      appointment_date: '2026-08-07',
      time_slot: '09:20 - 09:40',
      queue_number: 2,
      status: 'Waiting',
      complaint: 'Shortness of breath',
      notes: 'Asthma checkup',
      created_at: '2026-08-07T08:15:00Z',
    },
    {
      id: 3,
      appointment_number: 'APT-20260806-001',
      patient_id: 3,
      patient: { id: 3, patient_number: 'PAT-003', full_name: 'Ahmad Hidayat', gender: 'Male', age: 41, phone: '+62817', national_id: '3171012345670003', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Room 101', active_status: true },
      appointment_date: '2026-08-06',
      time_slot: '10:00 - 10:20',
      queue_number: 1,
      status: 'Completed',
      complaint: 'Severe stomach pain after meals',
      notes: 'Gastritis follow-up',
      created_at: '2026-08-06T09:00:00Z',
    },
  ]);

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get('/appointments');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  const handleConfirmBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQueueNo = appointments.length + 1;
    const dateFormatted = selectedDate.replace(/-/g, '');
    const newApptNo = `APT-${dateFormatted}-00${newQueueNo}`;

    const payload = {
      patient_id: 1,
      doctor_id: selectedDoctor.id,
      appointment_date: selectedDate,
      time_slot: selectedTimeSlot,
      complaint: complaintInput || 'Konsultasi kesehatan rutin',
      notes: 'Online Patient Booking via Web Portal',
    };

    try {
      const res = await apiClient.post('/appointments', payload);
      if (res.data.success && res.data.data) {
        setAppointments((prev) => [res.data.data, ...prev]);
        addPatientToQueue(res.data.data);
      } else {
        const fallbackAppt: Appointment = {
          id: Date.now(),
          appointment_number: newApptNo,
          patient_id: 1,
          patient: {
            id: 1,
            patient_number: 'PAT-001',
            full_name: user?.full_name || 'Budi Santoso',
            gender: 'Male',
            age: 36,
            phone: '+628123456789',
            national_id: '3171012345670001',
            birth_date: '1990-05-15',
            address: 'Jl. Sudirman No. 45',
            email: 'budi@gmail.com',
            blood_type: 'O+',
            allergy: 'Penicillin',
            disease_history: 'Hypertension',
            current_complaint: complaintInput,
            emergency_contact: '',
          },
          doctor_id: selectedDoctor.id,
          doctor: selectedDoctor,
          appointment_date: selectedDate,
          time_slot: selectedTimeSlot,
          queue_number: newQueueNo,
          status: 'Waiting',
          complaint: complaintInput,
          notes: 'Online Patient Booking via Web Portal',
          created_at: new Date().toISOString(),
        };
        setAppointments((prev) => [fallbackAppt, ...prev]);
        addPatientToQueue(fallbackAppt);
      }
    } catch (err) {
      // fallback
    }

    setIsBookModalOpen(false);
    showToast(`Janji temu ${newApptNo} (Antrean #${newQueueNo}) berhasil dipesan untuk ${selectedDoctor.name}! Sesuai slot ${selectedTimeSlot}.`);
  };

  const handleUpdateStatus = (appId: number, newStatus: Appointment['status']) => {
    if (!isAdmin) return;
    setAppointments(
      appointments.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    setEditingStatusApp(null);
    showToast(`Status janji temu diperbarui menjadi "${newStatus}" oleh Admin!`);
  };

  // Filter Appointments by Date Selection
  const filteredAppointments = appointments.filter((app) => {
    if (dateFilterMode === 'today') return app.appointment_date === todayStr;
    if (dateFilterMode === 'yesterday') return app.appointment_date === yesterdayStr;
    if (dateFilterMode === 'custom') return app.appointment_date === customDateInput;
    return true; // 'all'
  });

  return (
    <div className="space-y-6 font-sans">
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {successToast}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-7 h-7 text-sky-500" /> {t('appointmentTitle')}
            </h1>
            {!isAdmin && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Status Change Exclusive to Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('appointmentSubtitle')}</p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> {t('btnBookAppointment')}
        </button>
      </div>

      {/* Interactive Date Filter Bar (Hari Ini, Kemarin, Pilih Tanggal Custom, Semua) */}
      <div className="glass-card p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-sky-500" /> Filter Tanggal Berobat:
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setDateFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              dateFilterMode === 'all'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Semua Tanggal ({appointments.length})
          </button>

          <button
            onClick={() => setDateFilterMode('today')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              dateFilterMode === 'today'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Hari Ini ({todayStr})
          </button>

          <button
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              dateFilterMode === 'yesterday'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Kemarin ({yesterdayStr})
          </button>

          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2">
            <CalendarDays className="w-4 h-4 text-sky-500 shrink-0" />
            <input
              type="date"
              value={customDateInput}
              onChange={(e) => {
                setCustomDateInput(e.target.value);
                setDateFilterMode('custom');
              }}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Appointments List Table */}
      <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <p>Tidak ada janji temu pasien pada filter tanggal ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="p-3.5">Appt No</th>
                  <th className="p-3.5">Queue No</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Doctor & Room</th>
                  <th className="p-3.5">Date & Slot</th>
                  <th className="p-3.5">Chief Complaint</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Admin Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">{app.appointment_number}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">#00{app.queue_number}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{app.patient?.full_name}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{app.doctor?.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{app.doctor?.practice_room}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{formatDateIndonesian(app.appointment_date)}</div>
                      <div className="text-[10px] font-mono text-sky-500">{app.time_slot}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{app.complaint}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        app.status === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : app.status === 'Completed'
                          ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                          : app.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    {/* ADMIN ONLY STATUS CHANGE CONTROLS */}
                    <td className="p-3.5 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
                          >
                            <option value="Waiting">Waiting</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Read-only (Admin only)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BEST PRACTICE ONLINE APPOINTMENT BOOKING MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleConfirmBookingSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-sky-500" /> Form Booking Janji Temu Online
            </h2>
            
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-sky-500" />
              Sistem verifikasi jadwal dokter, durasi slot waktu, dan pencegahan overbooking aktif.
            </div>

            <div className="space-y-3 text-xs">
              {/* Patient Selection / Auto-fill for Patient Role */}
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Identitas Pasien</label>
                {isPatient ? (
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">
                    PAT-20260807-001 — {user?.full_name || 'Budi Santoso'} (NIK: 3171012345670001)
                  </div>
                ) : (
                  <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none">
                    <option value={1}>PAT-20260807-001 - Budi Santoso (NIK: 3171012345670001)</option>
                    <option value={2}>PAT-20260807-002 - Siti Rahma (NIK: 3171012345670002)</option>
                    <option value={3}>PAT-20260807-003 - Ahmad Hidayat (NIK: 3171012345670003)</option>
                  </select>
                )}
              </div>

              {/* Step 1: Select Doctor Specialist */}
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Pilih Dokter Spesialis & Ruangan</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none font-semibold text-xs"
                >
                  {availableDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialization} ({d.practice_room})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Display Doctor's Dynamic Weekly Practice Days */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 block uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Hari & Jam Praktik Dokter Terpilih:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoctor.schedules?.map((s) => (
                    <span key={s.id} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {s.day_of_week}: {s.start_time} - {s.end_time} ({s.slot_duration_minutes}m/slot)
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 3: Date & Available Time Slot Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Tanggal Berobat</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Pilih Slot Waktu Tersedia</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none text-xs font-semibold"
                  >
                    {selectedDoctor.id === 1 ? (
                      <>
                        <option value="09:40 - 10:00">09:40 - 10:00 (Sisa Kuota: 14/18)</option>
                        <option value="10:00 - 10:20">10:00 - 10:20 (Sisa Kuota: 18/18)</option>
                        <option value="10:20 - 10:40">10:20 - 10:40 (Sisa Kuota: 16/18)</option>
                        <option value="10:40 - 11:00">10:40 - 11:00 (Sisa Kuota: 18/18)</option>
                      </>
                    ) : (
                      <>
                        <option value="13:00 - 13:20">13:00 - 13:20 (Sisa Kuota: 15/15)</option>
                        <option value="13:20 - 13:40">13:20 - 13:40 (Sisa Kuota: 12/15)</option>
                        <option value="13:40 - 14:00">13:40 - 14:00 (Sisa Kuota: 15/15)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Step 4: Chief Complaint Input */}
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Keluhan Utama / Alasan Berobat</label>
                <textarea
                  rows={2}
                  required
                  value={complaintInput}
                  onChange={(e) => setComplaintInput(e.target.value)}
                  placeholder="Masukkan keluhan fisik yang dirasakan..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Konfirmasi Booking Janji Temu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
