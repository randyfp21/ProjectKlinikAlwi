export type UserRole = 'Super Admin' | 'Admin' | 'Doctor' | 'Pharmacist' | 'Patient';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  is_active: boolean;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  max_patients: number;
  is_active: boolean;
}

export interface Doctor {
  id: number;
  user_id: number;
  doctor_code: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  practice_license_number: string;
  specialization: string;
  education: string;
  practice_room: string;
  consultation_fee?: number;
  photo?: string;
  active_status: boolean;
  schedules?: DoctorSchedule[];
}

export interface Patient {
  id: number;
  user_id?: number;
  patient_number: string;
  national_id: string;
  full_name: string;
  gender: string;
  birth_date: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  blood_type: string;
  allergy: string;
  disease_history: string;
  current_complaint: string;
  emergency_contact: string;
  photo?: string;
}

export interface Appointment {
  id: number;
  appointment_number: string;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: 'Waiting' | 'Confirmed' | 'Completed' | 'Cancelled';
  complaint: string;
  notes: string;
  created_at: string;
}

export interface Queue {
  id: number;
  appointment_id: number;
  appointment?: Appointment;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  queue_number: number;
  queue_date: string;
  status: 'Waiting' | 'Called' | 'In Consultation' | 'Completed' | 'Skipped';
  estimated_time: string;
  called_at?: string;
  completed_at?: string;
}

export interface PrescriptionItem {
  id: number;
  prescription_id: number;
  medicine_id: number;
  medicine_name: string;
  dosage: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  instructions: string;
}

export interface Prescription {
  id: number;
  prescription_number: string;
  consultation_id: number;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  status: 'Pending' | 'Processing' | 'Dispensed' | 'Cancelled';
  pharmacist_notes?: string;
  items: PrescriptionItem[];
  dispensed_at?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_type: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  expiry_date?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  patient_id: number;
  patient?: Patient;
  appointment_id?: number;
  consultation_id?: number;
  doctor_fee: number;
  procedure_fee: number;
  medicine_fee: number;
  discount: number;
  tax: number;
  grand_total: number;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
  payment_method: string;
  paid_at?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface Consultation {
  id: number;
  appointment_id: number;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  visit_date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis: string;
  icd10_code: string;
  treatment: string;
  medical_notes: string;
  lab_recommendation: string;
  next_visit_recommendation: string;
  doctor_signature: string;
  prescription?: Prescription;
  invoice?: Invoice;
  created_at: string;
}

export interface MedicineCategory {
  id: number;
  category_code: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface Medicine {
  id: number;
  category_id?: number;
  category_name?: string;
  medicine_code: string;
  name: string;
  category: string;
  manufacturer: string;
  unit: string;
  stock: number;
  min_stock: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
  batch_number: string;
  barcode: string;
}

export interface MedicalRecord {
  id: number;
  record_number: string;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  appointment_id?: number;
  appointment_number?: string;
  consultation_id: number;
  visit_date: string;
  diagnosis: string;
  icd10_code: string;
  soap_summary: string;
  prescription_summary: string;
  lab_summary: string;
  total_cost: number;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_email: string;
  user_role: string;
  action: string;
  module: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface ReportsData {
  total_revenue: number;
  total_patients: number;
  total_appointments: number;
  total_medicines: number;
  low_stock_count: number;
  revenue_by_month: { month: string; revenue: number }[];
  top_diagnoses: { name: string; code: string; count: number }[];
}
