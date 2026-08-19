package seed

import (
	"log"
	"time"

	"backend/internal/domain"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB) error {
	log.Println("[Seeder] Starting database seeding...")

	// 1. Seed Users & Roles
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	strPassword := string(hashedPassword)

	users := []domain.User{
		{
			Username: "superadmin",
			Email:    "superadmin@klinikalwi.id",
			Password: strPassword,
			FullName: "Super Administrator",
			Role:     domain.RoleSuperAdmin,
			Phone:    "+6281234567890",
			IsActive: true,
		},
		{
			Username: "admin",
			Email:    "admin@klinikalwi.id",
			Password: strPassword,
			FullName: "Rina Wijaya (Admin)",
			Role:     domain.RoleAdmin,
			Phone:    "+6281234567891",
			IsActive: true,
		},
		{
			Username: "doctor_alwi",
			Email:    "alwi@klinikalwi.id",
			Password: strPassword,
			FullName: "dr. Alwi Shahab, Sp.PD",
			Role:     domain.RoleDoctor,
			Phone:    "+6281234567892",
			IsActive: true,
		},
		{
			Username: "doctor_sarah",
			Email:    "sarah@klinikalwi.id",
			Password: strPassword,
			FullName: "dr. Sarah Lestari, Sp.A",
			Role:     domain.RoleDoctor,
			Phone:    "+6281234567893",
			IsActive: true,
		},
		{
			Username: "pharmacist",
			Email:    "apt.andi@klinikalwi.id",
			Password: strPassword,
			FullName: "apt. Andi Pratama, S.Farm",
			Role:     domain.RolePharmacist,
			Phone:    "+6281234567894",
			IsActive: true,
		},
		{
			Username: "patient_budi",
			Email:    "budi@gmail.com",
			Password: strPassword,
			FullName: "Budi Santoso",
			Role:     domain.RolePatient,
			Phone:    "+6281234567895",
			IsActive: true,
		},
	}

	for _, u := range users {
		var count int64
		db.Model(&domain.User{}).Where("username = ?", u.Username).Count(&count)
		if count == 0 {
			db.Create(&u)
		}
	}

	// Fetch Created Users
	var doc1User, doc2User, pat1User domain.User
	db.Where("username = ?", "doctor_alwi").First(&doc1User)
	db.Where("username = ?", "doctor_sarah").First(&doc2User)
	db.Where("username = ?", "patient_budi").First(&pat1User)

	// 2. Seed Doctors
	doctors := []domain.Doctor{
		{
			UserID:                doc1User.ID,
			DoctorCode:            "DOC-001",
			Name:                  "dr. Alwi Shahab, Sp.PD",
			Gender:                "Male",
			Phone:                 "+6281234567892",
			Email:                 "alwi@klinikalwi.id",
			PracticeLicenseNumber: "SIP.123/KK/2024",
			Specialization:        "Internal Medicine (Penyakit Dalam)",
			Education:             "Universitas Indonesia - Spesialis Penyakit Dalam",
			PracticeRoom:          "Poliklinik A - Room 101",
			ActiveStatus:          true,
		},
		{
			UserID:                doc2User.ID,
			DoctorCode:            "DOC-002",
			Name:                  "dr. Sarah Lestari, Sp.A",
			Gender:                "Female",
			Phone:                 "+6281234567893",
			Email:                 "sarah@klinikalwi.id",
			PracticeLicenseNumber: "SIP.456/KK/2024",
			Specialization:        "Pediatrician (Spesialis Anak)",
			Education:             "Universitas Gadjah Mada - Spesialis Anak",
			PracticeRoom:          "Poliklinik B - Room 102",
			ActiveStatus:          true,
		},
	}

	for _, d := range doctors {
		var count int64
		db.Model(&domain.Doctor{}).Where("doctor_code = ?", d.DoctorCode).Count(&count)
		if count == 0 {
			db.Create(&d)
		}
	}

	// Fetch Doctors
	var doc1, doc2 domain.Doctor
	db.Where("doctor_code = ?", "DOC-001").First(&doc1)
	db.Where("doctor_code = ?", "DOC-002").First(&doc2)

	// 3. Seed Doctor Schedules
	days := []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}
	for _, day := range days {
		var count int64
		db.Model(&domain.DoctorSchedule{}).Where("doctor_id = ? AND day_of_week = ?", doc1.ID, day).Count(&count)
		if count == 0 {
			db.Create(&domain.DoctorSchedule{
				DoctorID:            doc1.ID,
				DayOfWeek:           day,
				StartTime:           "08:00",
				EndTime:             "14:00",
				SlotDurationMinutes: 20,
				MaxPatients:         18,
				IsActive:            true,
			})
		}
		db.Model(&domain.DoctorSchedule{}).Where("doctor_id = ? AND day_of_week = ?", doc2.ID, day).Count(&count)
		if count == 0 {
			db.Create(&domain.DoctorSchedule{
				DoctorID:            doc2.ID,
				DayOfWeek:           day,
				StartTime:           "13:00",
				EndTime:             "18:00",
				SlotDurationMinutes: 20,
				MaxPatients:         15,
				IsActive:            true,
			})
		}
	}

	// 4. Seed Patients
	patients := []domain.Patient{
		{
			UserID:           &pat1User.ID,
			PatientNumber:    "PAT-20260807-001",
			NationalID:       "3171012345670001",
			FullName:         "Budi Santoso",
			Gender:           "Male",
			BirthDate:        "1990-05-15",
			Age:              36,
			Address:          "Jl. Sudirman No. 45, Jakarta Selatan",
			Phone:            "+6281234567895",
			Email:            "budi@gmail.com",
			BloodType:        "O+",
			Allergy:          "Penicillin",
			DiseaseHistory:   "Hypertension",
			CurrentComplaint: "Dizziness and high blood pressure",
			EmergencyContact: "Siti (Wife) - 08129876543",
		},
		{
			PatientNumber:    "PAT-20260807-002",
			NationalID:       "3171012345670002",
			FullName:         "Siti Rahma",
			Gender:           "Female",
			BirthDate:        "1995-11-20",
			Age:              31,
			Address:          "Jl. Gatot Subroto No. 12, Jakarta Selatan",
			Phone:            "+6281987654321",
			Email:            "siti.rahma@gmail.com",
			BloodType:        "A+",
			Allergy:          "None",
			DiseaseHistory:   "Asthma",
			CurrentComplaint: "Shortness of breath and cough",
			EmergencyContact: "Ahmad (Husband) - 081311223344",
		},
		{
			PatientNumber:    "PAT-20260807-003",
			NationalID:       "3171012345670003",
			FullName:         "Ahmad Hidayat",
			Gender:           "Male",
			BirthDate:        "1985-02-10",
			Age:              41,
			Address:          "Jl. Kebon Jeruk No. 88, Jakarta Barat",
			Phone:            "+6281765432109",
			Email:            "ahmad.hidayat@gmail.com",
			BloodType:        "B+",
			Allergy:          "Seafood",
			DiseaseHistory:   "Gastritis (Maag)",
			CurrentComplaint: "Severe stomach pain after meals",
			EmergencyContact: "Dewi (Sister) - 081566778899",
		},
	}

	for _, p := range patients {
		var count int64
		db.Model(&domain.Patient{}).Where("patient_number = ?", p.PatientNumber).Count(&count)
		if count == 0 {
			db.Create(&p)
		}
	}

	// Fetch Patients
	var pat1, pat2 domain.Patient
	db.Where("patient_number = ?", "PAT-20260807-001").First(&pat1)
	db.Where("patient_number = ?", "PAT-20260807-002").First(&pat2)

	// 4.5 Seed Medicine Categories
	categories := []domain.MedicineCategory{
		{CategoryCode: "CAT-ANALGESIC", Name: "Analgesic & Antipyretic", Description: "Obat pereda nyeri dan penurun demam"},
		{CategoryCode: "CAT-ANTIBIOTIC", Name: "Antibiotic", Description: "Obat infeksi bakteri dan antimikroba"},
		{CategoryCode: "CAT-ANTIHYPERTENSIVE", Name: "Antihypertensive", Description: "Obat penurun tekanan darah tinggi"},
		{CategoryCode: "CAT-GASTRO", Name: "Gastroprotective", Description: "Obat lambung, maag, dan asam lambung"},
		{CategoryCode: "CAT-ANTIHISTAMINE", Name: "Antihistamine", Description: "Obat alergi dan gatal-gatal"},
	}

	for _, c := range categories {
		var count int64
		db.Model(&domain.MedicineCategory{}).Where("category_code = ?", c.CategoryCode).Count(&count)
		if count == 0 {
			db.Create(&c)
		}
	}

	// 5. Seed Medicines
	medicines := []domain.Medicine{
		{
			MedicineCode:  "MED-001",
			Name:          "Paracetamol 500mg",
			CategoryName:  "Analgesic & Antipyretic",
			Manufacturer:  "Kimia Farma",
			Unit:          "Tablet",
			Stock:         250,
			MinStock:      50,
			PurchasePrice: 500,
			SellingPrice:  1200,
			ExpiryDate:    "2027-12-31",
			BatchNumber:   "BATCH-2024-001",
			Barcode:       "8991001001001",
		},
		{
			MedicineCode:  "MED-002",
			Name:          "Amoxicillin 500mg",
			CategoryName:  "Antibiotic",
			Manufacturer:  "Kalbe Farma",
			Unit:          "Capsule",
			Stock:         180,
			MinStock:      30,
			PurchasePrice: 1500,
			SellingPrice:  3500,
			ExpiryDate:    "2026-10-15",
			BatchNumber:   "BATCH-2024-002",
			Barcode:       "8991001001002",
		},
		{
			MedicineCode:  "MED-003",
			Name:          "Amlodipine 10mg",
			CategoryName:  "Antihypertensive",
			Manufacturer:  "Dexa Medica",
			Unit:          "Tablet",
			Stock:         120,
			MinStock:      20,
			PurchasePrice: 2000,
			SellingPrice:  4500,
			ExpiryDate:    "2027-06-30",
			BatchNumber:   "BATCH-2024-003",
			Barcode:       "8991001001003",
		},
		{
			MedicineCode:  "MED-004",
			Name:          "Omeprazole 20mg",
			CategoryName:  "Gastroprotective",
			Manufacturer:  "Sanbe Farma",
			Unit:          "Capsule",
			Stock:         8, // Low Stock for alert demonstration!
			MinStock:      15,
			PurchasePrice: 3000,
			SellingPrice:  7000,
			ExpiryDate:    "2026-09-01",
			BatchNumber:   "BATCH-2024-004",
			Barcode:       "8991001001004",
		},
		{
			MedicineCode:  "MED-005",
			Name:          "Cetirizine 10mg",
			CategoryName:  "Antihistamine",
			Manufacturer:  "Phapros",
			Unit:          "Tablet",
			Stock:         300,
			MinStock:      40,
			PurchasePrice: 800,
			SellingPrice:  2000,
			ExpiryDate:    "2027-08-20",
			BatchNumber:   "BATCH-2024-005",
			Barcode:       "8991001001005",
		},
	}

	for _, m := range medicines {
		var count int64
		db.Model(&domain.Medicine{}).Where("medicine_code = ?", m.MedicineCode).Count(&count)
		if count == 0 {
			db.Create(&m)
		}
	}

	// Fetch Medicine
	var med1, med3 domain.Medicine
	db.Where("medicine_code = ?", "MED-001").First(&med1)
	db.Where("medicine_code = ?", "MED-003").First(&med3)

	// 6. Seed Appointments & Queues
	todayStr := time.Now().Format("2006-01-02")
	var app1Count int64
	db.Model(&domain.Appointment{}).Where("appointment_number = ?", "APT-20260807-001").Count(&app1Count)
	if app1Count == 0 {
		app1 := domain.Appointment{
			AppointmentNumber: "APT-20260807-001",
			PatientID:         pat1.ID,
			DoctorID:          doc1.ID,
			AppointmentDate:   todayStr,
			TimeSlot:          "09:00 - 09:20",
			QueueNumber:       1,
			Status:            domain.AppointmentStatusConfirmed,
			Complaint:         "Feeling dizzy and chest pressure",
			Notes:             "Regular hypertension checkup",
		}
		db.Create(&app1)

		// Seed Queue
		queue1 := domain.Queue{
			AppointmentID: app1.ID,
			PatientID:     pat1.ID,
			DoctorID:      doc1.ID,
			QueueNumber:   1,
			QueueDate:     todayStr,
			Status:        domain.QueueStatusWaiting,
			EstimatedTime: "09:00",
		}
		db.Create(&queue1)

		// Seed Consultation & SOAP
		consultation1 := domain.Consultation{
			AppointmentID:           app1.ID,
			PatientID:               pat1.ID,
			DoctorID:                doc1.ID,
			VisitDate:               todayStr,
			Subjective:              "Patient complains of occipital headache and dizziness for 2 days. History of hypertension.",
			Objective:               "BP: 145/95 mmHg, HR: 82 bpm, RR: 18/min, Temp: 36.6°C. Heart/Lungs within normal limits.",
			Assessment:              "Stage 1 Essential Hypertension (ICD-10: I10)",
			Plan:                    "Lifestyle modification, low sodium diet, start Amlodipine 10mg once daily.",
			Diagnosis:               "Essential (primary) hypertension",
			ICD10Code:               "I10",
			Treatment:               "Oral Medication",
			MedicalNotes:            "Follow up in 2 weeks with blood pressure log.",
			LabRecommendation:       "Lipid Profile, Serum Creatinine",
			NextVisitRecommendation: "2026-08-21",
			DoctorSignature:         "dr. Alwi Shahab, Sp.PD (Digital Verified)",
		}
		db.Create(&consultation1)

		// Seed Prescription
		prescription1 := domain.Prescription{
			PrescriptionNumber: "RX-20260807-001",
			ConsultationID:     consultation1.ID,
			PatientID:          pat1.ID,
			DoctorID:           doc1.ID,
			Status:             "Pending",
			PharmacistNotes:    "Verify penicillin allergy note before dispensing.",
			Items: []domain.PrescriptionItem{
				{
					MedicineID:   med3.ID,
					MedicineName: med3.Name,
					Dosage:       "1x1 after meal (Morning)",
					Quantity:     10,
					UnitPrice:    med3.SellingPrice,
					Subtotal:     med3.SellingPrice * 10,
					Instructions: "Take 1 tablet every morning",
				},
				{
					MedicineID:   med1.ID,
					MedicineName: med1.Name,
					Dosage:       "3x1 PRN (when headache)",
					Quantity:     10,
					UnitPrice:    med1.SellingPrice,
					Subtotal:     med1.SellingPrice * 10,
					Instructions: "Take for severe headache",
				},
			},
		}
		db.Create(&prescription1)

		// Seed Invoice
		invoice1 := domain.Invoice{
			InvoiceNumber:  "INV-20260807-001",
			PatientID:      pat1.ID,
			AppointmentID:  &app1.ID,
			ConsultationID: &consultation1.ID,
			DoctorFee:      150000,
			ProcedureFee:   50000,
			MedicineFee:    57000,
			Discount:       0,
			Tax:            25700,
			GrandTotal:     282700,
			PaymentStatus:  "Paid",
			PaymentMethod:  "QRIS",
			Items: []domain.InvoiceItem{
				{ItemType: "Doctor Fee", ItemName: "Consultation - dr. Alwi Shahab, Sp.PD", Quantity: 1, UnitPrice: 150000, Subtotal: 150000},
				{ItemType: "Procedure", ItemName: "Vital Signs & ECG Check", Quantity: 1, UnitPrice: 50000, Subtotal: 50000},
				{ItemType: "Medicine", ItemName: "Amlodipine 10mg (10 tabs)", Quantity: 1, UnitPrice: 45000, Subtotal: 45000},
				{ItemType: "Medicine", ItemName: "Paracetamol 500mg (10 tabs)", Quantity: 1, UnitPrice: 12000, Subtotal: 12000},
			},
		}
		db.Create(&invoice1)

		// Seed Medical Record
		medicalRecord1 := domain.MedicalRecord{
			RecordNumber:        "MR-20260807-001",
			PatientID:           pat1.ID,
			DoctorID:            doc1.ID,
			ConsultationID:      consultation1.ID,
			VisitDate:           todayStr,
			Diagnosis:           "Essential (primary) hypertension",
			ICD10Code:           "I10",
			SOAPSummary:         "S: Headaches. O: BP 145/95. A: Hypertension Stage 1. P: Amlodipine 10mg.",
			PrescriptionSummary: "Amlodipine 10mg (10 tabs), Paracetamol 500mg (10 tabs)",
			LabSummary:          "Lipid Profile recommended",
			TotalCost:           282700,
		}
		db.Create(&medicalRecord1)
	}

	// 7. Seed Initial Audit Log
	db.Create(&domain.AuditLog{
		UserID:      1,
		UserEmail:   "superadmin@klinikalwi.id",
		UserRole:    domain.RoleSuperAdmin,
		Action:      "SYSTEM_SEED",
		Module:      "System",
		Description: "Database initialized with core enterprise seed data for Klinik Alwi HMS",
		IPAddress:   "127.0.0.1",
	})

	log.Println("[Seeder] Database seeding completed successfully!")
	return nil
}
