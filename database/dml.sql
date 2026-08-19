-- ==============================================================================
-- Klinik Alwi — Hospital Management System DML (Data Manipulation Language - Seed Data)
-- Password for all accounts: 'password123' (bcrypt hashed: $2a$10$w8T.N0bM9W0Z...)
-- Target RDBMS: PostgreSQL 16+
-- ==============================================================================

-- 1. Insert Initial Users
INSERT INTO users (id, username, email, password, full_name, role, phone, is_active) VALUES
(1, 'superadmin', 'superadmin@klinikalwi.id', '$2a$10$8K1p/a0dL1LXMIg0J0j0uO2v1W1zG6L2.y4N9a9n1u9W9W9W9W9W9', 'Super Administrator', 'Super Admin', '+6281234567890', true),
(2, 'admin', 'admin@klinikalwi.id', '$2a$10$8K1p/a0dL1LXMIg0J0j0uO2v1W1zG6L2.y4N9a9n1u9W9W9W9W9W9', 'Rina Wijaya (Admin)', 'Admin', '+6281234567891', true),
(3, 'doctor_alwi', 'alwi@klinikalwi.id', '$2a$10$8K1p/a0dL1LXMIg0J0j0uO2v1W1zG6L2.y4N9a9n1u9W9W9W9W9W9', 'dr. Alwi Shahab, Sp.PD', 'Doctor', '+6281234567892', true),
(4, 'doctor_sarah', 'sarah@klinikalwi.id', '$2a$10$8K1p/a0dL1LXMIg0J0j0uO2v1W1zG6L2.y4N9a9n1u9W9W9W9W9W9', 'dr. Sarah Lestari, Sp.A', 'Doctor', '+6281234567893', true),
(5, 'pharmacist', 'apt.andi@klinikalwi.id', '$2a$10$8K1p/a0dL1LXMIg0J0j0uO2v1W1zG6L2.y4N9a9n1u9W9W9W9W9W9', 'apt. Andi Pratama, S.Farm', 'Pharmacist', '+6281234567894', true),
(6, 'patient_budi', 'budi@gmail.com', '$2a$10$8K1p/a0dL1LXMIg0J0j0uO2v1W1zG6L2.y4N9a9n1u9W9W9W9W9W9', 'Budi Santoso', 'Patient', '+6281298765432', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Insert Doctors
INSERT INTO doctors (id, user_id, doctor_code, name, gender, phone, email, practice_license_number, specialization, education, practice_room, consultation_fee, active_status) VALUES
(1, 3, 'DOC-ALWI-001', 'dr. Alwi Shahab, Sp.PD', 'Laki-laki', '+6281234567892', 'alwi@klinikalwi.id', 'SIP.551/102.4/IDI/2022', 'Spesialis Penyakit Dalam', 'Spesialis Penyakit Dalam - Universitas Indonesia', 'Poliklinik Dalam 01', 175000.00, true),
(2, 4, 'DOC-SARAH-002', 'dr. Sarah Lestari, Sp.A', 'Perempuan', '+6281234567893', 'sarah@klinikalwi.id', 'SIP.449/801.2/IDI/2023', 'Spesialis Anak', 'Spesialis Anak - Universitas Gadjah Mada', 'Poliklinik Anak 02', 150000.00, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));

-- 3. Insert Doctor Schedules
INSERT INTO doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients, is_active) VALUES
(1, 1, 'Monday', '08:00', '12:00', 20, 15, true),
(2, 1, 'Wednesday', '08:00', '12:00', 20, 15, true),
(3, 1, 'Friday', '13:00', '17:00', 20, 15, true),
(4, 2, 'Tuesday', '09:00', '13:00', 20, 12, true),
(5, 2, 'Thursday', '09:00', '13:00', 20, 12, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('doctor_schedules_id_seq', (SELECT MAX(id) FROM doctor_schedules));

-- 4. Insert Patients
INSERT INTO patients (id, user_id, patient_number, national_id, full_name, gender, birth_date, age, address, phone, email, blood_type, allergy, disease_history, emergency_contact) VALUES
(1, 6, 'PAT-202608-001', '3174012003950001', 'Budi Santoso', 'Laki-laki', '1995-03-20', 31, 'Jl. Sudirman No. 45, Jakarta Selatan', '+6281298765432', 'budi@gmail.com', 'O', 'Seftriaxon, Debu', 'Hipertensi Ringan', 'Siti Aminah (Istri) - 081299998888'),
(2, NULL, 'PAT-202608-002', '3174051511880003', 'Siti Rahmawati', 'Perempuan', '1988-11-15', 37, 'Jl. Gatot Subroto No. 12, Jakarta Selatan', '+6285678901234', 'siti.rahma@yahoo.com', 'A', 'Tidak Ada', 'Maag Akut', 'Ahmad (Suami) - 085611112222'),
(3, NULL, 'PAT-202608-003', '3174090501180005', 'Dewi Lestari', 'Perempuan', '2018-01-05', 8, 'Jl. Melati No. 88, Kebayoran Baru', '+6287812345678', 'dewi.parents@gmail.com', 'B', 'Kacang Tanah', 'Asma Bronkial', 'Bapak Hendra (Ayah) - 087899887766')
ON CONFLICT (id) DO NOTHING;

SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- 5. Insert Medicine Categories
INSERT INTO medicine_categories (id, category_code, name, description) VALUES
(1, 'CAT-ANALGESIC', 'Analgesic & Antipyretic', 'Obat pereda nyeri dan penurun demam'),
(2, 'CAT-ANTIBIOTIC', 'Antibiotic', 'Obat infeksi bakteri dan antimikroba'),
(3, 'CAT-ANTIHYPERTENSIVE', 'Antihypertensive', 'Obat penurun tekanan darah tinggi'),
(4, 'CAT-GASTRO', 'Gastroprotective', 'Obat lambung, maag, dan asam lambung'),
(5, 'CAT-ANTIHISTAMINE', 'Antihistamine', 'Obat alergi dan gatal-gatal')
ON CONFLICT (id) DO NOTHING;

SELECT setval('medicine_categories_id_seq', (SELECT MAX(id) FROM medicine_categories));

-- 6. Insert Medicines
INSERT INTO medicines (id, category_id, medicine_code, name, category_name, manufacturer, unit, stock, min_stock, purchase_price, selling_price, expiry_date, batch_number, barcode) VALUES
(1, 1, 'MED-001', 'Paracetamol 500mg', 'Analgesic & Antipyretic', 'Kimia Farma', 'Tablet', 250, 50, 500.00, 1200.00, '2027-12-31', 'BATCH-2024-001', '8991001001001'),
(2, 2, 'MED-002', 'Amoxicillin 500mg', 'Antibiotic', 'Kalbe Farma', 'Capsule', 180, 30, 1500.00, 3500.00, '2026-10-15', 'BATCH-2024-002', '8991001001002'),
(3, 3, 'MED-003', 'Amlodipine 10mg', 'Antihypertensive', 'Dexa Medica', 'Tablet', 120, 20, 2000.00, 4500.00, '2027-06-30', 'BATCH-2024-003', '8991001001003'),
(4, 4, 'MED-004', 'Omeprazole 20mg', 'Gastroprotective', 'Sanbe Farma', 'Capsule', 8, 15, 3000.00, 7000.00, '2026-09-01', 'BATCH-2024-004', '8991001001004'),
(5, 5, 'MED-005', 'Cetirizine 10mg', 'Antihistamine', 'Phapros', 'Tablet', 95, 25, 800.00, 2000.00, '2027-03-20', 'BATCH-2024-005', '8991001001005')
ON CONFLICT (id) DO NOTHING;

SELECT setval('medicines_id_seq', (SELECT MAX(id) FROM medicines));

-- 7. Insert Clinic CMS Settings
INSERT INTO clinic_cms_settings (id, clinic_name, clinic_tagline, contact_phone, contact_email, clinic_address, hero_title, hero_subtitle, hero_badge) VALUES
(1, 'Klinik Utama Alwi', 'Layanan Kesehatan Modern, Cepat & Terpercaya', '+628-13-1100-103', 'info@klinikalwi.id', 'Jl. Jendral Sudirman No. 102, Jakarta Selatan, 12190', 'Solusi Kesehatan Keluarga Terpadu & Profesional', 'Klinik Utama Alwi menghadirkan pelayanan medis mutakhir dengan dukungan dokter spesialis senior, rekam medis digital, dan farmasi otomatis.', 'Fasilitas Medis Akreditasi Paripurna 2026')
ON CONFLICT (id) DO NOTHING;

SELECT setval('clinic_cms_settings_id_seq', (SELECT MAX(id) FROM clinic_cms_settings));

-- 8. Insert Audit Logs
INSERT INTO audit_logs (user_id, user_email, user_role, action, module, description, ip_address) VALUES
(1, 'superadmin@klinikalwi.id', 'Super Admin', 'SYSTEM_SEED', 'System', 'Database initialized with DDL and core enterprise DML seed data for Klinik Alwi HMS', '127.0.0.1');
