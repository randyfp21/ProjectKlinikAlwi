import { create } from 'zustand';
import { Invoice } from '../types';
import { apiClient } from '../api/client';

interface InvoiceState {
  invoices: Invoice[];
  fetchInvoices: () => Promise<void>;
  addInvoice: (inv: Invoice) => void;
  payInvoice: (id: number, method: string) => Promise<void>;
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 1,
    invoice_number: 'INV-APT-20260807-001',
    patient_id: 1,
    patient: { id: 1, patient_number: 'PAT-001', full_name: 'Budi Santoso', gender: 'Male', age: 36, phone: '+628123', national_id: '3171012345670001', birth_date: '1990-05-15', address: 'Jl. Sudirman No. 45', email: 'budi@gmail.com', blood_type: 'O+', allergy: 'Penicillin', disease_history: 'Hypertension Stage 1', current_complaint: '', emergency_contact: '' },
    appointment_id: 1,
    consultation_id: 1,
    doctor_fee: 150000,
    procedure_fee: 50000,
    medicine_fee: 57000,
    discount: 0,
    tax: 25700,
    grand_total: 282700,
    payment_status: 'Pending',
    payment_method: 'Pending Cashier',
    created_at: '2026-08-07T09:30:00Z',
    subjective: 'Keluhan utama pasien: Sakit kepala hebat sejak 2 hari dan pusing berputar.',
    diagnosis: 'Essential (primary) hypertension stage 1',
    icd10_code: 'I10',
    plan: 'Amlodipine 10mg 1x1 sesudah makan pagi, Paracetamol 500mg 3x1 jika pusing/nyeri.',
    items: [
      { id: 1, invoice_id: 1, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 2, invoice_id: 1, item_type: 'Procedure', item_name: 'Physical Exam & Vital Signs (TTV)', quantity: 1, unit_price: 50000, subtotal: 50000 },
      { id: 3, invoice_id: 1, item_type: 'Medicine', item_name: 'Amlodipine 10mg (10 tabs)', quantity: 10, unit_price: 4500, subtotal: 45000, expiry_date: '2027-10-15' },
      { id: 4, invoice_id: 1, item_type: 'Medicine', item_name: 'Paracetamol 500mg (10 tabs)', quantity: 10, unit_price: 1200, subtotal: 12000, expiry_date: '2028-04-20' },
    ],
  },
  {
    id: 2,
    invoice_number: 'INV-APT-20260807-002',
    patient_id: 2,
    patient: { id: 2, patient_number: 'PAT-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '+628198', national_id: '3171012345670002', birth_date: '1995-11-20', address: 'Jl. Gatot Subroto No. 12', email: 'siti@gmail.com', blood_type: 'A+', allergy: 'None', disease_history: 'Asthma', current_complaint: '', emergency_contact: '' },
    appointment_id: 2,
    consultation_id: 2,
    doctor_fee: 150000,
    procedure_fee: 50000,
    medicine_fee: 52500,
    discount: 0,
    tax: 25250,
    grand_total: 277750,
    payment_status: 'Pending',
    payment_method: 'Pending Cashier',
    created_at: '2026-08-07T10:15:00Z',
    subjective: 'Keluhan utama pasien: Sesak napas kambuh saat cuaca dingin disertai batuk berdahak.',
    diagnosis: 'Acute Asthma Exacerbation',
    icd10_code: 'J45.901',
    plan: 'Terapi Nebulizer Ventolin di klinik, resep Amoxicillin 500mg 3x1 diminum hingga habis.',
    items: [
      { id: 10, invoice_id: 2, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Sarah Lestari, Sp.A', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 11, invoice_id: 2, item_type: 'Procedure', item_name: 'Nebulizer Therapy Session', quantity: 1, unit_price: 50000, subtotal: 50000 },
      { id: 12, invoice_id: 2, item_type: 'Medicine', item_name: 'Amoxicillin 500mg (15 caps)', quantity: 15, unit_price: 3500, subtotal: 52500, expiry_date: '2026-11-30' },
    ],
  },
  {
    id: 3,
    invoice_number: 'INV-APT-20260806-001',
    patient_id: 3,
    patient: { id: 3, patient_number: 'PAT-003', full_name: 'Ahmad Hidayat', gender: 'Male', age: 41, phone: '+62817', national_id: '3171012345670003', birth_date: '1985-02-10', address: 'Jl. Kebon Jeruk No. 88', email: 'ahmad@gmail.com', blood_type: 'B+', allergy: 'Seafood', disease_history: 'Gastritis', current_complaint: '', emergency_contact: '' },
    appointment_id: 3,
    consultation_id: 3,
    doctor_fee: 150000,
    procedure_fee: 35000,
    medicine_fee: 35000,
    discount: 0,
    tax: 22000,
    grand_total: 242000,
    payment_status: 'Paid',
    payment_method: 'QRIS Instant',
    created_at: '2026-08-06T11:00:00Z',
    paid_at: '2026-08-06T11:20:00Z',
    subjective: 'Keluhan utama pasien: Nyeri ulu hati menekan dan mual hebat sesudah makan.',
    diagnosis: 'Gastritis & Acid Reflux Disease',
    icd10_code: 'K29.7',
    plan: 'Omeprazole 20mg 2x1 diminum sebelum makan pagi dan malam.',
    items: [
      { id: 20, invoice_id: 3, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 21, invoice_id: 3, item_type: 'Procedure', item_name: 'Epigastric Palpation & Abdominal Exam', quantity: 1, unit_price: 35000, subtotal: 35000 },
      { id: 22, invoice_id: 3, item_type: 'Medicine', item_name: 'Omeprazole 20mg (14 caps)', quantity: 14, unit_price: 2500, subtotal: 35000, expiry_date: '2027-08-15' },
    ],
  },
  {
    id: 4,
    invoice_number: 'INV-APT-20260805-001',
    patient_id: 4,
    patient: { id: 4, patient_number: 'PAT-004', full_name: 'Dewi Lestari', gender: 'Female', age: 28, phone: '+628155', national_id: '3171012345670004', birth_date: '1998-04-12', address: 'Jl. Pemuda No. 10', email: 'dewi@gmail.com', blood_type: 'AB+', allergy: 'Tidak Ada', disease_history: 'Migraine', current_complaint: '', emergency_contact: '' },
    appointment_id: 4,
    consultation_id: 4,
    doctor_fee: 150000,
    procedure_fee: 40000,
    medicine_fee: 65000,
    discount: 0,
    tax: 25500,
    grand_total: 280500,
    payment_status: 'Paid',
    payment_method: 'Transfer Bank BCA',
    created_at: '2026-08-05T14:30:00Z',
    paid_at: '2026-08-05T14:50:00Z',
    subjective: 'Keluhan utama pasien: Nyeri kepala sebelah (migrain) sebelah kanan terasa berdenyut.',
    diagnosis: 'Migraine without aura',
    icd10_code: 'G43.0',
    plan: 'Ibuprofen 400mg 3x1 sesudah makan jika nyeri kambuh.',
    items: [
      { id: 30, invoice_id: 4, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 31, invoice_id: 4, item_type: 'Procedure', item_name: 'Neurological Vital Exam', quantity: 1, unit_price: 40000, subtotal: 40000 },
      { id: 32, invoice_id: 4, item_type: 'Medicine', item_name: 'Ibuprofen 400mg (10 tabs)', quantity: 10, unit_price: 6500, subtotal: 65000, expiry_date: '2028-01-10' },
    ],
  },

  // === HISTORICAL TRANSACTIONS: 1 MONTH AGO (JULY 2026) ===
  {
    id: 5,
    invoice_number: 'INV-APT-20260722-001',
    patient_id: 5,
    patient: { id: 5, patient_number: 'PAT-005', full_name: 'Rudi Hermawan', gender: 'Male', age: 45, phone: '+628129', national_id: '3171012345670005', birth_date: '1981-03-08', address: 'Jl. Ahmad Yani No. 15', email: 'rudi@gmail.com', blood_type: 'O+', allergy: 'Tidak Ada', disease_history: 'Diabetes Mellitus Tipe 2', current_complaint: '', emergency_contact: '' },
    appointment_id: 5,
    consultation_id: 5,
    doctor_fee: 150000,
    procedure_fee: 60000,
    medicine_fee: 85000,
    discount: 0,
    tax: 29500,
    grand_total: 324500,
    payment_status: 'Paid',
    payment_method: 'Kartu Debit Mandiri',
    created_at: '2026-07-22T10:00:00Z',
    paid_at: '2026-07-22T10:30:00Z',
    subjective: 'Keluhan utama pasien: Badan terasa lemas dan sering merasa haus saat malam hari.',
    diagnosis: 'Non-insulin-dependent diabetes mellitus',
    icd10_code: 'E11.9',
    plan: 'Metformin 500mg 2x1 diminum bersama makanan pagi dan malam.',
    items: [
      { id: 40, invoice_id: 5, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 41, invoice_id: 5, item_type: 'Procedure', item_name: 'Cek Gula Darah Sewaktu (GDS)', quantity: 1, unit_price: 60000, subtotal: 60000 },
      { id: 42, invoice_id: 5, item_type: 'Medicine', item_name: 'Metformin 500mg (30 tabs)', quantity: 30, unit_price: 2833, subtotal: 85000, expiry_date: '2027-11-20' },
    ],
  },
  {
    id: 6,
    invoice_number: 'INV-APT-20260710-002',
    patient_id: 6,
    patient: { id: 6, patient_number: 'PAT-006', full_name: 'Eka Putri', gender: 'Female', age: 24, phone: '+628177', national_id: '3171012345670006', birth_date: '2002-09-14', address: 'Jl. Margonda Raya No. 4', email: 'eka@gmail.com', blood_type: 'A+', allergy: 'Sulfa', disease_history: 'Flu & ISPA', current_complaint: '', emergency_contact: '' },
    appointment_id: 6,
    consultation_id: 6,
    doctor_fee: 150000,
    procedure_fee: 30000,
    medicine_fee: 45000,
    discount: 0,
    tax: 22500,
    grand_total: 247500,
    payment_status: 'Paid',
    payment_method: 'QRIS Instant',
    created_at: '2026-07-10T15:15:00Z',
    paid_at: '2026-07-10T15:35:00Z',
    subjective: 'Keluhan utama pasien: Batuk kering, tenggorokan gatal, dan demam 37.8 C sejak kemarin.',
    diagnosis: 'Acute upper respiratory infection (ISPA)',
    icd10_code: 'J06.9',
    plan: 'Paracetamol 500mg 3x1 dan CTM 4mg 2x1 saat gejala flu.',
    items: [
      { id: 50, invoice_id: 6, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Sarah Lestari, Sp.A', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 51, invoice_id: 6, item_type: 'Procedure', item_name: 'Pemeriksaan THT & Vital Signs', quantity: 1, unit_price: 30000, subtotal: 30000 },
      { id: 52, invoice_id: 6, item_type: 'Medicine', item_name: 'Paracetamol 500mg & Vitamin C', quantity: 1, unit_price: 45000, subtotal: 45000, expiry_date: '2028-03-15' },
    ],
  },

  // === HISTORICAL TRANSACTIONS: 2 MONTHS AGO (JUNE 2026) ===
  {
    id: 7,
    invoice_number: 'INV-APT-20260618-001',
    patient_id: 7,
    patient: { id: 7, patient_number: 'PAT-007', full_name: 'Bambang Utomo', gender: 'Male', age: 52, phone: '+628133', national_id: '3171012345670007', birth_date: '1974-01-25', address: 'Jl. Diponegoro No. 8', email: 'bambang@gmail.com', blood_type: 'B+', allergy: 'Tidak Ada', disease_history: 'Kolesterol Tinggi', current_complaint: '', emergency_contact: '' },
    appointment_id: 7,
    consultation_id: 7,
    doctor_fee: 150000,
    procedure_fee: 75000,
    medicine_fee: 120000,
    discount: 0,
    tax: 34500,
    grand_total: 379500,
    payment_status: 'Paid',
    payment_method: 'Tunai Kasir',
    created_at: '2026-06-18T11:30:00Z',
    paid_at: '2026-06-18T12:00:00Z',
    subjective: 'Keluhan utama pasien: Tengkuk pegal dan berat sesudah konsumsi makanan berlemak.',
    diagnosis: 'Pure hypercholesterolemia',
    icd10_code: 'E78.0',
    plan: 'Simvastatin 20mg 1x1 diminum malam hari sebelum tidur.',
    items: [
      { id: 60, invoice_id: 7, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 61, invoice_id: 7, item_type: 'Procedure', item_name: 'Tes Laboratorium Kolesterol Total', quantity: 1, unit_price: 75000, subtotal: 75000 },
      { id: 62, invoice_id: 7, item_type: 'Medicine', item_name: 'Simvastatin 20mg (30 tabs)', quantity: 30, unit_price: 4000, subtotal: 120000, expiry_date: '2027-09-30' },
    ],
  },
  {
    id: 8,
    invoice_number: 'INV-APT-20260604-002',
    patient_id: 8,
    patient: { id: 8, patient_number: 'PAT-008', full_name: 'Nurlaila Sari', gender: 'Female', age: 39, phone: '+628166', national_id: '3171012345670008', birth_date: '1987-07-03', address: 'Jl. Cikini Raya No. 90', email: 'nurlaila@gmail.com', blood_type: 'O+', allergy: 'Aspirin', disease_history: 'Maag Kronis', current_complaint: '', emergency_contact: '' },
    appointment_id: 8,
    consultation_id: 8,
    doctor_fee: 150000,
    procedure_fee: 35000,
    medicine_fee: 55000,
    discount: 0,
    tax: 24000,
    grand_total: 264000,
    payment_status: 'Paid',
    payment_method: 'QRIS Instant',
    created_at: '2026-06-04T09:15:00Z',
    paid_at: '2026-06-04T09:40:00Z',
    subjective: 'Keluhan utama pasien: Perut kembung dan sering bersendawa asam.',
    diagnosis: 'Gastro-esophageal reflux disease (GERD)',
    icd10_code: 'K21.9',
    plan: 'Lansoprazole 30mg 1x1 diminum pagi hari sebelum sarapan.',
    items: [
      { id: 70, invoice_id: 8, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 71, invoice_id: 8, item_type: 'Procedure', item_name: 'Pemeriksaan Epigastrium', quantity: 1, unit_price: 35000, subtotal: 35000 },
      { id: 72, invoice_id: 8, item_type: 'Medicine', item_name: 'Lansoprazole 30mg (14 caps)', quantity: 14, unit_price: 3928, subtotal: 55000, expiry_date: '2027-12-10' },
    ],
  },

  // === HISTORICAL TRANSACTIONS: 3 MONTHS AGO (MAY 2026) ===
  {
    id: 9,
    invoice_number: 'INV-APT-20260515-001',
    patient_id: 9,
    patient: { id: 9, patient_number: 'PAT-009', full_name: 'Hendra Wijaya', gender: 'Male', age: 34, phone: '+628144', national_id: '3171012345670009', birth_date: '1992-06-18', address: 'Jl. Sen Sen No. 12', email: 'hendra@gmail.com', blood_type: 'AB+', allergy: 'Tidak Ada', disease_history: 'Dermatitis', current_complaint: '', emergency_contact: '' },
    appointment_id: 9,
    consultation_id: 9,
    doctor_fee: 150000,
    procedure_fee: 50000,
    medicine_fee: 70000,
    discount: 0,
    tax: 27000,
    grand_total: 297000,
    payment_status: 'Paid',
    payment_method: 'Transfer Bank BNI',
    created_at: '2026-05-15T14:00:00Z',
    paid_at: '2026-05-15T14:25:00Z',
    subjective: 'Keluhan utama pasien: Gatal-gatal kemerahan di lengan kanan setelah terpapar debu.',
    diagnosis: 'Allergic contact dermatitis',
    icd10_code: 'L23.9',
    plan: 'Cetirizine 10mg 1x1 malam hari dan Salep Hydrocortisone 1% dioles tipis.',
    items: [
      { id: 80, invoice_id: 9, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 81, invoice_id: 9, item_type: 'Procedure', item_name: 'Skin Allergy Examination', quantity: 1, unit_price: 50000, subtotal: 50000 },
      { id: 82, invoice_id: 9, item_type: 'Medicine', item_name: 'Cetirizine 10mg & Salep Hydrocortisone', quantity: 1, unit_price: 70000, subtotal: 70000, expiry_date: '2028-05-01' },
    ],
  },

  // === HISTORICAL TRANSACTIONS: 4 MONTHS AGO (APRIL 2026) ===
  {
    id: 10,
    invoice_number: 'INV-APT-20260410-001',
    patient_id: 10,
    patient: { id: 10, patient_number: 'PAT-010', full_name: 'Maya Indah', gender: 'Female', age: 27, phone: '+628111', national_id: '3171012345670010', birth_date: '1999-12-05', address: 'Jl. Palmerah No. 3', email: 'maya@gmail.com', blood_type: 'O+', allergy: 'Seafood', disease_history: 'Anemia Defisiensi Besi', current_complaint: '', emergency_contact: '' },
    appointment_id: 10,
    consultation_id: 10,
    doctor_fee: 150000,
    procedure_fee: 65000,
    medicine_fee: 80000,
    discount: 0,
    tax: 29500,
    grand_total: 324500,
    payment_status: 'Paid',
    payment_method: 'QRIS Instant',
    created_at: '2026-04-10T10:30:00Z',
    paid_at: '2026-04-10T11:00:00Z',
    subjective: 'Keluhan utama pasien: Wajah pucat, sering pusing saat bangkit berdiri mendadak.',
    diagnosis: 'Iron deficiency anemia',
    icd10_code: 'D50.9',
    plan: 'Suplemen Sangobion / Ferrous Sulfate 1x1 sesudah makan.',
    items: [
      { id: 90, invoice_id: 10, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 91, invoice_id: 10, item_type: 'Procedure', item_name: 'Pemeriksaan Hemoglobin (Hb)', quantity: 1, unit_price: 65000, subtotal: 65000 },
      { id: 92, invoice_id: 10, item_type: 'Medicine', item_name: 'Sangobion / Tablet Tambah Darah (30s)', quantity: 30, unit_price: 2666, subtotal: 80000, expiry_date: '2028-06-30' },
    ],
  },
];

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: INITIAL_INVOICES,

  fetchInvoices: async () => {
    try {
      const res = await apiClient.get('/invoices');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        set({ invoices: res.data.data });
      }
    } catch (err) {
      // Keep local state if offline
    }
  },

  addInvoice: (inv: Invoice) => {
    set({ invoices: [inv, ...get().invoices] });
  },

  payInvoice: async (id: number, method: string) => {
    try {
      await apiClient.post(`/invoices/${id}/pay`, { payment_method: method });
    } catch (err) {
      // Ignore network errors for local state fallback
    }

    set({
      invoices: get().invoices.map((inv) =>
        inv.id === id
          ? { ...inv, payment_status: 'Paid', payment_method: method, paid_at: new Date().toISOString() }
          : inv
      ),
    });
  },
}));
