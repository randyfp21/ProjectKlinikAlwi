import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Hospital,
  ShieldCheck,
  Stethoscope,
  Clock,
  Pill,
  CreditCard,
  UserPlus,
  LogIn,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Home,
  Syringe,
  Droplet,
  Handshake,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Tag,
  Gift,
  Camera
} from 'lucide-react';
import { useLanguageStore } from '../store/useLanguageStore';
import { useThemeStore } from '../store/useThemeStore';
import { useCMSStore, CMSFacility } from '../store/useCMSStore';
import { LanguageSelector } from '../components/LanguageSelector';

export const LandingPage: React.FC = () => {
  const { t } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const cms = useCMSStore();
  const { clinicName, clinicTagline, clinicLogoIcon, heroTitle, heroSubtitle, heroBadge, galleryHeaderTitle, galleryHeaderSubtitle, doctorsHeaderTitle, doctorsHeaderSubtitle, promosHeaderTitle, facilities, featuredDoctors, galleryPhotos, promos, contactPhone, contactEmail, contactInstagram, clinicAddress } = cms;

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    cms.fetchCMSFromDB();
  }, []);

  useEffect(() => {
    if (!galleryPhotos || galleryPhotos.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % galleryPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [galleryPhotos]);

  const renderFacilityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-6 h-6 text-sky-500" />;
      case 'Pill':
        return <Pill className="w-6 h-6 text-teal-500" />;
      case 'Syringe':
        return <Syringe className="w-6 h-6 text-emerald-500" />;
      case 'Droplet':
        return <Droplet className="w-6 h-6 text-cyan-500" />;
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-indigo-500" />;
      case 'Handshake':
        return <Handshake className="w-6 h-6 text-amber-500" />;
      default:
        return <Stethoscope className="w-6 h-6 text-sky-500" />;
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', user: 'superadmin', desc: 'Full System Control, CMS, & Audit Logs' },
    { role: 'Doctor', user: 'doctor_alwi', desc: 'dr. Alwi Shahab, Sp.PD (EMR & SOAP)' },
    { role: 'Pharmacist', user: 'pharmacist', desc: 'apt. Andi Pratama (Medicine Stock)' },
    { role: 'Patient', user: 'patient_budi', desc: 'Budi Santoso (Appointments & Invoices)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Customizable Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition ${
              clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:'))
                ? 'bg-transparent'
                : 'bg-gradient-to-tr from-sky-500 to-teal-400 shadow-lg shadow-sky-500/20'
            }`}>
              {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                <img src={clinicLogoIcon} alt={clinicName} className="w-full h-full object-contain max-w-full max-h-full" />
              ) : (
                <Hospital className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white block">{clinicName}</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold tracking-wider uppercase block">{clinicTagline}</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSelector />

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-sky-500" /> {t('btnSignIn')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> {t('btnRegister')}
            </Link>
          </div>
        </div>
      </header>



      {/* PHOTO SLIDER CONTAINER AS FULL BACKGROUND HEADER FOR "Klinik Modern & Terpercaya Untuk Keluarga Anda" */}
      <section className="relative py-24 sm:py-32 px-6 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Full-width Background Photo Slider */}
        {galleryPhotos && galleryPhotos.length > 0 && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              key={activeSlideIndex}
              src={galleryPhotos[activeSlideIndex]?.photoUrl}
              alt={galleryPhotos[activeSlideIndex]?.title}
              className="w-full h-full object-cover transition-all duration-1000 ease-in-out scale-105"
            />
            {/* Dark Blur Overlay for readability */}
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />
          </div>
        )}

        {/* Content Box Centered Over Photo Slider Background */}
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold font-mono tracking-wider shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-400" /> KLINIK PRATAMA & UTAMA TERAKREDITASI
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
            {galleryHeaderTitle || 'Klinik Modern & Terpercaya Untuk Keluarga Anda'}
          </h2>

          <p className="text-slate-200 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            {galleryHeaderSubtitle || 'Memberikan pelayanan medis terbaik dengan tim dokter spesialis berpengalaman dan fasilitas kesehatan modern lengkap.'}
          </p>

          {/* Active Photo Info Badge */}
          {galleryPhotos && galleryPhotos.length > 0 && (
            <div className="pt-2 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-xs text-slate-300 shadow-xl">
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">{galleryPhotos[activeSlideIndex]?.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-600/80 text-white font-bold">
                {activeSlideIndex + 1}/{galleryPhotos.length}
              </span>
            </div>
          )}

          {/* Slider Controls */}
          {galleryPhotos && galleryPhotos.length > 0 && (
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveSlideIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-sky-600 text-white border border-white/20 flex items-center justify-center transition backdrop-blur-md shadow-md"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {galleryPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeSlideIndex ? 'w-8 bg-sky-400 shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveSlideIndex((prev) => (prev + 1) % galleryPhotos.length)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-sky-600 text-white border border-white/20 flex items-center justify-center transition backdrop-blur-md shadow-md"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ONGOING CLINIC PROMOS & ARTICLES CARDS (CMS Synced) */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold font-mono uppercase tracking-wider inline-flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-amber-500" /> {promosHeaderTitle || 'PROMO & ARTIKEL KESEHATAN BERLANGSUNG'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Penawaran Spesial & Paket Hemat Klinik
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Dapatkan potongan harga khusus untuk pemeriksaan MCU rutin, imunisasi keluarga, dan terapi vitamin stamina yang sedang berlangsung di Klinik Alwi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos && promos.map((promo) => (
            <div
              key={promo.id}
              className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-lg hover:shadow-2xl transition space-y-4 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={promo.photoUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-md">
                    {promo.discountTag}
                  </span>
                  <span className="absolute bottom-3 left-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                    {promo.validUntil}
                  </span>
                </div>

                <div className="px-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                    {promo.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {promo.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold flex items-center gap-1 bg-sky-500/10 dark:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/20">
                  <Tag className="w-3.5 h-3.5 text-sky-500" /> {promo.promoCode || 'PROMO-ALWI'}
                </span>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  Ambil Promo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 CLINIC FACILITIES & SERVICES GRID */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold font-mono uppercase tracking-wider">
            FASILITAS & LAYANAN UNGGULAN KLINIK
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Layanan Kesehatan Lengkap & Modern</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
            Nikmati akses pelayanan kesehatan yang komprehensif mulai dari perawatan dokter spesialis, Home Service, IV Drips, hingga MCU institusi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-xl transition space-y-4 group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:bg-sky-500 group-hover:text-white transition">
                  {fac.emoji}
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[11px] font-bold">
                  {fac.badge}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {fac.title}
                </h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{fac.subtitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">{fac.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tersedia Hari Ini
                </span>
                <Link
                  to="/login"
                  className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  Booking Jadwal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2 FEATURED DOCTORS SECTION WITH CUSTOMIZABLE PHOTOS & SPECIALIZATIONS */}
      <section className="py-20 px-6 bg-slate-100/70 dark:bg-slate-900/40 border-t border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-mono uppercase tracking-wider">
              {doctorsHeaderTitle || 'TIM DOKTER SPESIALIS UNGGULAN'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{doctorsHeaderSubtitle || 'Ditangani Oleh Dokter Spesialis Berpengalaman'}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Setiap pasien mendapatkan perawatan medis terbaik dari dokter spesialis profesional berlisensi resmi dengan standar pelayanan ramah dan tepat.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-xl transition"
              >
                {/* Customizable Photo */}
                <img
                  src={doc.photoUrl}
                  alt={doc.name}
                  className="w-36 h-36 rounded-2xl object-cover border-4 border-sky-500/30 shadow-md shrink-0"
                />

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold font-mono">
                      SPECIALIST DOCTOR
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{doc.name}</h3>
                    <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{doc.education}</p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border-t border-slate-100 dark:border-slate-800 pt-3">
                    "{doc.description}"
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> Buat Janji Temu Pasien
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Overview */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pilihan portal login sesuai peran pengguna (Default password: <code className="text-sky-600 dark:text-sky-400 font-mono font-bold">password123</code>)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoAccounts.map((acc, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{acc.role}</span>
                <ShieldCheck className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">{acc.user}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{acc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA SECTION: DAFTAR AKUN & PORTAL LOGIN */}
      <section className="py-16 px-6 bg-gradient-to-r from-sky-900 via-slate-900 to-teal-900 text-white text-center border-t border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold font-mono uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-4 h-4 text-sky-400" /> REGISTRASI & AKSES MASUK KLINIK
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Mulai Konsultasi & Rawat Jalan Hari Ini
          </h2>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Daftarkan diri Anda untuk mendapatkan nomor rekam medis digital (RM), kemudahan reservasi jadwal dokter, serta riwayat obat secara transparan.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 flex items-center gap-3 transition transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" /> Daftar Akun Pasien Baru
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 shadow-lg backdrop-blur-md flex items-center gap-3 transition"
            >
              <LogIn className="w-5 h-5 text-sky-400" /> Portal Login Petugas & Pasien <ArrowRight className="w-4 h-4 text-slate-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Footer Bar */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 px-6 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
                clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:'))
                  ? 'bg-transparent'
                  : 'bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold shadow-md'
              }`}>
                {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                  <img src={clinicLogoIcon} alt={clinicName} className="w-full h-full object-contain" />
                ) : (
                  <Hospital className="w-5 h-5" />
                )}
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">{clinicName}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{clinicTagline}</p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block uppercase text-[10px] tracking-wider">KONTAK & SOSIAL MEDIA</span>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-500" /> <span>{contactPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-500" /> <span>{contactEmail}</span>
            </div>
            {contactInstagram && (
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-500" />
                <a
                  href={contactInstagram.startsWith('http') ? contactInstagram : `https://${contactInstagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-rose-600 dark:text-rose-400 font-bold"
                >
                  Sosial Media Kami
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" /> <span>{clinicAddress}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block uppercase text-[10px] tracking-wider">JAM OPERASIONAL KLINIK</span>
            <p className="text-slate-600 dark:text-slate-300">Senin - Sabtu: <strong className="text-slate-900 dark:text-white">08:00 - 21:00 WIB</strong></p>
            <p className="text-slate-600 dark:text-slate-300">Minggu & Libur Nasional: <strong className="text-teal-600 dark:text-teal-400">Home Service & UGD Only</strong></p>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-slate-400">
          <p>© 2026 {clinicName}. All Rights Reserved. Built with Clean Architecture Golang 1.25 & React 19.</p>
        </div>
      </footer>
    </div>
  );
};
