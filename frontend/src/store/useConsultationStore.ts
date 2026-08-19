import { create } from 'zustand';
import { Appointment } from '../types';

interface ConsultationState {
  waitingQueue: Appointment[];
  addPatientToQueue: (appointment: Appointment) => void;
  removePatientFromQueue: (appointmentId: number) => void;
}

const INITIAL_WAITING_QUEUE: Appointment[] = [
  {
    id: 1,
    appointment_number: 'APT-20260807-001',
    patient_id: 1,
    patient: { id: 1, patient_number: 'PAT-001', full_name: 'Budi Santoso', gender: 'Male', age: 36, phone: '+628123', national_id: '3171012345670001', birth_date: '1990-05-15', address: 'Jl. Sudirman No. 45', email: 'budi@gmail.com', blood_type: 'O+', allergy: 'Penicillin', disease_history: 'Hypertension Stage 1', current_complaint: 'Dizziness and chest pressure', emergency_contact: '' },
    doctor_id: 1,
    doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Room 101', active_status: true },
    appointment_date: '2026-08-07',
    time_slot: '09:00 - 09:20',
    queue_number: 1,
    status: 'Waiting',
    complaint: 'Feeling dizzy and chest pressure',
    notes: 'Hypertension checkup',
    created_at: '2026-08-07T08:00:00Z',
  },
  {
    id: 2,
    appointment_number: 'APT-20260807-002',
    patient_id: 2,
    patient: { id: 2, patient_number: 'PAT-002', full_name: 'Siti Rahma', gender: 'Female', age: 31, phone: '+628198', national_id: '3171012345670002', birth_date: '1995-11-20', address: 'Jl. Gatot Subroto No. 12', email: 'siti@gmail.com', blood_type: 'A+', allergy: 'None', disease_history: 'Asthma', current_complaint: 'Shortness of breath and cough', emergency_contact: '' },
    doctor_id: 1,
    doctor: { id: 1, user_id: 3, doctor_code: 'DOC-001', name: 'dr. Alwi Shahab, Sp.PD', specialization: 'Internal Medicine', gender: 'Male', phone: '', email: '', practice_license_number: 'SIP.123/KK/2024', education: '', practice_room: 'Room 101', active_status: true },
    appointment_date: '2026-08-07',
    time_slot: '09:20 - 09:40',
    queue_number: 2,
    status: 'Waiting',
    complaint: 'Shortness of breath and cough',
    notes: 'Asthma checkup',
    created_at: '2026-08-07T08:15:00Z',
  },
];

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  waitingQueue: INITIAL_WAITING_QUEUE,

  addPatientToQueue: (appointment: Appointment) => {
    set({
      waitingQueue: [...get().waitingQueue, appointment],
    });
  },

  removePatientFromQueue: (appointmentId: number) => {
    set({
      waitingQueue: get().waitingQueue.filter((app) => app.id !== appointmentId),
    });
  },
}));
