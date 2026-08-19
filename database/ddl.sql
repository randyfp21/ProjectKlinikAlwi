-- ==============================================================================
-- Klinik Alwi — Hospital Management System DDL (Data Definition Language)
-- Target RDBMS: PostgreSQL 16+
-- ==============================================================================

-- Drop tables if exists (Cascade)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS medicine_categories CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS queues CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clinic_cms_settings CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- 2. Doctors Table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    doctor_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    practice_license_number VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    education VARCHAR(255),
    practice_room VARCHAR(50),
    consultation_fee DECIMAL(12,2) DEFAULT 150000.00,
    photo VARCHAR(255),
    active_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_deleted_at ON doctors(deleted_at);

-- 3. Doctor Schedules Table
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    slot_duration_minutes INT DEFAULT 20,
    max_patients INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);

-- 4. Patients Table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    patient_number VARCHAR(30) NOT NULL UNIQUE,
    national_id VARCHAR(30) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    birth_date VARCHAR(20) NOT NULL,
    age INT DEFAULT 0,
    address TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    blood_type VARCHAR(5),
    allergy TEXT,
    disease_history TEXT,
    current_complaint TEXT,
    emergency_contact VARCHAR(100),
    photo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_deleted_at ON patients(deleted_at);

-- 5. Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    appointment_number VARCHAR(30) NOT NULL UNIQUE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date VARCHAR(20) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    queue_number INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Waiting',
    complaint TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 6. Queues Table
CREATE TABLE queues (
    id SERIAL PRIMARY KEY,
    appointment_id INT UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    queue_number INT NOT NULL,
    queue_date VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'Waiting',
    estimated_time VARCHAR(20),
    called_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queues_patient_id ON queues(patient_id);
CREATE INDEX idx_queues_doctor_id ON queues(doctor_id);
CREATE INDEX idx_queues_date ON queues(queue_date);
CREATE INDEX idx_queues_status ON queues(status);

-- 7. Consultations Table
CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    appointment_id INT UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    visit_date VARCHAR(20) NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    diagnosis VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(30),
    treatment TEXT,
    medical_notes TEXT,
    lab_recommendation TEXT,
    next_visit_recommendation VARCHAR(20),
    doctor_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_visit_date ON consultations(visit_date);

-- 8. Medicine Categories Table
CREATE TABLE medicine_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_medicine_categories_name ON medicine_categories(name);

-- 9. Medicines Table
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES medicine_categories(id) ON DELETE SET NULL,
    medicine_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_name VARCHAR(50),
    manufacturer VARCHAR(100),
    unit VARCHAR(20) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    purchase_price DECIMAL(12,2) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    expiry_date VARCHAR(20) NOT NULL,
    batch_number VARCHAR(50),
    barcode VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX idx_medicines_deleted_at ON medicines(deleted_at);

-- 10. Prescriptions Table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    prescription_number VARCHAR(30) NOT NULL UNIQUE,
    consultation_id INT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'Pending',
    pharmacist_notes TEXT,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- 11. Prescription Items Table
CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id INT NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    instructions TEXT
);

CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);

-- 12. Invoices Table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
    consultation_id INT REFERENCES consultations(id) ON DELETE SET NULL,
    doctor_fee DECIMAL(12,2) DEFAULT 0.00,
    procedure_fee DECIMAL(12,2) DEFAULT 0.00,
    medicine_fee DECIMAL(12,2) DEFAULT 0.00,
    discount DECIMAL(12,2) DEFAULT 0.00,
    tax DECIMAL(12,2) DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Pending',
    payment_method VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);

-- 13. Invoice Items Table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 14. Medical Records Table
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    record_number VARCHAR(30) NOT NULL UNIQUE,
    appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
    appointment_number VARCHAR(30),
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    consultation_id INT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    visit_date VARCHAR(20) NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(30),
    soap_summary TEXT,
    prescription_summary TEXT,
    lab_summary TEXT,
    total_cost DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_deleted_at ON medical_records(deleted_at);

-- 15. Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    user_email VARCHAR(100),
    user_role VARCHAR(30),
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);

-- 16. Clinic CMS Settings Table
CREATE TABLE clinic_cms_settings (
    id SERIAL PRIMARY KEY,
    clinic_name VARCHAR(100) NOT NULL DEFAULT 'Klinik Utama Alwi',
    clinic_tagline VARCHAR(255) DEFAULT 'Layanan Kesehatan Modern, Cepat & Terpercaya',
    clinic_logo_icon VARCHAR(255),
    contact_phone VARCHAR(50) DEFAULT '+628-13-1100-103',
    contact_email VARCHAR(100) DEFAULT 'info@klinikalwi.id',
    clinic_address TEXT,
    hero_title VARCHAR(255),
    hero_subtitle TEXT,
    hero_badge VARCHAR(100),
    facilities_json TEXT,
    doctors_json TEXT,
    gallery_json TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
