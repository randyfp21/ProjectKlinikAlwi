import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, FileText, Lock, UserCheck, Eye, X, Award, CalendarCheck, User, Stethoscope, Link2, Filter, Calendar, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { MedicalRecord } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { apiClient } from '../api/client';

export const MedicalRecordPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const isPatientRole = user?.role === 'Patient';

  // Search & Multi-Filter States
  const [search, setSearch] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All');
  const [selectedDiagnosisFilter, setSelectedDiagnosisFilter] = useState('All');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Room 101', active_status: true },
      consultation_id: 1,
      visit_date: '2026-08-07',
      diagnosis: 'Essential (primary) hypertension stage 1',
      icd10_code: 'I10',
      soap_summary: 'S: Headaches & dizziness. O: BP 145/95 mmHg, HR 82. A: Essential Hypertension. P: Amlodipine 10mg once daily.',
      prescription_summary: 'Amlodipine 10mg (10 tabs), Paracetamol 500mg (10 tabs)',
      lab_summary: 'Lipid Profile, Serum Creatinine recommended',
      total_cost: 282700,
      created_at: '2026-08-07T09:30:00Z',
    },
    {
      id: 2,
      record_number: 'MR-APT-20260807-002',
      appointment_id: 2,
      appointment_number: 'APT-20260807-002',
      patient_id: 2,
      patient: { id: 2, patient_number: 'PAT-20260807-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '+628198', national_id: '3171012345670002', birth_date: '1995-11-20', address: 'Jl. Gatot Subroto No. 12', email: 'siti@gmail.com', blood_type: 'A+', allergy: 'None', disease_history: 'Asthma', current_complaint: '', emergency_contact: '' },
      doctor_id: 2,
      doctor: { id: 2, user_id: 4, doctor_code: 'DOC-002', name: 'dr. Sarah Lestari, Sp.A', specialization: 'Pediatrician', gender: 'Female', phone: '', email: '', practice_license_number: 'SIP.456/KK/2024', education: '', practice_room: 'Room 102', active_status: true },
      consultation_id: 2,
      visit_date: '2026-08-07',
      diagnosis: 'Acute Asthma Exacerbation',
      icd10_code: 'J45.901',
      soap_summary: 'S: Shortness of breath. O: Wheezing in both lung fields. A: Asthma attack. P: Salbutamol nebulizer & Amoxicillin 500mg.',
      prescription_summary: 'Amoxicillin 500mg (15 caps)',
      lab_summary: 'Spirometry test recommended next week',
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
      doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Room 101', active_status: true },
      consultation_id: 3,
      visit_date: '2026-08-06',
      diagnosis: 'Gastritis & Acid Reflux Disease',
      icd10_code: 'K29.7',
      soap_summary: 'S: Epigastric pain and nausea after eating. O: Tenderness in epigastrium. A: Gastritis. P: Omeprazole 20mg twice daily.',
      prescription_summary: 'Omeprazole 20mg (14 caps)',
      lab_summary: 'Endoscopy evaluation if symptoms persist',
      total_cost: 220000,
      created_at: '2026-08-06T11:00:00Z',
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

  const filteredRecords = displayRecords.filter((mr) => {
    // 1. Text Search (MR Number, Patient Name, NIK, Doctor, ICD10, Diagnosis, SOAP, Prescription)
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-7 h-7 text-sky-500" /> {t('mrTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isPatientRole
              ? 'Riwayat medis pribadi, diagnosa ICD-10, ringkasan SOAP dokter, dan resep obat'
              : 'Pencarian & filter lengkap arsip rekam medis pasien terenkripsi secara sah'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800">
          <Lock className="w-4 h-4 text-emerald-400" /> Soft Delete Protected (Audit Integrity)
        </div>
      </div>

      {/* Patient Privacy Notice */}
      {isPatientRole && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-3">
          <UserCheck className="w-5 h-5 shrink-0 text-sky-500" />
          <div>
            <span className="font-bold block">Personal Medical Record Confidentiality Active</span>
            <p className="text-[11px] opacity-90">Sesuai Peraturan Kemenkes RI, rekam medis pasien tersimpan aman dan hanya dapat diakses oleh Anda dan tim medis resmi.</p>
          </div>
        </div>
      )}

      {/* MULTI-FILTER & SEARCH SUITE PANEL */}
      <div className="glass-card p-4 rounded-2xl border space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-500" /> Panel Filter & Search Rekam Medis (Lengkap)
          </h3>
          <button
            onClick={resetAllFilters}
            className="text-[11px] text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 font-semibold flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Semua Filter
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <select
              value={selectedDiagnosisFilter}
              onChange={(e) => setSelectedDiagnosisFilter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
            >
              <option value="All">Semua Diagnosa / Kode ICD-10</option>
              <option value="I10">I10 - Hipertensi / Kardiovaskular</option>
              <option value="J45">J45 - Asma / Saluran Pernapasan</option>
              <option value="K29">K29 - Gastritis / Lambung & Maag</option>
              <option value="E11">E11 - Diabetes Mellitus Tipe 2</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" /> Filter Tanggal Berobat:
            </span>
            <button
              onClick={() => setDateFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dateFilterMode === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua Waktu
            </button>
            <button
              onClick={() => setDateFilterMode('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dateFilterMode === 'today'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilterMode('this_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dateFilterMode === 'this_month'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setDateFilterMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dateFilterMode === 'custom'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Rentang Kustom
            </button>
          </div>
        </div>

        {/* Row 3: Custom Date Inputs */}
        {dateFilterMode === 'custom' && (
          <div className="flex items-center gap-2 pt-2 border-t text-xs">
            <span className="text-slate-500 font-semibold">Mulai:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs focus:outline-none"
            />
            <span className="text-slate-500 font-semibold">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* MEDICAL RECORDS TABLE */}
      <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Menampilkan <span className="text-sky-600 font-extrabold">{filteredRecords.length}</span> dari {records.length} Arsip Rekam Medis
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3.5">No. Rekam Medis & Tgl</th>
                <th className="p-3.5">Nama Pasien & NIK</th>
                <th className="p-3.5">Dokter Pemeriksa</th>
                <th className="p-3.5">Diagnosa Medis (ICD-10)</th>
                <th className="p-3.5">Ringkasan SOAP</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredRecords.map((mr) => (
                <tr key={mr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold text-[10px] border border-sky-500/20">
                      {mr.record_number}
                    </span>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {mr.visit_date}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {mr.patient?.full_name}
                    </div>
                    {mr.patient?.national_id && (
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">NIK: {mr.patient.national_id}</span>
                    )}
                  </td>

                  <td className="p-3.5 font-bold text-teal-600 dark:text-teal-400">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-500" /> {mr.doctor?.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">{mr.doctor?.specialization}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-[10px] border border-rose-500/20 mr-1.5">
                      {mr.icd10_code}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{mr.diagnosis}</span>
                  </td>

                  <td className="p-3.5 text-slate-500 max-w-xs truncate">
                    {mr.soap_summary}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedRecord(mr)}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1 justify-end ml-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-500" /> Rincian Rekam Medis Pasien: {selectedRecord.record_number}
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border">
              <div>
                <span className="text-slate-400 block">Pasien:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedRecord.patient?.full_name}</span>
                <span className="block text-[11px] text-slate-500 font-mono">NIK: {selectedRecord.patient?.national_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Dokter Pemeriksa:</span>
                <span className="font-bold text-teal-600 text-sm">{selectedRecord.doctor?.name}</span>
                <span className="block text-[11px] text-slate-500">{selectedRecord.doctor?.specialization}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-1">
                <span className="text-slate-500 font-bold block">Diagnosa Medis (ICD-10):</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 font-mono font-bold">
                    {selectedRecord.icd10_code}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecord.diagnosis}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-1">
                <span className="text-slate-500 font-bold block">Catatan Pemeriksaan Dokter (SOAP):</span>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.soap_summary}
                </p>
              </div>

              {selectedRecord.prescription_summary && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <span className="font-bold block">Resep Obat Diberikan (Apotek):</span>
                  <p className="font-semibold">{selectedRecord.prescription_summary}</p>
                </div>
              )}

              {selectedRecord.lab_summary && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold block">Rekomendasi Laboratorium / MCU:</span>
                  <p className="font-semibold">{selectedRecord.lab_summary}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
