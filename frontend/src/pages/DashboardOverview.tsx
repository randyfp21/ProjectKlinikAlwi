import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useMedicineStore } from '../store/useMedicineStore';
import { useCMSStore, CMSPromo } from '../store/useCMSStore';
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
  HeartPulse,
  Gift,
  Tag,
  Sparkles,
  ShieldCheck,
  QrCode,
  MapPin,
  Phone,
  CheckCircle2,
  Calendar,
  User,
  Zap,
  BookOpen,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { medicines } = useMedicineStore();
  const cms = useCMSStore();

  const role = user?.role || 'Super Admin';
  const isPharmacist = role === 'Pharmacist';
  const isDoctor = role === 'Doctor';
  const isPatient = role === 'Patient';

  const [selectedPromo, setSelectedPromo] = useState<CMSPromo | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Standard Enterprise Dashboard Stats
  const stats = [
    { title: t('statPatients'), value: '1,420', change: '+12% bulan ini', icon: Users, color: 'from-blue-500 to-indigo-600' },
    { title: t('statAppointments'), value: '38', change: '8 antrean aktif', icon: CalendarCheck, color: 'from-teal-500 to-emerald-600' },
    { title: t('statDoctors'), value: '14', change: 'Seluruh poliklinik aktif', icon: Stethoscope, color: 'from-sky-500 to-cyan-600' },
    { title: t('statRevenue'), value: 'Rp 67,500,000', change: '+18.4% vs bulan lalu', icon: CreditCard, color: 'from-amber-500 to-orange-600' },
  ];

  const todayQueues = [
    { no: 1, patient: 'Budi Santoso', doctor_id: 1, doctor: 'dr. Alwi Shahab, Sp.PD', time: '09:00', status: 'In Consultation', complaint: 'Pusing & sesak dada ringan', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { no: 2, patient: 'Siti Rahma', doctor_id: 2, doctor: 'dr. Sarah Lestari, Sp.A', time: '09:20', status: 'Waiting', complaint: 'Batuk sesak napas anak', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { no: 3, patient: 'Ahmad Hidayat', doctor_id: 1, doctor: 'dr. Alwi Shahab, Sp.PD', time: '09:40', status: 'Waiting', complaint: 'Nyeri ulu hati lambung', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { no: 4, patient: 'Dewi Lestari', doctor_id: 2, doctor: 'dr. Sarah Lestari, Sp.A', time: '10:00', status: 'Waiting', complaint: 'Demam tinggi 3 hari', badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
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

  const activePromos = cms.promos || [];

  return (
    <div className="space-y-8 font-sans">
      {/* =========================================================================
          VIEW 1: ROLE === 'PATIENT' -> HIGH-END MODERN PATIENT PERSONAL DASHBOARD
         ========================================================================= */}
      {isPatient ? (
        <div className="space-y-8">
          {/* Patient Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-8 text-white shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-mono font-extrabold uppercase tracking-wider">
                  <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" /> Patient Digital Health Hub
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Halo, {user?.full_name || 'Budi Santoso'}! 👋
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Selamat datang di Portal Pasien {cms.clinicName || 'Klinik Utama Alwi'}. Pantau jadwal konsultasi berjalan, rekam medis digital, dan nikmati penawaran paket kesehatan spesial.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  to="/dashboard/appointments"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-xl shadow-sky-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" /> Buat Janji Temu Dokter
                </Link>
                <Link
                  to="/dashboard/medical-records"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 shadow-lg backdrop-blur-md transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-sky-400" /> Rekam Medis Saya
                </Link>
              </div>
            </div>
          </div>

          {/* Patient Quick Info Cards (RM Card, Status Antrean, Rekam Medis, Tagihan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: RM Pasien */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-3 relative overflow-hidden group hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">NO. REKAM MEDIS (RM)</span>
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">RM-2026-0801</h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pasien Terverifikasi Resmi
                </p>
              </div>
            </div>

            {/* Card 2: Status Antrean Berjalan */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-3 relative overflow-hidden group hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">JANJI TEMU HARI INI</span>
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Clock className="w-5 h-5 animate-spin" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">#001</h3>
                  <span className="text-xs font-bold text-slate-500">Poli Dalam (09:00 WIB)</span>
                </div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">Status: Sedang Dikelola Dokter</p>
              </div>
            </div>

            {/* Card 3: Rekam Medis Terakhir */}
            <Link
              to="/dashboard/medical-records"
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-3 relative overflow-hidden group hover:shadow-xl transition hover:border-sky-500/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-sky-500 transition">DIAGNOSIS TERAKHIR</span>
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:scale-110 transition">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate">Essential Hypertension</h3>
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1">
                  Lihat Rekam Medis <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </p>
              </div>
            </Link>

            {/* Card 4: Status Pembayaran */}
            <Link
              to="/dashboard/billing"
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-3 relative overflow-hidden group hover:shadow-xl transition hover:border-emerald-500/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition">TAGIHAN SAYA</span>
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">Rp 175.000</h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Berobat
                </p>
              </div>
            </Link>
          </div>

          {/* MAIN TWO-COLUMN LAYOUT: JANJI TEMU DOKTER & KATALOG PROMO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1 & 2: Active Appointment & Clinic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detailed Active Appointment Card */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Jadwal Konsultasi Dokter Hari Ini</h2>
                      <p className="text-xs text-slate-400">Detail dokter spesialis & ruang poliklinik tempat Anda diperiksa</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-black">
                    APT-20260807-001
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">INFORMASI DOKTER PENANGGUNG JAWAB</span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">dr. Alwi Shahab, Sp.PD</h3>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-bold">Spesialis Penyakit Dalam (Internal Medicine)</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-500">
                      <span>Ruang Poliklinik:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">Poli A • Room 101</strong>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">WAKTU ESTIMASI & ANTREAN</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500 font-bold">Nomor Antrean Anda:</span>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">#001</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-slate-500">
                      <span>Estimasi Jam Dipanggil:</span>
                      <strong className="text-sky-600 dark:text-sky-400 font-mono">09:00 - 09:20 WIB</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{cms.clinicAddress || 'Jl. Meruya Utara, Kembangan Jakarta Barat'}</span>
                  </div>

                  <Link
                    to="/dashboard/queues"
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    Pantau Layar Antrean Live <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Quick Health Actions Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  to="/dashboard/appointments"
                  className="p-5 rounded-2xl glass-card border bg-white dark:bg-slate-900 hover:shadow-lg transition space-y-2 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Reservasi Dokter</h3>
                  <p className="text-xs text-slate-400">Pilih dokter spesialis & jam berobat</p>
                </Link>

                <Link
                  to="/dashboard/medical-records"
                  className="p-5 rounded-2xl glass-card border bg-white dark:bg-slate-900 hover:shadow-lg transition space-y-2 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Riwayat Resep & Obat</h3>
                  <p className="text-xs text-slate-400">Cek resep obat & aturan minum</p>
                </Link>

                <Link
                  to="/dashboard/billing"
                  className="p-5 rounded-2xl glass-card border bg-white dark:bg-slate-900 hover:shadow-lg transition space-y-2 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Kuitansi Berobat</h3>
                  <p className="text-xs text-slate-400">Unduh bukti transaksi resmi</p>
                </Link>
              </div>
            </div>

            {/* Column 3: PROMOS & ARTICLES WIDGET FOR PATIENTS */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Promo & Artikel Medis</h2>
                  </div>
                  <Link
                    to="/promos-articles"
                    target="_blank"
                    className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    Lihat Semua <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {activePromos.slice(0, 3).map((promo: CMSPromo) => (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromo(promo)}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 transition cursor-pointer space-y-3 group"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={promo.photoUrl}
                          alt={promo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                          {promo.discountTag}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase block">
                          🕒 {promo.createdAt || '19 Ags 2026'}
                        </span>
                        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug group-hover:text-amber-500 transition line-clamp-2">
                          {promo.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/promos-articles"
                  target="_blank"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" /> Buka Katalog Promo Lengkap
                </Link>
              </div>
            </div>
          </div>

          {/* INTERACTIVE PROMO DETAIL MODAL FOR PATIENT */}
          {selectedPromo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header & Banner Image */}
                <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden bg-slate-950 shrink-0">
                  <img
                    src={selectedPromo.photoUrl}
                    alt={selectedPromo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <button
                    onClick={() => setSelectedPromo(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase shadow-md">
                        {selectedPromo.discountTag}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/40 font-mono text-xs font-bold backdrop-blur-md">
                        {selectedPromo.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Content Body */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {selectedPromo.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400 flex-wrap">
                      <span>🕒 Dibuat: <strong className="text-emerald-600 dark:text-emerald-400">{selectedPromo.createdAt || '19 Agustus 2026'}</strong></span>
                      <span>•</span>
                      <span>📅 Masa Berlaku: <strong className="text-sky-600 dark:text-sky-400">{selectedPromo.validUntil}</strong></span>
                    </div>
                  </div>

                  {/* Promo Voucher Box */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">KODE KLAIM DISKON SPESIAL</span>
                      <span className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-widest block">
                        {selectedPromo.promoCode || 'PROMO-ALWI'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(selectedPromo.promoCode || 'PROMO-ALWI')}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Salin Kode
                        </>
                      )}
                    </button>
                  </div>

                  {/* Article Content / Terms & Narrative */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-500" /> Detail Artikel & Ketentuan Layanan
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p>{selectedPromo.description}</p>
                      <ul className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs">
                        <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" /> Sudah termasuk konsultasi dan resep gratis dengan dokter spesialis.
                        </li>
                        <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" /> Berlaku untuk pasien konsultasi langsung di klinik maupun Home Service.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Modal Action Footer */}
                <div className="p-6 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                  <button
                    onClick={() => setSelectedPromo(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                  >
                    Tutup
                  </button>

                  <Link
                    to="/dashboard/appointments"
                    onClick={() => setSelectedPromo(null)}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" /> Reservasi Dokter Sekarang <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
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
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Assigned Patient Consultation Queue</h2>
                <p className="text-xs text-slate-400">Patients waiting specifically for {doctorName}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-bold font-mono">
                {myDoctorQueuesToday.length} Patients
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-[10px] text-slate-500 border-b">
                  <tr>
                    <th className="py-3 px-4">Queue No</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Chief Complaint / Triage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {myDoctorQueuesToday.map((q) => (
                    <tr key={q.no} className="hover:bg-sky-500/5 transition">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600">#00{q.no}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{q.patient}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{q.time}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{q.complaint}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${q.badge}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/dashboard/consultation"
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shadow-xs inline-flex items-center gap-1"
                        >
                          Examine SOAP <ArrowRight className="w-3 h-3" />
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
            VIEW 3: ROLE === 'PHARMACIST' -> DEDICATED PHARMACY DASHBOARD (STOCK INVENTORY)
           ========================================================================= */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-2">
                  <Pill className="w-3.5 h-3.5 text-sky-400" /> Pharmacy Inventory Management Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Apotek & Depo Farmasi</h1>
                <p className="text-slate-300 text-sm mt-1">
                  Pantau ketersediaan stok obat, peringatan stok menipis, dan nilai total persediaan farmasi Klinik Alwi.
                </p>
              </div>

              <Link
                to="/dashboard/medicines"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Kelola Katalog Obat
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Jenis Obat</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{medicines.length} Item</h2>
                <p className="text-xs font-medium text-sky-500 mt-1">Terdaftar di formularium</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stok Menipis (Peringatan)</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-600 text-white flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{lowStockList.length} Item</h2>
                <p className="text-xs font-medium text-rose-500 mt-1">Perlu Restock Segera</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stok Aman / Tersedia</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                  <PackageCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{highStockList.length} Item</h2>
                <p className="text-xs font-medium text-emerald-600 mt-1">Siap diresepkan</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nilai Total Inventaris</span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                  Rp {totalInventoryValue.toLocaleString('id-ID')}
                </h2>
                <p className="text-xs font-medium text-slate-400 mt-1">Estimasi Nilai Jual Stok</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Peringatan Stok Obat Menipis
                  </h2>
                  <p className="text-xs text-slate-400">Item obat dengan kuantitas ≤ batas minimum stok</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold font-mono">
                  {lowStockList.length} Item
                </span>
              </div>

              {lowStockList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed">
                  Seluruh persediaan obat dalam kondisi aman & mencukupi.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-[10px] text-slate-500 border-b">
                      <tr>
                        <th className="py-3 px-4">Nama Obat</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4">Sisa Stok</th>
                        <th className="py-3 px-4">Min. Stok</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {lowStockList.map((m) => (
                        <tr key={m.id} className="hover:bg-rose-500/5 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{m.name}</td>
                          <td className="py-3 px-4 text-slate-500">{m.category}</td>
                          <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 font-mono">{m.stock} {m.unit}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{m.min_stock} {m.unit}</td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to="/dashboard/medicines"
                              className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] shadow-xs"
                            >
                              Restock
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-emerald-500" /> Katalog Stok Obat Tersedia (Aman)
                  </h2>
                  <p className="text-xs text-slate-400">Persediaan obat siap pakai untuk pelayanan resep</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold font-mono">
                  {highStockList.length} Item
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-[10px] text-slate-500 border-b">
                    <tr>
                      <th className="py-3 px-4">Nama Obat</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Stok Saat Ini</th>
                      <th className="py-3 px-4 text-right">Harga Jual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {highStockList.slice(0, 5).map((m) => (
                      <tr key={m.id} className="hover:bg-emerald-500/5 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{m.name}</td>
                        <td className="py-3 px-4 text-slate-500">{m.category}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{m.stock} {m.unit}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-slate-100">
                          Rp {m.selling_price.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 4: SUPER ADMIN / ADMIN STANDARD ENTERPRISE CLINIC DASHBOARD
           ========================================================================= */
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-2">
                  <Activity className="w-3.5 h-3.5 text-sky-400" /> Enterprise Clinic Operating System 2.0
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise Overview — {cms.clinicName || 'Klinik Utama Alwi'}</h1>
                <p className="text-slate-300 text-sm mt-1">
                  System Live Monitor — Real-time tracking of patients, active consultation queues, & financial revenue.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard/queues"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Real-time Queues
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="glass-card p-5 rounded-2xl border shadow-sm space-y-3 relative overflow-hidden group hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{st.title}</span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">{st.value}</h2>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {st.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Live Consultation Queue Today</h2>
                  <p className="text-xs text-slate-400">Patients currently waiting or in doctor's examination room</p>
                </div>
                <Link to="/dashboard/queues" className="text-xs text-sky-500 hover:underline font-semibold flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-[10px] text-slate-500 border-b">
                    <tr>
                      <th className="py-3 px-4">Queue No</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Assigned Doctor</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {todayQueues.map((q) => (
                      <tr key={q.no} className="hover:bg-sky-500/5 transition">
                        <td className="py-3 px-4 font-mono font-bold text-sky-600">#00{q.no}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{q.patient}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{q.doctor}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{q.time}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${q.badge}`}>
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
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Enterprise Quick Navigation</h2>
                <p className="text-xs text-slate-400">Shortcut links to core clinical management modules</p>
              </div>

              <div className="space-y-2">
                <Link
                  to="/dashboard/patients"
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between transition group text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>Patient Medical Records (EMR)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/dashboard/billing"
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between transition group text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span>Kasir & Billing Cashier</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/dashboard/medicines"
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between transition group text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
                      <Pill className="w-4 h-4" />
                    </div>
                    <span>Farmasi & Inventaris Obat</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/dashboard/promos-articles"
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between transition group text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span>Manajemen Artikel & Promo</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
