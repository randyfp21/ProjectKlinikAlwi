import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, FileText, Lock, UserCheck, Eye, X, Award, CalendarCheck, User, Stethoscope, Filter, Calendar, SlidersHorizontal, RefreshCw, Activity, HeartPulse, Pill, ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { MedicalRecord } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useCMSStore } from '../store/useCMSStore';
import { apiClient } from '../api/client';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../utils/formatDate';

export const MedicalRecordPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { clinicName, clinicAddress, contactPhone, contactEmail, clinicLogoIcon } = useCMSStore();

  const isPatientRole = user?.role === 'Patient';

  // Search & Multi-Filter States
  const [search, setSearch] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All');
  const [selectedDiagnosisFilter, setSelectedDiagnosisFilter] = useState('All');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Column Sorting States
  type SortField = 'record_number' | 'visit_date' | 'patient_name' | 'doctor_name' | 'diagnosis';
  const [sortField, setSortField] = useState<SortField>('visit_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: 1,
      record_number: 'MR-APT-20260807-001',
      appointment_id: 1,
      appointment_number: 'APT-20260807-001',
      patient_id: 1,
      patient: { id: 1, patient_number: 'PAT-20260807-001', full_name: 'Budi Santoso', gender: 'Male', age: 36, phone: '+628123', national_id: '3171012345670001', birth_date: '1990-05-15', address: 'Jl. Sudirman No. 45', email: 'budi@gmail.com', blood_type: 'O+', allergy: 'Penicillin', disease_history: 'Hypertension Stage 1', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
      consultation_id: 1,
      visit_date: '2026-08-07',
      diagnosis: 'Essential (primary) hypertension stage 1',
      icd10_code: 'I10',
      soap_summary: 'S: Sakit kepala hebat sejak 2 hari dan pusing berputar. O: TD 145/95 mmHg, Nadi 82x/mnt, Temp 36.6 C. A: Hipertensi Primer Derajat 1. P: Amlodipine 10mg 1x1 sesudah makan pagi, Paracetamol 500mg 3x1 jika nyeri.',
      prescription_summary: 'Amlodipine 10mg (10 tabs), Paracetamol 500mg (10 tabs)',
      lab_summary: 'Pemeriksaan Profil Lipid & Kreatinin Darah direkomendasikan minggu depan',
      total_cost: 282700,
      created_at: '2026-08-07T09:30:00Z',
    },
    {
      id: 2,
      record_number: 'MR-APT-20260807-002',
      appointment_id: 2,
      appointment_number: 'APT-20260807-002',
      patient_id: 2,
      patient: { id: 2, patient_number: 'PAT-20260807-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '+628198', national_id: '3171012345670002', birth_date: '1995-11-20', address: 'Jl. Gatot Subroto No. 12', email: 'siti@gmail.com', blood_type: 'A+', allergy: 'Tidak Ada', disease_history: 'Asma Bronkial', current_complaint: '', emergency_contact: '' },
      doctor_id: 2,
      doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Spesialis Anak', gender: 'Female', phone: '', email: '', practice_license_number: 'SIP.456/KK/2024', education: '', practice_room: 'Ruang 102 (Poli Anak)', active_status: true },
      consultation_id: 2,
      visit_date: '2026-08-07',
      diagnosis: 'Acute Asthma Exacerbation',
      icd10_code: 'J45.901',
      soap_summary: 'S: Sesak napas kambuh saat cuaca dingin disertai batuk berdahak. O: Wheezing (+) di kedua lapang paru, RR 26x/mnt. A: Serangan Asma Akut. P: Nebulizer Ventolin 1 sesi di klinik, resep Amoxicillin 500mg 3x1.',
      prescription_summary: 'Amoxicillin 500mg (15 caps)',
      lab_summary: 'Tes Fungsi Paru (Spirometri) dijadwalkan ulang',
      total_cost: 252500,
      created_at: '2026-08-07T10:15:00Z',
    },
    {
      id: 3,
      record_number: 'MR-APT-20260806-001',
      appointment_id: 3,
      appointment_number: 'APT-20260806-001',
      patient_id: 3,
      patient: { id: 3, patient_number: 'PAT-20260807-003', full_name: 'Ahmad Hidayat', gender: 'Male', age: 41, phone: '+62817', national_id: '3171012345670003', birth_date: '1985-02-10', address: 'Jl. Kebon Jeruk No. 88', email: 'ahmad@gmail.com', blood_type: 'B+', allergy: 'Seafood', disease_history: 'Gastritis', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
      consultation_id: 3,
      visit_date: '2026-08-06',
      diagnosis: 'Gastritis & Acid Reflux Disease',
      icd10_code: 'K29.7',
      soap_summary: 'S: Nyeri ulu hati menekan dan mual sesudah makan. O: Nyeri tekan epigastrium (+), BU (+) normal. A: Gastritis Akut. P: Omeprazole 20mg 2x1 sebelum makan.',
      prescription_summary: 'Omeprazole 20mg (14 caps)',
      lab_summary: 'Evaluasi Endoskopi jika keluhan berlanjut 2 minggu',
      total_cost: 220000,
      created_at: '2026-08-06T11:00:00Z',
    },
    {
      id: 4,
      record_number: 'MR-APT-20260722-001',
      appointment_id: 5,
      appointment_number: 'APT-20260722-001',
      patient_id: 5,
      patient: { id: 5, patient_number: 'PAT-005', full_name: 'Rudi Hermawan', gender: 'Male', age: 45, phone: '+628129', national_id: '3171012345670005', birth_date: '1981-03-08', address: 'Jl. Ahmad Yani No. 15', email: 'rudi@gmail.com', blood_type: 'O+', allergy: 'Tidak Ada', disease_history: 'Diabetes Mellitus Tipe 2', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
      consultation_id: 5,
      visit_date: '2026-07-22',
      diagnosis: 'Non-insulin-dependent diabetes mellitus',
      icd10_code: 'E11.9',
      soap_summary: 'S: Badan lemas & sering haus saat malam. O: GDS 210 mg/dL, TD 130/80 mmHg. A: DM Tipe 2 Terkontrol Sebagian. P: Metformin 500mg 2x1 bersama makan.',
      prescription_summary: 'Metformin 500mg (30 tabs)',
      lab_summary: 'Cek HbA1c & Fungsi Ginjal (Ureum/Kreatinin) direkomendasikan',
      total_cost: 324500,
      created_at: '2026-07-22T10:00:00Z',
    },
    {
      id: 5,
      record_number: 'MR-APT-20260710-002',
      appointment_id: 6,
      appointment_number: 'APT-20260710-002',
      patient_id: 6,
      patient: { id: 6, patient_number: 'PAT-006', full_name: 'Eka Putri', gender: 'Female', age: 24, phone: '+628177', national_id: '3171012345670006', birth_date: '2002-09-14', address: 'Jl. Margonda Raya No. 4', email: 'eka@gmail.com', blood_type: 'A+', allergy: 'Sulfa', disease_history: 'Flu & ISPA', current_complaint: '', emergency_contact: '' },
      doctor_id: 2,
      doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Spesialis Anak', gender: 'Female', phone: '', email: '', practice_license_number: 'SIP.456/KK/2024', education: '', practice_room: 'Ruang 102 (Poli Anak)', active_status: true },
      consultation_id: 6,
      visit_date: '2026-07-10',
      diagnosis: 'Acute upper respiratory infection (ISPA)',
      icd10_code: 'J06.9',
      soap_summary: 'S: Batuk kering, tenggorokan gatal, demam 37.8 C. O: Faring hiperemis (+), Suhu 37.8 C. A: ISPA Akut. P: Paracetamol 500mg 3x1 & Vitamin C.',
      prescription_summary: 'Paracetamol 500mg (10 tabs), Vitamin C (10 tabs)',
      lab_summary: 'Istirahat cukup dan minum air putih hangat 2 Liter/hari',
      total_cost: 247500,
      created_at: '2026-07-10T15:15:00Z',
    },
    {
      id: 6,
      record_number: 'MR-APT-20260618-001',
      appointment_id: 7,
      appointment_number: 'APT-20260618-001',
      patient_id: 7,
      patient: { id: 7, patient_number: 'PAT-007', full_name: 'Bambang Utomo', gender: 'Male', age: 52, phone: '+628133', national_id: '3171012345670007', birth_date: '1974-01-25', address: 'Jl. Diponegoro No. 8', email: 'bambang@gmail.com', blood_type: 'B+', allergy: 'Tidak Ada', disease_history: 'Kolesterol Tinggi', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
      consultation_id: 7,
      visit_date: '2026-06-18',
      diagnosis: 'Pure hypercholesterolemia',
      icd10_code: 'E78.0',
      soap_summary: 'S: Tengkuk pegal dan berat sesudah makan gorengan. O: Kolesterol Total 240 mg/dL. A: Hiperkolesterolemia. P: Simvastatin 20mg 1x1 malam.',
      prescription_summary: 'Simvastatin 20mg (30 tabs)',
      lab_summary: 'Evaluasi Profil Lipid lengkap (HDL, LDL, Trigliserida) bulan depan',
      total_cost: 379500,
      created_at: '2026-06-18T11:30:00Z',
    },
    {
      id: 7,
      record_number: 'MR-APT-20260515-001',
      appointment_id: 9,
      appointment_number: 'APT-20260515-001',
      patient_id: 9,
      patient: { id: 9, patient_number: 'PAT-009', full_name: 'Hendra Wijaya', gender: 'Male', age: 34, phone: '+628144', national_id: '3171012345670009', birth_date: '1992-06-18', address: 'Jl. Sen Sen No. 12', email: 'hendra@gmail.com', blood_type: 'AB+', allergy: 'Tidak Ada', disease_history: 'Dermatitis', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
      consultation_id: 9,
      visit_date: '2026-05-15',
      diagnosis: 'Allergic contact dermatitis',
      icd10_code: 'L23.9',
      soap_summary: 'S: Gatal kemerahan di lengan kanan setelah terpapar debu. O: Lesi eritema (+), papul (+). A: Dermatitis Kontak Alergi. P: Cetirizine 10mg 1x1 & Salep Hydrocortisone.',
      prescription_summary: 'Cetirizine 10mg (10 tabs), Hydrocortisone Salep 1%',
      lab_summary: 'Hindari kontak dengan alergen debu & pembersih kimia kuat',
      total_cost: 297000,
      created_at: '2026-05-15T14:00:00Z',
    },
    {
      id: 8,
      record_number: 'MR-APT-20260410-001',
      appointment_id: 10,
      appointment_number: 'APT-20260410-001',
      patient_id: 10,
      patient: { id: 10, patient_number: 'PAT-010', full_name: 'Maya Indah', gender: 'Female', age: 27, phone: '+628111', national_id: '3171012345670010', birth_date: '1999-12-05', address: 'Jl. Palmerah No. 3', email: 'maya@gmail.com', blood_type: 'O+', allergy: 'Seafood', disease_history: 'Anemia Defisiensi Besi', current_complaint: '', emergency_contact: '' },
      doctor_id: 1,
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Spesialis Penyakit Dalam', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Ruang 101 (Poli Dalam)', active_status: true },
      consultation_id: 10,
      visit_date: '2026-04-10',
      diagnosis: 'Iron deficiency anemia',
      icd10_code: 'D50.9',
      soap_summary: 'S: Wajah pucat & sering pusing saat berdiri mendadak. O: Konjungtiva anemis (+/+), Hb 10.2 g/dL. A: Anemia Defisiensi Besi. P: Sangobion 1x1 sesudah makan.',
      prescription_summary: 'Sangobion / Tablet Tambah Darah (30 tabs)',
      lab_summary: 'Pemeriksaan Darah Lengkap (DPL) ulang dalam 1 bulan',
      total_cost: 324500,
      created_at: '2026-04-10T10:30:00Z',
    },
  ]);

  const fetchRecords = async () => {
    try {
      const res = await apiClient.get('/medical-records');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setRecords(res.data.data);
      }
    } catch (err) {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Strictly filter medical records for Patient role vs Staff/Admin
  const displayRecords = isPatientRole
    ? records.filter(
        (mr) =>
          (user?.id && (mr.patient?.user_id === user.id || mr.patient_id === user.id)) ||
          (user?.email && mr.patient?.email === user.email) ||
          (user?.full_name && mr.patient?.full_name.toLowerCase() === user.full_name.toLowerCase())
      )
    : records;

  const filteredRecords = displayRecords
    .filter((mr) => {
      // 1. Text Search
      const matchesSearch =
        mr.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
        mr.icd10_code.toLowerCase().includes(search.toLowerCase()) ||
        mr.record_number.toLowerCase().includes(search.toLowerCase()) ||
        mr.appointment_number?.toLowerCase().includes(search.toLowerCase()) ||
        mr.patient?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        mr.patient?.national_id?.includes(search) ||
        mr.doctor?.name.toLowerCase().includes(search.toLowerCase()) ||
        mr.soap_summary.toLowerCase().includes(search.toLowerCase()) ||
        (mr.prescription_summary && mr.prescription_summary.toLowerCase().includes(search.toLowerCase()));

      // 2. Doctor Filter
      const matchesDoctor =
        selectedDoctorFilter === 'All' ||
        mr.doctor?.name === selectedDoctorFilter ||
        (mr.doctor_id && mr.doctor_id === Number(selectedDoctorFilter));

      // 3. ICD-10 Diagnosis Category Filter
      const matchesDiagnosis =
        selectedDiagnosisFilter === 'All' ||
        mr.icd10_code.startsWith(selectedDiagnosisFilter) ||
        mr.diagnosis.toLowerCase().includes(selectedDiagnosisFilter.toLowerCase());

      // 4. Date Range Filter
      let matchesDate = true;
      const recordDate = mr.visit_date || mr.created_at.slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);

      if (dateFilterMode === 'today') {
        matchesDate = recordDate === today;
      } else if (dateFilterMode === 'this_month') {
        matchesDate = recordDate.slice(0, 7) === today.slice(0, 7);
      } else if (dateFilterMode === 'custom') {
        if (startDate && recordDate < startDate) matchesDate = false;
        if (endDate && recordDate > endDate) matchesDate = false;
      }

      return matchesSearch && matchesDoctor && matchesDiagnosis && matchesDate;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof MedicalRecord] || '';
      let bVal: any = b[sortField as keyof MedicalRecord] || '';

      if (sortField === 'patient_name') {
        aVal = a.patient?.full_name || '';
        bVal = b.patient?.full_name || '';
      } else if (sortField === 'doctor_name') {
        aVal = a.doctor?.name || '';
        bVal = b.doctor?.name || '';
      }

      if (typeof aVal === 'string') {
        const res = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? res : -res;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const resetAllFilters = () => {
    setSearch('');
    setSelectedDoctorFilter('All');
    setSelectedDiagnosisFilter('All');
    setDateFilterMode('all');
    setStartDate('');
    setEndDate('');
  };

  // Doctor Options for Dropdown
  const uniqueDoctors = Array.from(new Set(records.map((r) => r.doctor?.name).filter(Boolean)));

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar & Quick Metrics Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden hidden sm:flex">
            {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
              <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
            ) : (
              <History className="w-8 h-8 text-sky-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Electronic Medical Record (EMR)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white pt-1">
              <HeartPulse className="w-8 h-8 text-sky-400" />
              {isPatientRole ? 'Arsip Rekam Medis Saya' : 'Pusat Master Rekam Medis Klinik'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isPatientRole
                ? 'Riwayat pemeriksaan kesehatan pribadi, diagnosa ICD-10 resmi, ringkasan SOAP dokter, dan riwayat resep obat Anda.'
                : 'Pencarian & audit arsip rekam medis terenkripsi, terintegrasi dengan ICD-10, SOAP dokter, dan proteksi integritas audit data.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Arsip</span>
            <span className="text-lg font-extrabold text-sky-400 font-mono">{filteredRecords.length} Medis</span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Proteksi Audit</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Soft Delete
            </span>
          </div>
        </div>
      </div>

      {/* Patient Privacy Notice */}
      {isPatientRole && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-3 shadow-xs">
          <UserCheck className="w-5 h-5 shrink-0 text-sky-500" />
          <div>
            <span className="font-bold block text-sm">Kerahasiaan Rekam Medis Terjamin & Aman</span>
            <p className="text-xs opacity-90 leading-relaxed mt-0.5">Sesuai Peraturan Kemenkes RI, rekam medis pasien tersimpan secara sah dan terenkripsi. Hanya Anda dan dokter spesialis pemeriksa yang berwenang mengakses data ini.</p>
          </div>
        </div>
      )}

      {/* MULTI-FILTER & SEARCH SUITE PANEL */}
      <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm bg-white dark:bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-500" /> Pencarian & Filter Cerdas Rekam Medis
          </h3>
          <button
            onClick={resetAllFilters}
            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-500" /> Reset Filter
          </button>
        </div>

        {/* Row 1: Main Search Input & Doctor Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No. RM (MR-xxx), Nama Pasien, NIK KTP, Nama Dokter, Kode ICD-10, Diagnosa..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-sky-500 transition shadow-xs"
            />
          </div>

          <div>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-sky-500 transition shadow-xs"
            >
              <option value="All">Semua Dokter Pemeriksa ({uniqueDoctors.length})</option>
              {uniqueDoctors.map((docName, idx) => (
                <option key={idx} value={docName as string}>
                  {docName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: ICD-10 Category & Date Filter Quick Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 items-center">
          <div>
            <select
              value={selectedDiagnosisFilter}
              onChange={(e) => setSelectedDiagnosisFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-sky-500 transition shadow-xs"
            >
              <option value="All">Semua Diagnosa / Kategori ICD-10</option>
              <option value="I10">I10 - Hipertensi / Kardiovaskular</option>
              <option value="J45">J45 - Asma / Saluran Pernapasan</option>
              <option value="K29">K29 - Gastritis / Lambung & Maag</option>
              <option value="E11">E11 - Diabetes Mellitus Tipe 2</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-sky-500" /> Tgl Berobat:
            </span>
            <button
              onClick={() => setDateFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'all'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Semua Waktu
            </button>
            <button
              onClick={() => setDateFilterMode('today')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'today'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilterMode('this_month')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'this_month'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setDateFilterMode('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dateFilterMode === 'custom'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Rentang Tanggal
            </button>
          </div>
        </div>

        {/* Row 3: Custom Date Inputs */}
        {dateFilterMode === 'custom' && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-semibold">Mulai:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none"
            />
            <span className="text-slate-500 font-semibold">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* MEDICAL RECORDS TABLE */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900/90">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Menampilkan <span className="text-sky-600 font-extrabold">{filteredRecords.length}</span> dari {records.length} Arsip Rekam Medis
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider select-none border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort('record_number')}
                  className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>No. Rekam Medis</span>
                    {sortField === 'record_number' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('visit_date')}
                  className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tanggal Kunjungan</span>
                    {sortField === 'visit_date' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('patient_name')}
                  className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Pasien & NIK</span>
                    {sortField === 'patient_name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('doctor_name')}
                  className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Dokter Pemeriksa</span>
                    {sortField === 'doctor_name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-500" /> : <ArrowDown className="w-3 h-3 text-teal-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('diagnosis')}
                  className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Diagnosa Medis (ICD-10)</span>
                    {sortField === 'diagnosis' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-rose-500" /> : <ArrowDown className="w-3 h-3 text-rose-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                    )}
                  </div>
                </th>

                <th className="py-4 px-4">Ringkasan Medis (SOAP)</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredRecords.map((mr) => (
                <tr key={mr.id} className="hover:bg-sky-500/10 cursor-pointer transition" onClick={() => setSelectedRecord(mr)}>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-extrabold text-xs border border-sky-500/20">
                      {mr.record_number}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" /> {formatDateIndonesian(mr.visit_date)}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {mr.patient?.full_name}
                    </div>
                    {mr.patient?.national_id && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">NIK: {mr.patient.national_id}</span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-bold text-teal-600 dark:text-teal-400">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-500" /> {mr.doctor?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{mr.doctor?.specialization}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-[10px] border border-rose-500/20">
                        {mr.icd10_code}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{mr.diagnosis}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-500 max-w-xs truncate font-medium">
                    {mr.soap_summary}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(mr);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition flex items-center gap-1.5 justify-end ml-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MEDICAL RECORD MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Clinic Letterhead */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden">
                  {clinicLogoIcon && (clinicLogoIcon.startsWith('/') || clinicLogoIcon.startsWith('http') || clinicLogoIcon.startsWith('data:')) ? (
                    <img src={clinicLogoIcon} alt="Logo" className="w-full h-full object-contain max-w-full max-h-full" />
                  ) : (
                    <History className="w-6 h-6 text-sky-500" />
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">{clinicName}</h1>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> {clinicAddress}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-4 pt-0.5">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-sky-500" /> Telp/WA: <strong>{contactPhone}</strong></span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-teal-500" /> Email: <strong>{contactEmail}</strong></span>
              </p>
            </div>

            {/* Document Header & Patient Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono uppercase">
                    {selectedRecord.record_number}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                    Kunjungan: {formatDateIndonesian(selectedRecord.visit_date)}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
                  Pasien: {selectedRecord.patient?.full_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  NIK: {selectedRecord.patient?.national_id} | Umur: {selectedRecord.patient?.age} thn | Gol. Darah: {selectedRecord.patient?.blood_type}
                </p>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">DOKTER EXAMINER</span>
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 block mt-0.5">
                  {selectedRecord.doctor?.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SIP: {selectedRecord.doctor?.practice_license_number || 'SIP.123/KK/2024'}</span>
              </div>
            </div>

            {/* Medical Breakdown Grid (Diagnosis, SOAP, Prescription, Lab) */}
            <div className="space-y-4 text-xs">
              {/* Diagnosis Box */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="font-extrabold text-rose-700 dark:text-rose-400 text-xs uppercase tracking-wider block">Diagnosa Utama (ICD-10):</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-extrabold text-xs">
                    {selectedRecord.icd10_code}
                  </span>
                  <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">{selectedRecord.diagnosis}</span>
                </div>
              </div>

              {/* SOAP Medical Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-sky-600 dark:text-sky-400 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <Stethoscope className="w-4 h-4 text-sky-500" /> Ringkasan Hasil Pemeriksaan Medis Dokter (SOAP):
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap pt-1">
                  {selectedRecord.soap_summary}
                </p>
              </div>

              {/* Prescription & Lab Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRecord.prescription_summary && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-1.5">
                    <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Pill className="w-4 h-4 text-emerald-500" /> Resep Obat Farmasi (E-Prescription):
                    </span>
                    <p className="font-bold text-xs pt-1">{selectedRecord.prescription_summary}</p>
                  </div>
                )}

                {selectedRecord.lab_summary && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-1.5">
                    <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <Activity className="w-4 h-4 text-amber-500" /> Rekomendasi Laboratorium & Penunjang:
                    </span>
                    <p className="font-bold text-xs pt-1">{selectedRecord.lab_summary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Award className="w-4 h-4 text-emerald-500" /> Terverifikasi oleh Dokter: <strong>{selectedRecord.doctor?.name}</strong>
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
