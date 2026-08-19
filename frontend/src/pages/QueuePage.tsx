import React, { useState, useEffect } from 'react';
import { ListOrdered, Volume2, CheckCircle2, UserCheck, ArrowRight, Clock, Lock, RefreshCw, Calendar, Sparkles, AlertCircle, Stethoscope, User, Play, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { Queue } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useCMSStore } from '../store/useCMSStore';
import { useQueueStore } from '../store/useQueueStore';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatDate';
import { playQueueChimeAndVoice } from '../utils/playAudioCall';

export const QueuePage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { clinicName, clinicAddress, contactPhone, contactEmail, clinicLogoIcon } = useCMSStore();
  const { queues: apiQueues, fetchQueues, updateQueueStatus: updateApiQueueStatus, isLoading } = useQueueStore();

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Doctor';

  // Selected Date for Queue Audit / History Viewing (Default Today 2026-08-19)
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-19');

  // Multi-Date Queue Local Fallback Store
  const [localQueuesByDate, setLocalQueuesByDate] = useState<Record<string, Queue[]>>({
    '2026-08-19': [
      {
        id: 1,
        appointment_id: 1,
        patient_id: 1,
        patient: { id: 1, patient_number: 'PAT-20260807-001', full_name: 'Budi Santoso', gender: 'Male', age: 36, phone: '+628123', national_id: '3171012345670001', birth_date: '1990-05-15', address: 'Jl. Sudirman No. 45', email: 'budi@gmail.com', blood_type: 'O+', allergy: 'Penicillin', disease_history: 'Hipertensi', current_complaint: 'Sakit kepala hebat', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
        queue_number: 1,
        queue_date: '2026-08-19',
        status: 'In Consultation',
        estimated_time: '09:00 WIB',
      },
      {
        id: 2,
        appointment_id: 2,
        patient_id: 2,
        patient: { id: 2, patient_number: 'PAT-20260807-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '+628198', national_id: '3171012345670002', birth_date: '1995-11-20', address: 'Jl. Gatot Subroto No. 12', email: 'siti@gmail.com', blood_type: 'A+', allergy: 'Tidak Ada', disease_history: 'Asma Bronkial', current_complaint: 'Sesak napas kambuh', emergency_contact: '' },
        doctor_id: 2,
        doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Spesialis Anak', gender: 'Female', phone: '', email: '', practice_license_number: 'SIP.456/KK/2024', education: '', practice_room: 'Ruang 102 (Poli Anak)', active_status: true },
        queue_number: 2,
        queue_date: '2026-08-19',
        status: 'Waiting',
        estimated_time: '09:20 WIB',
      },
      {
        id: 3,
        appointment_id: 3,
        patient_id: 3,
        patient: { id: 3, patient_number: 'PAT-20260807-003', full_name: 'Ahmad Hidayat', gender: 'Male', age: 41, phone: '+62817', national_id: '3171012345670003', birth_date: '1985-02-10', address: 'Jl. Kebon Jeruk No. 88', email: 'ahmad@gmail.com', blood_type: 'B+', allergy: 'Seafood', disease_history: 'Gastritis', current_complaint: 'Nyeri ulu hati', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
        queue_number: 3,
        queue_date: '2026-08-19',
        status: 'Waiting',
        estimated_time: '09:40 WIB',
      },
      {
        id: 4,
        appointment_id: 4,
        patient_id: 4,
        patient: { id: 4, patient_number: 'PAT-004', full_name: 'Dewi Lestari', gender: 'Female', age: 28, phone: '+628155', national_id: '3171012345670004', birth_date: '1998-04-12', address: 'Jl. Pemuda No. 10', email: 'dewi@gmail.com', blood_type: 'AB+', allergy: 'Tidak Ada', disease_history: 'Migraine', current_complaint: 'Migrain berat', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
        queue_number: 4,
        queue_date: '2026-08-19',
        status: 'Waiting',
        estimated_time: '10:00 WIB',
      },
    ],
    // Historical Queue Records (1, 2, 3 Months Ago)
    '2026-07-22': [
      {
        id: 101,
        appointment_id: 101,
        patient_id: 5,
        patient: { id: 5, patient_number: 'PAT-005', full_name: 'Rudi Hermawan', gender: 'Male', age: 45, phone: '+628129', national_id: '3171012345670005', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
        queue_number: 1,
        queue_date: '2026-07-22',
        status: 'Completed',
        estimated_time: '10:00 WIB',
      },
      {
        id: 102,
        appointment_id: 102,
        patient_id: 6,
        patient: { id: 6, patient_number: 'PAT-006', full_name: 'Eka Putri', gender: 'Female', age: 24, phone: '+628177', national_id: '3171012345670006', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 2,
        doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Spesialis Anak', gender: 'Female', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Ruang 102 (Poli Anak)', active_status: true },
        queue_number: 2,
        queue_date: '2026-07-22',
        status: 'Completed',
        estimated_time: '10:20 WIB',
      },
    ],
    '2026-06-18': [
      {
        id: 201,
        appointment_id: 201,
        patient_id: 7,
        patient: { id: 7, patient_number: 'PAT-007', full_name: 'Bambang Utomo', gender: 'Male', age: 52, phone: '', national_id: '3171012345670007', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
        queue_number: 1,
        queue_date: '2026-06-18',
        status: 'Completed',
        estimated_time: '11:00 WIB',
      },
    ],
    '2026-05-15': [
      {
        id: 301,
        appointment_id: 301,
        patient_id: 9,
        patient: { id: 9, patient_number: 'PAT-009', full_name: 'Hendra Wijaya', gender: 'Male', age: 34, phone: '', national_id: '3171012345670009', birth_date: '', address: '', email: '', blood_type: '', allergy: '', disease_history: '', current_complaint: '', emergency_contact: '' },
        doctor_id: 1,
        doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: '', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
        queue_number: 1,
        queue_date: '2026-05-15',
        status: 'Completed',
        estimated_time: '14:00 WIB',
      },
    ],
    '2026-08-20': [], // Tomorrow Queue (Clean reset)
  });

  const [announcement, setAnnouncement] = useState('');

  // Confirmation Modal States
  const [callConfirmQueue, setCallConfirmQueue] = useState<Queue | null>(null);
  const [completeConfirmQueue, setCompleteConfirmQueue] = useState<Queue | null>(null);

  // Fetch queues from backend PostgreSQL on date change or initial load!
  useEffect(() => {
    fetchQueues(selectedDate);
  }, [selectedDate, fetchQueues]);

  // Combine PostgreSQL API queues with local fallback if API returns empty
  const activeQueues = apiQueues.length > 0 ? apiQueues : (localQueuesByDate[selectedDate] || []);

  // Open Call Confirmation Modal
  const requestCallQueue = (queue: Queue) => {
    if (!isAdmin) return;
    setCallConfirmQueue(queue);
  };

  // Open Complete Confirmation Modal
  const requestCompleteQueue = (queue: Queue) => {
    if (!isAdmin) return;
    setCompleteConfirmQueue(queue);
  };

  // Execute Call Queue after confirmation
  const confirmCallQueue = () => {
    if (!callConfirmQueue) return;
    const queue = callConfirmQueue;

    // 1. Update queue status in PostgreSQL 5432 Database!
    updateApiQueueStatus(queue.id, 'In Consultation');

    // 2. Update local state fallback
    setLocalQueuesByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((q) =>
        q.id === queue.id ? { ...q, status: 'In Consultation' } : q
      ),
    }));

    const patientName = queue.patient?.full_name || 'Pasien';
    const roomName = queue.doctor?.practice_room || 'Ruang Periksa Dokter';

    // 3. Play Web Audio Chime Sound & Speech Voice Call Announcement!
    playQueueChimeAndVoice(queue.queue_number, patientName, roomName);

    // 4. Set UI Banner Announcement
    setAnnouncement(
      `PANGGILAN AKTIF PASIEN: Nomor Antrean #00${queue.queue_number} atas nama ${patientName} dipanggil menuju ${roomName}`
    );
    setTimeout(() => setAnnouncement(''), 7000);

    setCallConfirmQueue(null);
  };

  // Execute Complete Queue after confirmation
  const confirmCompleteQueue = () => {
    if (!completeConfirmQueue) return;
    const queue = completeConfirmQueue;

    // Update queue status in PostgreSQL 5432 Database!
    updateApiQueueStatus(queue.id, 'Completed');

    setLocalQueuesByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map((q) =>
        q.id === queue.id ? { ...q, status: 'Completed' } : q
      ),
    }));

    setCompleteConfirmQueue(null);
  };

  // Simulate Midnight Auto-Reset to Next Day
  const handleSimulateNextDayReset = () => {
    setSelectedDate('2026-08-20');
    setAnnouncement('RESET OTOMATIS TENGAH MALAM: Antrean baru tanggal 20 August 2026 siap digunakan.');
    setTimeout(() => setAnnouncement(''), 5000);
  };

  // Filter pending queues (Waiting / In Consultation) and completed queues
  const pendingQueues = activeQueues.filter((q) => q.status !== 'Completed');
  const completedQueues = activeQueues.filter((q) => q.status === 'Completed');
  const currentCallingQueue = pendingQueues.find((q) => q.status === 'In Consultation') || pendingQueues[0];

  const waitingCount = activeQueues.filter((q) => q.status === 'Waiting').length;
  const inConsultCount = activeQueues.filter((q) => q.status === 'In Consultation').length;
  const completedCount = completedQueues.length;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Live Paging Audio Announcement Banner */}
      {announcement && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-600 text-white font-extrabold text-xs shadow-2xl flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-yellow-300 animate-pulse shrink-0" />
            <span className="leading-relaxed">{announcement}</span>
          </span>
          <button
            onClick={() => setAnnouncement('')}
            className="p-1 rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden hidden sm:flex">
            {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
              <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
            ) : (
              <ListOrdered className="w-8 h-8 text-sky-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Real-time Queue & Audio Paging System
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white pt-1">
              <ListOrdered className="w-8 h-8 text-sky-400" />
              Papan Antrean & Panggilan Pasien Real-time
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Manajemen antrean kunjungan pasien, pemanggilan suara panggilan periksa (Voice Audio Call), audit riwayat antrean tanggal sebelumnya, dan reset otomatis harian.
            </p>
          </div>
        </div>

        {/* Date Selector & Reset Button */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300 text-[11px]">Tanggal Antrean:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-mono font-extrabold text-sky-400 focus:outline-none cursor-pointer"
            />
          </div>

          {isAdmin && (
            <button
              onClick={handleSimulateNextDayReset}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              title="Simulasi Reset Antrean Otomatis Harian (Tengah Malam)"
            >
              <RefreshCw className="w-4 h-4" /> Reset Harian (20 Aug)
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Overview for Selected Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Antrean Hari Ini</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">{activeQueues.length} Pasien</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500"><User className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Menunggu Dipanggil</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-500 font-mono">{waitingCount} Pasien</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Clock className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sedang Diberiksa Dokter</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-500 font-mono">{inConsultCount} Pasien</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Stethoscope className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Selesai Kunjungan</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-sky-500 font-mono">{completedCount} Pasien</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CURRENTLY CALLING BIG MONITOR CARD */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-sky-400" /> {currentCallingQueue?.doctor?.practice_room || 'Ruang Periksa Dokter'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold font-mono uppercase">
                {currentCallingQueue?.status === 'In Consultation' ? 'PANGGILAN AKTIF' : 'MENUNGGU PANGGILAN'}
              </span>
            </div>

            <div className="text-center py-6 space-y-2 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-slate-400 text-xs font-extrabold uppercase tracking-widest block">NOMOR ANTREAN AKTIF</span>
              <h2 className="text-7xl font-black text-white tracking-widest font-mono drop-shadow-md">
                {currentCallingQueue ? `#00${currentCallingQueue.queue_number}` : '---'}
              </h2>
              <div className="pt-2">
                <span className="text-lg font-black text-sky-300 block">{currentCallingQueue?.patient?.full_name || 'Tidak Ada Pasien Aktif'}</span>
                <span className="text-xs text-slate-300 font-medium block mt-0.5">{currentCallingQueue?.doctor?.name}</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-1">Est. Waktu: {currentCallingQueue?.estimated_time || '-'}</span>
              </div>
            </div>
          </div>

          {/* ADMIN PAGING CALL BUTTON WITH AUDIO CHIME */}
          <div className="pt-4 border-t border-slate-800">
            {isAdmin ? (
              <button
                onClick={() => {
                  const nextWaiting = pendingQueues.find((q) => q.status === 'Waiting');
                  if (nextWaiting) {
                    requestCallQueue(nextWaiting);
                  } else if (currentCallingQueue) {
                    requestCallQueue(currentCallingQueue);
                  }
                }}
                disabled={pendingQueues.length === 0}
                className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-sky-600/30 transition flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider"
              >
                <Volume2 className="w-5 h-5 text-yellow-300 animate-pulse" /> Panggil Antrean Berikutnya (Audio Call)
              </button>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-800/60 rounded-xl font-semibold border border-slate-800">
                🔒 Panggilan Antrean Khusus Petugas Kasir / Dokter
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE / WAITING QUEUE TABLE (EXCLUDES COMPLETED) */}
        <div className="md:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-sky-500" />
                Antrean Berjalan Tanggal: {formatDateIndonesian(selectedDate)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar pasien yang sedang menunggu dipanggil atau sedang diperiksa dokter</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-xs font-bold">
              {pendingQueues.length} Pasien Belum Selesai
            </span>
          </div>

          {pendingQueues.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-semibold space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Semua Antrean Aktif Telah Selesai Dipanggil!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Seluruh pasien pada antrean hari ini sudah selesai berkonsultasi dan dipindahkan ke tabel <strong>Daftar Pasien Selesai</strong> di bawah.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">No. Antrean</th>
                    <th className="py-3.5 px-4">Nama Pasien & NIK</th>
                    <th className="py-3.5 px-4">Dokter & Poli</th>
                    <th className="py-3.5 px-4">Est. Jam</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi Panggilan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {pendingQueues.map((q) => (
                    <tr key={q.id} className="hover:bg-sky-500/10 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-sky-600 dark:text-sky-400 text-sm">
                        #00{q.queue_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{q.patient?.full_name}</div>
                        {q.patient?.national_id && (
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">NIK: {q.patient.national_id}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        <div>{q.doctor?.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{q.doctor?.practice_room}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 font-bold">
                        {q.estimated_time}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                            q.status === 'In Consultation'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {q.status === 'In Consultation' ? 'SEDANG DIPERIKSA' : 'MENUNGGU'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => requestCallQueue(q)}
                              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Panggil Antrean Pasien dengan Suara Audio"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Panggil
                            </button>
                            <button
                              onClick={() => requestCompleteQueue(q)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Tandai Antrean Selesai Berobat & Pindahkan ke Tabel Selesai"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Read-only monitor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED TABLE FOR COMPLETED QUEUES (DAFTAR PASIEN SELESAI) */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Daftar Pasien Selesai Berobat (Tanggal: {formatDateIndonesian(selectedDate)})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Arsip daftar pasien yang telah selesai berkonsultasi dengan dokter dan lanjut ke proses pembayaran kasir / apotek
            </p>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-extrabold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {completedQueues.length} Pasien Selesai
          </span>
        </div>

        {completedQueues.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-semibold space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p>Belum ada pasien yang selesai diperiksa untuk tanggal {formatDateIndonesian(selectedDate)}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
              <thead className="bg-emerald-500/10 dark:bg-emerald-950/30 uppercase text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold tracking-wider border-b border-emerald-500/20">
                <tr>
                  <th className="py-3.5 px-4">No. Antrean</th>
                  <th className="py-3.5 px-4">Nama Pasien & NIK</th>
                  <th className="py-3.5 px-4">Dokter & Ruang Poli</th>
                  <th className="py-3.5 px-4">Est. Jam Kunjungan</th>
                  <th className="py-3.5 px-4">Status Layanan</th>
                  <th className="py-3.5 px-4 text-right">Keterangan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {completedQueues.map((q) => (
                  <tr key={q.id} className="hover:bg-emerald-500/5 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      #00{q.queue_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">{q.patient?.full_name}</div>
                      {q.patient?.national_id && (
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">NIK: {q.patient.national_id}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      <div>{q.doctor?.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{q.doctor?.practice_room}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 font-bold">
                      {q.estimated_time}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SELESAI BEROBAT
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Lanjut ke Kasir & Resep Obat
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CALL QUEUE CONFIRMATION MODAL */}
      {callConfirmQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Konfirmasi Pemanggilan Pasien</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Panggilan antrean suara audio ke poliklinik</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block">NOMOR ANTREAN PASIEN</span>
              <span className="text-4xl font-black text-sky-600 dark:text-sky-400 font-mono block">#00{callConfirmQueue.queue_number}</span>
              <div className="pt-1">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 block">
                  Atas Nama: {callConfirmQueue.patient?.full_name || 'Pasien'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Dokter: {callConfirmQueue.doctor?.name} ({callConfirmQueue.doctor?.practice_room})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
              Apakah Anda yakin ingin memanggil pasien ini? Sistem akan memutar melodi bel bel <strong>(Ding-Dong)</strong> dan menyuarakan panggilan suara Bahasa Indonesia.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCallConfirmQueue(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmCallQueue}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Ya, Panggil Pasien
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE QUEUE CONFIRMATION MODAL */}
      {completeConfirmQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Konfirmasi Antrean Selesai</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Selesaikan pemeriksaan & pindahkan antrean</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block">ANTREAN SELESAI BEROBAT</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">#00{completeConfirmQueue.queue_number}</span>
              <div className="pt-1">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 block">
                  Atas Nama: {completeConfirmQueue.patient?.full_name || 'Pasien'}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center leading-relaxed py-2">
              Apakah Anda yakin pasien ini telah selesai diperiksa?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCompleteConfirmQueue(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmCompleteQueue}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Ya, Selesaikan Antrean
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
