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
    items: [
      { id: 1, invoice_id: 1, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Alwi Shahab, Sp.PD', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 2, invoice_id: 1, item_type: 'Procedure', item_name: 'Physical Exam & Vital Signs (TTV)', quantity: 1, unit_price: 50000, subtotal: 50000 },
      { id: 3, invoice_id: 1, item_type: 'Medicine', item_name: 'Amlodipine 10mg (10 tabs)', quantity: 10, unit_price: 4500, subtotal: 45000 },
      { id: 4, invoice_id: 1, item_type: 'Medicine', item_name: 'Paracetamol 500mg (10 tabs)', quantity: 10, unit_price: 1200, subtotal: 12000 },
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
    items: [
      { id: 10, invoice_id: 2, item_type: 'Doctor Fee', item_name: 'Consultation - dr. Sarah Lestari, Sp.A', quantity: 1, unit_price: 150000, subtotal: 150000 },
      { id: 11, invoice_id: 2, item_type: 'Procedure', item_name: 'Nebulizer Therapy Session', quantity: 1, unit_price: 50000, subtotal: 50000 },
      { id: 12, invoice_id: 2, item_type: 'Medicine', item_name: 'Amoxicillin 500mg (15 caps)', quantity: 15, unit_price: 3500, subtotal: 52500 },
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
