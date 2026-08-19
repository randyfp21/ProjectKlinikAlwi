import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useMedicineStore } from '../store/useMedicineStore';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  CreditCard,
  Pill,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight,
  FileCheck,
  AlertTriangle,
  PackageCheck,
  Boxes,
  Plus,
  UserCheck,
  Building2,
  History,
  FileText,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { medicines } = useMedicineStore();

  const role = user?.role || 'Super Admin';
  const isPharmacist = role === 'Pharmacist';
  const isDoctor = role === 'Doctor';
  const isPatient = role === 'Patient';

  // Standard Enterprise Dashboard Stats
  const stats = [
    { title: t('statPatients'), value: '1,420', change: '+12% this month', icon: Users, color: 'from-blue-500 to-indigo-600' },
    { title: t('statAppointments'), value: '38', change: '8 in queue now', icon: CalendarCheck, color: 'from-teal-500 to-emerald-600' },
    { title: t('statDoctors'), value: '14', change: 'All rooms active', icon: Stethoscope, color: 'from-sky-500 to-cyan-600' },
    { title: t('statRevenue'), value: 'Rp 67,500,000', change: '+18.4% vs last month', icon: CreditCard, color: 'from-amber-500 to-orange-600' },
  ];

  const todayQueues = [
    { no: 1, patient: 'Budi Santoso', doctor_id: 1, doctor: 'dr. Alwi Shahab, Sp.PD', time: '09:00', status: 'In Consultation', complaint: 'Feeling dizzy & chest pressure', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { no: 2, patient: 'Siti Rahma', doctor_id: 2, doctor: 'dr. Sarah Lestari, Sp.A', time: '09:20', status: 'Waiting', complaint: 'Shortness of breath', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { no: 3, patient: 'Ahmad Hidayat', doctor_id: 1, doctor: 'dr. Alwi Shahab, Sp.PD', time: '09:40', status: 'Waiting', complaint: 'Severe stomach pain', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { no: 4, patient: 'Dewi Lestari', doctor_id: 2, doctor: 'dr. Sarah Lestari, Sp.A', time: '10:00', status: 'Waiting', badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  ];

  // Pharmacist Specific Data
  const lowStockList = medicines.filter((m) => m.stock <= m.min_stock);
  const highStockList = medicines.filter((m) => m.stock > m.min_stock).sort((a, b) => b.stock - a.stock);
  const totalInventoryValue = medicines.reduce((acc, curr) => acc + curr.stock * curr.selling_price, 0);

  // Doctor Specific Data
  const doctorName = user?.full_name || 'dr. Alwi Shahab, Sp.PD';
  const myDoctorQueuesToday = todayQueues.filter((q) =>
    q.doctor.toLowerCase().includes(doctorName.toLowerCase()) || doctorName.toLowerCase().includes('alwi') ? q.doctor_id === 1 : true
  );

  return (
    <div className="space-y-6 font-sans">
      {/* =========================================================================
          VIEW 1: ROLE === 'PATIENT' -> DEDICATED PATIENT PERSONAL DASHBOARD
         ========================================================================= */}
      {isPatient ? (
        <div className="space-y-6">
          {/* Patient Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-2">
                  <HeartPulse className="w-3.5 h-3.5 text-sky-400" /> Patient Health Portal Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Selamat Datang, {user?.full_name || 'Budi Santoso'}!</h1>
                <p className="text-slate-300 text-sm mt-1">
                  Portal Layanan Kesehatan Pasien Klinik Alwi — Pantau janji temu hari ini, rekam medis, dan transaksi tagihan Anda.
                </p>
              </div>

              <Link
                to="/dashboard/appointments"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" /> Book Janji Temu Baru
              </Link>
            </div>
          </div>

          {/* Patient 4 KPI Cards (Terdaftar, Janji Temu Hari Ini, Dokter Aktif, Rekam Medis Terakhir) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pasien Terdaftar</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1,420 Pasien</h2>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">Terverifikasi di sistem</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Janji Temu Hari Ini</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400">1 Janji Temu</h2>
                <p className="text-xs font-medium text-teal-600 mt-1">Status: Confirmed (#001)</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dokter Praktik Aktif</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-600 text-white flex items-center justify-center shadow-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400">14 Spesialis</h2>
                <p className="text-xs font-medium text-sky-500 mt-1">Siap melayani hari ini</p>
              </div>
            </div>

            {/* CLICKABLE LATEST MEDICAL RECORD CARD -> NAVIGATES DIRECTLY TO /dashboard/medical-records */}
            <Link
              to="/dashboard/medical-records"
              className="glass-card p-5 rounded-2xl border shadow-sm hover:shadow-lg transition cursor-pointer group bg-gradient-to-tr from-sky-500/5 to-teal-500/5 hover:border-sky-500/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition">Rekam Medis Terakhir</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                  <History className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition font-mono">
                  MR-APT-20260807-001
                </h2>
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1">
                  Lihat Rekam Medis Saya <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </p>
              </div>
            </Link>
          </div>

          {/* Patient Quick Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Booked Appointment Today */}
            <div className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500" /> Janji Temu Berjalan Hari Ini
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold font-mono">
                  APT-20260807-001
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">DOKTER SPESIALIS</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">dr. Alwi Shahab, Sp.PD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">WAKTU & RUANG</span>
                  <span className="font-semibold text-sky-500 font-mono">09:00 - 09:20 | Room 101</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">NOMOR ANTREAN</span>
                  <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 font-mono">#001</span>
                </div>
              </div>
            </div>

            {/* Latest Personal Medical Record Card with Direct Button */}
            <div className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-500" /> Ringkasan Rekam Medis Terakhir
                </h2>
                <Link
                  to="/dashboard/medical-records"
                  className="text-xs text-sky-500 hover:text-sky-600 font-bold flex items-center gap-1"
                >
                  Buka Rekam Medis <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">DIAGNOSIS DOKTER</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Essential Hypertension (ICD-10: I10)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">TANGGAL BEROBAT</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">2026-08-07</span>
                </div>
                <p className="text-slate-500 pt-1 text-[11px]">SOAP: S: Pusing & pening. O: Tensi 145/95 mmHg. P: Amlodipine 10mg 1x1 pagi.</p>
              </div>

              <Link
                to="/dashboard/medical-records"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" /> Lihat Riwayat Rekam Medis Lengkap Saya
              </Link>
            </div>
          </div>
        </div>
      ) : isDoctor ? (
        /* =========================================================================
            VIEW 2: ROLE === 'DOCTOR' -> DEDICATED DOCTOR DASHBOARD (MY PATIENTS TODAY)
           ========================================================================= */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-2">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-400" /> Physician Practice Room Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {doctorName}!</h1>
                <p className="text-slate-300 text-sm mt-1">
                  Poliklinik Internal Medicine — Room 101. Showing today's booked patients assigned exclusively to your schedule.
                </p>
              </div>

              <Link
                to="/dashboard/consultation"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" /> Start Consultation (EMR SOAP)
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Patients Today</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-600 text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{myDoctorQueuesToday.length} Patients</h2>
                <p className="text-xs font-medium text-sky-500 mt-1">Booked for {doctorName}</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Waiting in Queue</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {myDoctorQueuesToday.filter((q) => q.status === 'Waiting').length} Patients
                </h2>
                <p className="text-xs font-medium text-amber-600 mt-1">Ready for examination</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Examined / Completed</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {myDoctorQueuesToday.filter((q) => q.status === 'In Consultation' || q.status === 'Completed').length} Patients
                </h2>
                <p className="text-xs font-medium text-emerald-600 mt-1">SOAP records written</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Practice Room</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Room 101</h2>
                <p className="text-xs font-medium text-slate-400 mt-1">Poliklinik A</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-500" /> My Scheduled Patients Today ({myDoctorQueuesToday.length})
                </h2>
                <p className="text-xs text-slate-500">Filtered strictly for doctor appointment bookings today</p>
              </div>

              <Link
                to="/dashboard/consultation"
                className="text-xs text-sky-500 hover:text-sky-600 font-bold flex items-center gap-1"
              >
                Go to EMR Examination Room <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3.5">Queue No</th>
                    <th className="p-3.5">Patient Name</th>
                    <th className="p-3.5">Time Slot</th>
                    <th className="p-3.5">Chief Complaint</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {myDoctorQueuesToday.map((q) => (
                    <tr key={q.no} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-sky-600 dark:text-sky-400 text-sm">#00{q.no}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{q.patient}</td>
                      <td className="p-3.5 font-mono text-sky-500">{q.time}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{q.complaint}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${q.badge}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to="/dashboard/consultation"
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition shadow-sm inline-flex items-center gap-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Examine Patient
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : isPharmacist ? (
        /* =========================================================================
            VIEW 3: ROLE === 'PHARMACIST' -> DEDICATED PHARMACY INVENTORY DASHBOARD
           ========================================================================= */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
                  <Pill className="w-3.5 h-3.5 text-teal-400" /> Pharmacist Stock Control Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.full_name}!</h1>
                <p className="text-slate-300 text-sm mt-1">
                  Pharmacist Inventory Console — Real-time medicine stock levels, low stock warnings, and asset valuation summary.
                </p>
              </div>

              <Link
                to="/dashboard/pharmacy"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition flex items-center gap-2"
              >
                <Boxes className="w-4 h-4" /> Open Master Pharmacy & Audit Log
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Master Medicines</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{medicines.length} Items</h2>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">Active inventory master</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Warnings</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockList.length} Items</h2>
                <p className="text-xs font-medium text-rose-500 mt-1">Requires immediate reorder</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Abundant / High Stock</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                  <PackageCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-sky-600 dark:text-sky-400">{highStockList.length} Items</h2>
                <p className="text-xs font-medium text-sky-500 mt-1">Optimal stock levels</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Stock Valuation</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Rp {totalInventoryValue.toLocaleString()}</h2>
                <p className="text-xs font-medium text-emerald-600 mt-1">Total pharmacy asset value</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Warnings (&lt; Min Stock)
                </h2>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 text-xs font-bold">
                  {lowStockList.length} Critical
                </span>
              </div>

              {lowStockList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                  All medicine stock levels are normal. No low stock alerts!
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockList.map((m) => (
                    <div key={m.id} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-rose-500 block">{m.medicine_code}</span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.name}</h3>
                        <p className="text-[11px] text-slate-500">
                          Current Stock: <strong className="text-rose-600">{m.stock} {m.unit}</strong> (Min: {m.min_stock})
                        </p>
                      </div>
                      <Link
                        to="/dashboard/pharmacy"
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Reorder Stock
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-2xl border space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-teal-500 uppercase tracking-wider flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-teal-500" /> Abundant / High Stock Inventory
                </h2>
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 text-xs font-bold">
                  {highStockList.length} Items Available
                </span>
              </div>

              <div className="space-y-3">
                {highStockList.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-teal-500 block">{m.medicine_code}</span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.name}</h3>
                      <p className="text-[11px] text-slate-500">Category: {typeof m.category === 'string' ? m.category : m.category_name || 'Generik'} | Manufacturer: {m.manufacturer}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400">{m.stock} {m.unit}</span>
                      <span className="block text-[10px] text-slate-400">Rp {m.selling_price.toLocaleString()}/unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 4: STANDARD ENTERPRISE CLINICAL DASHBOARD FOR ADMIN / SUPER ADMIN
           ========================================================================= */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-2">
                  <Activity className="w-3.5 h-3.5 text-sky-400" /> Enterprise HMS Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('welcome')}, {user?.full_name}!</h1>
                <p className="text-slate-300 text-sm mt-1">
                  You are logged in as <span className="text-sky-400 font-semibold">{role}</span>. {t('overviewDesc')}.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/dashboard/queues"
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-lg shadow-sky-500/30 transition flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" /> {t('queueTitle')}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.title}</span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h2>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('queueLiveTitle')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('overviewDesc')}</p>
                </div>
                <Link to="/dashboard/queues" className="text-xs text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-1">
                  {t('btnViewAll')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3">Queue No</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {todayQueues.map((q) => (
                      <tr key={q.no} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">#00{q.no}</td>
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{q.patient}</td>
                        <td className="p-3">{q.doctor}</td>
                        <td className="p-3 font-mono">{q.time}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${q.badge}`}>
                            {q.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-teal-500" /> {t('pharmacyAlertsTitle')}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {lowStockList.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">{item.name}</h3>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">Current Stock: <span className="font-bold">{item.stock} {item.unit}</span> (Min: {item.min_stock})</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-[10px]">
                      {t('lowStockBadge')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <Link
                  to="/dashboard/pharmacy"
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  {t('btnOpenInventory')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
