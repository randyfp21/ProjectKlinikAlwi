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
