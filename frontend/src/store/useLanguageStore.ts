import { create } from 'zustand';

export type Language = 'id' | 'en';

export const translations = {
  id: {
    // Header & Sidebar
    appName: 'Klinik Alwi',
    appSubtitle: 'Sistem Manajemen Rumah Sakit',
    welcome: 'Selamat Datang',
    signOut: 'Keluar',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    apiOnline: 'API Terhubung (Golang 1.25 + Gin)',
    searchPlaceholder: 'Cari pasien, dokter, obat...',
    accountRole: 'Akun',

    // Menu Navigation
    menuDashboard: 'Ringkasan Dashboard',
    menuDoctors: 'Manajemen Dokter',
    menuPatients: 'Manajemen Pasien',
    menuAppointments: 'Janji Temu (Booking)',
    menuQueues: 'Antrean Langsung',
    menuConsultation: 'Konsultasi & SOAP',
    menuPharmacy: 'Apotek & Stok Obat',
    menuBilling: 'Pembayaran & Tagihan',
    menuMedicalRecords: 'Rekam Medis',
    menuReports: 'Laporan & Analistik',
    menuAuditLogs: 'Log Audit Keamanan',

    // Landing Page
    landingTitle: 'Sistem Manajemen Pelayanan Kesehatan Terpadu',
    landingSubtitle: 'Platform berbasis Clean Architecture yang dirancang untuk operasional medis modern. Mengelola Jadwal Dokter, Pendaftaran Pasien, Booking Online, Antrean Real-time, Rekam Medis EMR, Stok Apotek, dan Pembayaran QRIS.',
    btnSignIn: 'Masuk Portal',
    btnRegister: 'Daftar Akun Pasien',
    btnPortalLogin: 'Login Portal',
    feature1Title: 'Poliklinik & Dokter Spesialis',
    feature1Desc: 'Spesialis Penyakit Dalam, Anak, Bedah, dan Konsultasi Kesehatan Umum.',
    feature2Title: 'Booking Janji Temu & Antrean Cerdas',
    feature2Desc: 'Pesan jadwal secara online dan pantau nomor antrean langsung dari perangkat Anda.',
    feature3Title: 'E-Resep Resep Digital',
    feature3Desc: 'Pengambilan obat cepat dengan verifikasi stok otomatis & peringatan keamanan.',
    feature4Title: 'Tagihan Transparan & QRIS',
    feature4Desc: 'Rincian biaya dokter, tindakan, dan obat dengan pembayaran instan QRIS, Tunai & Asuransi.',

    // Login Page
    loginTitle: 'Masuk ke Portal',
    loginSubtitle: 'Masukkan kredensial akun Klinik Alwi HMS Anda',
    usernameLabel: 'Nama Pengguna (Username)',
    passwordLabel: 'Kata Sandi (Password)',
    quickFillTitle: 'Isi Otomatis Akun Demo:',
    noAccountYet: 'Belum memiliki akun pasien?',
    registerHere: 'Daftar Akun Di Sini',

    // Register Patient Page
    registerTitle: 'Pendaftaran Akun Pasien Baru',
    registerSubtitle: 'Daftar sebagai pasien baru untuk dapat melakukan booking jadwal online',
    fullNameLabel: 'Nama Lengkap',
    emailLabel: 'Alamat Email',
    phoneLabel: 'Nomor Telepon',
    nikLabel: 'Nomor NIK (KTP)',
    genderLabel: 'Jenis Kelamin',
    birthDateLabel: 'Tanggal Lahir',
    bloodTypeLabel: 'Golongan Darah',
    allergyLabel: 'Alergi Obat/Makanan (Jika ada)',
    btnSubmitRegister: 'Selesaikan Pendaftaran Pasien',
    alreadyHaveAccount: 'Sudah memiliki akun?',
    signInHere: 'Masuk Di Sini',

    // Dashboard Overview
    overviewTitle: 'Ringkasan Operasional Hari Ini',
    overviewDesc: 'Laporan aktivitas dan status antrean Klinik Alwi',
    statPatients: 'Total Pasien Terdaftar',
    statAppointments: 'Janji Temu Hari Ini',
    statDoctors: 'Dokter Praktik Aktif',
    statRevenue: 'Pendapatan Bulan Ini',
    queueLiveTitle: 'Antrean Konsultasi Langsung',
    pharmacyAlertsTitle: 'Peringatan Stok Apotek',
    lowStockBadge: 'Stok Menipis',
    btnViewAll: 'Lihat Semua',
    btnOpenInventory: 'Buka Inventaris Obat',

    // Doctor Management
    doctorTitle: 'Manajemen Data Dokter',
    doctorSubtitle: 'Direktori dokter, nomor SIP, ruang praktik, dan jadwal mingguan',
    btnAddDoctor: 'Tambah Dokter Baru',
    sipNumber: 'NOMOR SIP',
    practiceRoom: 'RUANG PRAKTIK',
    weeklySchedule: 'Jadwal Praktik Mingguan',

    // Patient Management
    patientTitle: 'Manajemen Data Pasien',
    patientSubtitle: 'Pendaftaran pasien, rekam NIK, riwayat penyakit, dan kontak darurat',
    btnRegisterPatient: 'Daftar Pasien Baru',
    patientNumber: 'Nomor Pasien',
    knownAllergies: 'Alergi Diketahui',
    diseaseHistory: 'Riwayat Penyakit',

    // Appointments
    appointmentTitle: 'Booking Janji Temu Dokter',
    appointmentSubtitle: 'Jadwal praktik, manajemen kuota otomatis, dan pencegahan overbooking',
    btnBookAppointment: 'Buat Janji Temu',
    timeSlot: 'Waktu / Slot',

    // Queues
    queueTitle: 'Manajemen Antrean & Display Layar',
    queueSubtitle: 'Pemanggilan antrean real-time, estimasi waktu tunggu, dan konfirmasi status',
    currentCalling: 'Nomor Antrean Dipanggil',
    btnCallNext: 'Panggil Antrean Berikutnya',
    btnComplete: 'Selesai',

    // Consultation
    consultationTitle: 'Konsultasi Dokter & Rekam SOAP',
    consultationSubtitle: 'Input EMR, diagnosis ICD-10, verifikasi tanda tangan digital, dan e-resep',
    btnSaveRecord: 'Simpan Rekam Medis & E-Resep',
    subjectiveLabel: 'Subjective (S) - Keluhan Pasien',
    objectiveLabel: 'Objective (O) - Pemeriksaan & TTV',
    assessmentLabel: 'Assessment (A) - Diagnosis',
    planLabel: 'Plan (P) - Rencana Terapi',
    signatureVerified: 'Tanda Tangan Digital Terverifikasi',

    // Pharmacy
    pharmacyTitle: 'Apotek & Stok Inventaris Obat',
    pharmacySubtitle: 'Stok master obat, peringatan kadaluarsa, dan pengurangan stok otomatis saat penyerahan',
    btnDispense: 'Serahkan Obat & Kurangi Stok',
    pendingPrescriptions: 'Antrean Resep Siap Diserahkan',

    // Billing
    billingTitle: 'Kasir Pembayaran & Tagihan',
    billingSubtitle: 'Rincian jasa dokter, tindakan, obat, pembayaran QRIS & cetak kuitansi',
    btnConfirmPayment: 'Konfirmasi Pembayaran',
    btnPrintReceipt: 'Cetak Kuitansi Resmi',
    grandTotal: 'Total Pembayaran',

    // Medical Records
    mrTitle: 'Arsip Rekam Medis Pasien',
    mrSubtitle: 'Riwayat lengkap medis pasien yang dilindungi aturan Soft Delete GORM',
    softDeleteNotice: 'Dilindungi Soft Delete (Tidak Pernah Dihapus Permanen)',

    // Reports & Audit
    reportsTitle: 'Laporan Analistik Eksekutif',
    reportsSubtitle: 'Laporan pendapatan, performa dokter, dan 5 diagnosis ICD-10 terbanyak',
    btnExportPDF: 'Ekspor PDF',
    btnExportExcel: 'Ekspor Excel',
    auditTitle: 'Log Audit Keamanan Sistem',
    auditSubtitle: 'Jejak audit otentikasi pengguna, pembuatan data, dan penyerahan obat',
  },
  en: {
    // Header & Sidebar
    appName: 'Klinik Alwi',
    appSubtitle: 'Hospital Management System',
    welcome: 'Welcome',
    signOut: 'Sign Out',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    apiOnline: 'API Online (Golang 1.25 + Gin)',
    searchPlaceholder: 'Search patient, doctor, medicine...',
    accountRole: 'Account',

    // Menu Navigation
    menuDashboard: 'Dashboard Overview',
    menuDoctors: 'Doctor Management',
    menuPatients: 'Patient Management',
    menuAppointments: 'Appointments (Booking)',
    menuQueues: 'Live Queue Monitor',
    menuConsultation: 'Consultation & SOAP',
    menuPharmacy: 'Pharmacy & Stock',
    menuBilling: 'Billing & Invoices',
    menuMedicalRecords: 'Medical Records',
    menuReports: 'Reports & Analytics',
    menuAuditLogs: 'Security Audit Logs',

    // Landing Page
    landingTitle: 'Enterprise Integrated Healthcare Management',
    landingSubtitle: 'Scalable Clean Architecture platform designed for modern medical operations. Seamlessly managing Doctor Schedules, Patient Registration, Online Appointments, Live Queue Tracking, EMR SOAP Records, Pharmacy Stock, and QRIS Payments.',
    btnSignIn: 'Portal Sign In',
    btnRegister: 'Register Patient Account',
    btnPortalLogin: 'Portal Login',
    feature1Title: 'Poliklinik & Doctor Specialists',
    feature1Desc: 'Internal medicine, pediatrics, surgery, and general health consultations.',
    feature2Title: 'Smart Booking & Queuing',
    feature2Desc: 'Book schedules online in advance and monitor live queue numbers on your device.',
    feature3Title: 'Digital E-Prescriptions',
    feature3Desc: 'Fast pharmacy dispensing with automatic stock verification & safety alerts.',
    feature4Title: 'Transparent Billing & QRIS',
    feature4Desc: 'Itemized fee receipts with instant QRIS, Cash, and Insurance integration.',

    // Login Page
    loginTitle: 'Sign In to Portal',
    loginSubtitle: 'Enter your Klinik Alwi HMS credentials',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    quickFillTitle: 'Quick Fill Demo Accounts:',
    noAccountYet: "Don't have a patient account yet?",
    registerHere: 'Register Account Here',

    // Register Patient Page
    registerTitle: 'New Patient Account Registration',
    registerSubtitle: 'Register as a new patient to book appointments online',
    fullNameLabel: 'Full Name',
    emailLabel: 'Email Address',
    phoneLabel: 'Phone Number',
    nikLabel: 'National ID (NIK)',
    genderLabel: 'Gender',
    birthDateLabel: 'Birth Date',
    bloodTypeLabel: 'Blood Type',
    allergyLabel: 'Known Allergies (If any)',
    btnSubmitRegister: 'Complete Patient Registration',
    alreadyHaveAccount: 'Already have an account?',
    signInHere: 'Sign In Here',

    // Dashboard Overview
    overviewTitle: "Today's Operational Summary",
    overviewDesc: 'Activity reports and queue status for Klinik Alwi',
    statPatients: 'Total Registered Patients',
    statAppointments: "Today's Appointments",
    statDoctors: 'Active Practicing Doctors',
    statRevenue: 'Monthly Revenue',
    queueLiveTitle: 'Live Consultation Queue',
    pharmacyAlertsTitle: 'Pharmacy Alerts',
    lowStockBadge: 'Low Stock',
    btnViewAll: 'View All',
    btnOpenInventory: 'Open Medicine Inventory',

    // Doctor Management
    doctorTitle: 'Doctor Management',
    doctorSubtitle: 'Doctor directory, practice license numbers (SIP), rooms, and weekly schedules',
    btnAddDoctor: 'Add New Doctor',
    sipNumber: 'PRACTICE LICENSE (SIP)',
    practiceRoom: 'PRACTICE ROOM',
    weeklySchedule: 'Weekly Practice Schedule',

    // Patient Management
    patientTitle: 'Patient Management',
    patientSubtitle: 'Patient registration, NIK records, disease history, and emergency contacts',
    btnRegisterPatient: 'Register New Patient',
    patientNumber: 'Patient Number',
    knownAllergies: 'Known Allergies',
    diseaseHistory: 'Disease History',

    // Appointments
    appointmentTitle: 'Doctor Appointment Booking',
    appointmentSubtitle: 'Practice schedule, automatic quota management, and overbooking prevention',
    btnBookAppointment: 'Book Appointment',
    timeSlot: 'Time / Slot',

    // Queues
    queueTitle: 'Queue Management & Live Display',
    queueSubtitle: 'Real-time queue calling, estimated wait time, and status updates',
    currentCalling: 'Current Queue Number Called',
    btnCallNext: 'Call Next Queue',
    btnComplete: 'Complete',

    // Consultation
    consultationTitle: 'Doctor Consultation & SOAP Record',
    consultationSubtitle: 'EMR input, ICD-10 diagnosis, digital signature verification, and e-prescription',
    btnSaveRecord: 'Save Medical Record & E-Prescription',
    subjectiveLabel: 'Subjective (S) - Patient Complaints',
    objectiveLabel: 'Objective (O) - Exam & Vitals',
    assessmentLabel: 'Assessment (A) - Diagnosis',
    planLabel: 'Plan (P) - Treatment Plan',
    signatureVerified: 'Digital Signature Verified',

    // Pharmacy
    pharmacyTitle: 'Pharmacy & Stock Inventory',
    pharmacySubtitle: 'Medicine master stock, expiry alerts, and automatic stock deduction upon dispensing',
    btnDispense: 'Dispense Medicine & Deduct Stock',
    pendingPrescriptions: 'Pending Prescription Queue',

    // Billing
    billingTitle: 'Billing Cashier & Invoices',
    billingSubtitle: 'Itemized doctor fees, procedures, medicines, QRIS payments, and official receipts',
    btnConfirmPayment: 'Confirm Payment',
    btnPrintReceipt: 'Print Official Receipt',
    grandTotal: 'Grand Total',

    // Medical Records
    mrTitle: 'Patient Medical Record Archival',
    mrSubtitle: 'Complete historical patient encounters protected with GORM Soft Delete rules',
    softDeleteNotice: 'Soft Delete Protected (Never Permanently Erased)',

    // Reports & Audit
    reportsTitle: 'Executive Analytics & Reports',
    reportsSubtitle: 'Revenue reports, doctor performance, and top 5 ICD-10 diagnoses',
    btnExportPDF: 'Export PDF',
    btnExportExcel: 'Export Excel',
    auditTitle: 'System Security Audit Logs',
    auditSubtitle: 'Immutable audit trail of user authentication, data creation, and medicine dispensing',
  },
};

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['id']) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => {
  const savedLang = (localStorage.getItem('app_lang') as Language) || 'id';

  return {
    lang: savedLang,
    setLang: (newLang: Language) => {
      localStorage.setItem('app_lang', newLang);
      set({ lang: newLang });
    },
    t: (key) => {
      const currentLang = get().lang;
      return translations[currentLang][key] || translations['id'][key] || key;
    },
  };
});
