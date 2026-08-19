package seed

import (
	"log"

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
		{
			PatientNumber:    "PAT-004",
			NationalID:       "3171012345670004",
			FullName:         "Dewi Lestari",
			Gender:           "Female",
			BirthDate:        "1998-04-12",
			Age:              28,
			Address:          "Jl. Pemuda No. 10, Jakarta Timur",
			Phone:            "+6281554433221",
			Email:            "dewi@gmail.com",
			BloodType:        "AB+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Migraine",
			CurrentComplaint: "Nyeri kepala sebelah kanan",
			EmergencyContact: "Budi (Husband) - 081233445566",
		},
		{
			PatientNumber:    "PAT-005",
			NationalID:       "3171012345670005",
			FullName:         "Rudi Hermawan",
			Gender:           "Male",
			BirthDate:        "1981-03-08",
			Age:              45,
			Address:          "Jl. Ahmad Yani No. 15, Bandung",
			Phone:            "+6281299887766",
			Email:            "rudi@gmail.com",
			BloodType:        "O+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Diabetes Mellitus Tipe 2",
			CurrentComplaint: "Badan lemas dan sering haus",
			EmergencyContact: "Maya (Wife) - 081399001122",
		},
		{
			PatientNumber:    "PAT-006",
			NationalID:       "3171012345670006",
			FullName:         "Eka Putri",
			Gender:           "Female",
			BirthDate:        "2002-09-14",
			Age:              24,
			Address:          "Jl. Margonda Raya No. 4, Depok",
			Phone:            "+6281776655443",
			Email:            "eka@gmail.com",
			BloodType:        "A+",
			Allergy:          "Sulfa",
			DiseaseHistory:   "Flu & ISPA",
			CurrentComplaint: "Batuk kering & demam",
			EmergencyContact: "Rina (Mother) - 081877665544",
		},
		{
			PatientNumber:    "PAT-007",
			NationalID:       "3171012345670007",
			FullName:         "Bambang Utomo",
			Gender:           "Male",
			BirthDate:        "1974-01-25",
			Age:              52,
			Address:          "Jl. Diponegoro No. 8, Semarang",
			Phone:            "+6281334455667",
			Email:            "bambang@gmail.com",
			BloodType:        "B+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Kolesterol Tinggi",
			CurrentComplaint: "Tengkuk pegal sesudah makan",
			EmergencyContact: "Sri (Wife) - 081255443322",
		},
		{
			PatientNumber:    "PAT-008",
			NationalID:       "3171012345670008",
			FullName:         "Nurlaila Sari",
			Gender:           "Female",
			BirthDate:        "1987-07-03",
			Age:              39,
			Address:          "Jl. Cikini Raya No. 90, Jakarta Pusat",
			Phone:            "+6281665544332",
			Email:            "nurlaila@gmail.com",
			BloodType:        "O+",
			Allergy:          "Aspirin",
			DiseaseHistory:   "GERD",
			CurrentComplaint: "Perut kembung & bersendawa asam",
			EmergencyContact: "Hadi (Husband) - 081744332211",
		},
		{
			PatientNumber:    "PAT-009",
			NationalID:       "3171012345670009",
			FullName:         "Hendra Wijaya",
			Gender:           "Male",
			BirthDate:        "1992-06-18",
			Age:              34,
			Address:          "Jl. Sen Sen No. 12, Surabaya",
			Phone:            "+6281443322110",
			Email:            "hendra@gmail.com",
			BloodType:        "AB+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Dermatitis Kontak Alergi",
			CurrentComplaint: "Gatal kemerahan di lengan",
			EmergencyContact: "Siska (Wife) - 081322110099",
		},
		{
			PatientNumber:    "PAT-010",
			NationalID:       "3171012345670010",
			FullName:         "Maya Indah",
			Gender:           "Female",
			BirthDate:        "1999-12-05",
			Age:              27,
			Address:          "Jl. Palmerah No. 3, Jakarta Barat",
			Phone:            "+6281112233445",
			Email:            "maya@gmail.com",
			BloodType:        "O+",
			Allergy:          "Seafood",
			DiseaseHistory:   "Anemia Defisiensi Besi",
			CurrentComplaint: "Wajah pucat & pusing mendadak",
			EmergencyContact: "Doni (Brother) - 081899887766",
		},
		{
			PatientNumber:    "PAT-011",
			NationalID:       "3171012345670011",
			FullName:         "Fikri Ardiansyah",
			Gender:           "Male",
			BirthDate:        "1988-08-20",
			Age:              38,
			Address:          "Jl. Casablanca No. 77, Jakarta Selatan",
			Phone:            "+6281223344556",
			Email:            "fikri@gmail.com",
			BloodType:        "B+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Asam Urat / Gout",
			CurrentComplaint: "Nyeri hebat jempol kaki",
			EmergencyContact: "Tuti (Wife) - 081377665544",
		},
		{
			PatientNumber:    "PAT-012",
			NationalID:       "3171012345670012",
			FullName:         "Ratna Juwita",
			Gender:           "Female",
			BirthDate:        "1993-01-11",
			Age:              33,
			Address:          "Jl. Rasuna Said No. 50, Jakarta Selatan",
			Phone:            "+6281344556677",
			Email:            "ratna@gmail.com",
			BloodType:        "A+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Demam Tifoid",
			CurrentComplaint: "Demam bertahap naik 4 hari",
			EmergencyContact: "Wawan (Husband) - 081266554433",
		},
		{
			PatientNumber:    "PAT-013",
			NationalID:       "3171012345670013",
			FullName:         "Taufik Hidayatullah",
			Gender:           "Male",
			BirthDate:        "1978-05-30",
			Age:              48,
			Address:          "Jl. Fatmawati No. 19, Jakarta Selatan",
			Phone:            "+6281566778899",
			Email:            "taufik@gmail.com",
			BloodType:        "O+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Osteoartritis Lutut",
			CurrentComplaint: "Lutut gemeretak & nyeri tangga",
			EmergencyContact: "Yanti (Wife) - 081855443322",
		},
		{
			PatientNumber:    "PAT-014",
			NationalID:       "3171012345670014",
			FullName:         "Lestari Anggraini",
			Gender:           "Female",
			BirthDate:        "1997-10-17",
			Age:              29,
			Address:          "Jl. Kebayoran Baru No. 2, Jakarta Selatan",
			Phone:            "+6281899001122",
			Email:            "lestari@gmail.com",
			BloodType:        "AB+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Faringitis Akut",
			CurrentComplaint: "Nyeri menelan & tenggorokan perih",
			EmergencyContact: "Agus (Husband) - 081244332211",
		},
		{
			PatientNumber:    "PAT-015",
			NationalID:       "3171012345670015",
			FullName:         "Irwan Setiawan",
			Gender:           "Male",
			BirthDate:        "1986-04-04",
			Age:              40,
			Address:          "Jl. MT Haryono No. 11, Jakarta Timur",
			Phone:            "+6281900112233",
			Email:            "irwan@gmail.com",
			BloodType:        "O+",
			Allergy:          "Tidak Ada",
			DiseaseHistory:   "Insomnia Non-Organik",
			CurrentComplaint: "Sulit tidur & sering terbangun",
			EmergencyContact: "Dina (Wife) - 081333221100",
		},
		{
			PatientNumber:    "PAT-016",
			NationalID:       "3171012345670016",
			FullName:         "Dian Sastro",
			Gender:           "Female",
			BirthDate:        "1996-06-22",
			Age:              30,
			Address:          "Jl. Kemang Raya No. 18, Jakarta Selatan",
			Phone:            "+6281788990011",
			Email:            "dian@gmail.com",
			BloodType:        "A+",
			Allergy:          "Penicillin",
			DiseaseHistory:   "Konjungtivitis Akut",
			CurrentComplaint: "Mata merah & berair",
			EmergencyContact: "Rian (Husband) - 081211009988",
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

	// 5b. Seed Multi-Date Queues & Appointments for PostgreSQL 5432
	type QueueSeedItem struct {
		AppNumber   string
		PatNumber   string
		DocCode     string
		QueueDate   string
		QueueNumber int
		Status      string
		EstTime     string
		Complaint   string
	}

	queueSeeds := []QueueSeedItem{
		// Today (2026-08-19)
		{AppNumber: "APT-20260819-001", PatNumber: "PAT-20260807-001", DocCode: "DOC-001", QueueDate: "2026-08-19", QueueNumber: 1, Status: domain.QueueStatusInConsultation, EstTime: "09:00 WIB", Complaint: "Sakit kepala hebat dan pusing"},
		{AppNumber: "APT-20260819-002", PatNumber: "PAT-20260807-002", DocCode: "DOC-002", QueueDate: "2026-08-19", QueueNumber: 2, Status: domain.QueueStatusWaiting, EstTime: "09:20 WIB", Complaint: "Sesak napas kambuh"},
		{AppNumber: "APT-20260819-003", PatNumber: "PAT-20260807-003", DocCode: "DOC-001", QueueDate: "2026-08-19", QueueNumber: 3, Status: domain.QueueStatusWaiting, EstTime: "09:40 WIB", Complaint: "Nyeri ulu hati menekan"},
		{AppNumber: "APT-20260819-004", PatNumber: "PAT-004", DocCode: "DOC-001", QueueDate: "2026-08-19", QueueNumber: 4, Status: domain.QueueStatusWaiting, EstTime: "10:00 WIB", Complaint: "Migrain berat sebelah kanan"},
		// History 1 Month Ago (2026-07-22)
		{AppNumber: "APT-20260722-001", PatNumber: "PAT-005", DocCode: "DOC-001", QueueDate: "2026-07-22", QueueNumber: 1, Status: domain.QueueStatusCompleted, EstTime: "10:00 WIB", Complaint: "Badan lemas & sering haus"},
		{AppNumber: "APT-20260722-002", PatNumber: "PAT-006", DocCode: "DOC-002", QueueDate: "2026-07-22", QueueNumber: 2, Status: domain.QueueStatusCompleted, EstTime: "10:20 WIB", Complaint: "Batuk kering & demam"},
		// History 2 Months Ago (2026-06-18)
		{AppNumber: "APT-20260618-001", PatNumber: "PAT-007", DocCode: "DOC-001", QueueDate: "2026-06-18", QueueNumber: 1, Status: domain.QueueStatusCompleted, EstTime: "11:00 WIB", Complaint: "Tengkuk pegal sesudah makan"},
		// History 3 Months Ago (2026-05-15)
		{AppNumber: "APT-20260515-001", PatNumber: "PAT-009", DocCode: "DOC-001", QueueDate: "2026-05-15", QueueNumber: 1, Status: domain.QueueStatusCompleted, EstTime: "14:00 WIB", Complaint: "Gatal kemerahan di lengan"},
	}

	for _, qs := range queueSeeds {
		var count int64
		db.Model(&domain.Appointment{}).Where("appointment_number = ?", qs.AppNumber).Count(&count)
		if count == 0 {
			var pat domain.Patient
			var doc domain.Doctor
			db.Where("patient_number = ?", qs.PatNumber).First(&pat)
			db.Where("doctor_code = ?", qs.DocCode).First(&doc)

			if pat.ID > 0 && doc.ID > 0 {
				app := domain.Appointment{
					AppointmentNumber: qs.AppNumber,
					PatientID:         pat.ID,
					DoctorID:          doc.ID,
					AppointmentDate:   qs.QueueDate,
					TimeSlot:          qs.EstTime,
					QueueNumber:       qs.QueueNumber,
					Status:            domain.AppointmentStatusConfirmed,
					Complaint:         qs.Complaint,
				}
				db.Create(&app)

				db.Create(&domain.Queue{
					AppointmentID: app.ID,
					PatientID:     pat.ID,
					DoctorID:      doc.ID,
					QueueNumber:   qs.QueueNumber,
					QueueDate:     qs.QueueDate,
					Status:        qs.Status,
					EstimatedTime: qs.EstTime,
				})
			}
		}
	}

	// 6. Seed Appointments, Consultations, Invoices & Medical Records (All 15 Patients)
	type MedicalRecordSeedData struct {
		RecordNumber        string
		PatientNumber       string
		DoctorCode          string
		VisitDate           string
		Diagnosis           string
		ICD10Code           string
		SOAPSummary         string
		PrescriptionSummary string
		LabSummary          string
		TotalCost           float64
	}

	mrSeedList := []MedicalRecordSeedData{
		{
			RecordNumber:        "MR-APT-20260807-001",
			PatientNumber:       "PAT-20260807-001",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-08-07",
			Diagnosis:           "Essential (primary) hypertension stage 1",
			ICD10Code:           "I10",
			SOAPSummary:         "S: Sakit kepala hebat sejak 2 hari dan pusing berputar. O: TD 145/95 mmHg, Nadi 82x/mnt, Temp 36.6 C. A: Hipertensi Primer Derajat 1. P: Amlodipine 10mg 1x1 sesudah makan pagi, Paracetamol 500mg 3x1 jika nyeri.",
			PrescriptionSummary: "Amlodipine 10mg (10 tabs), Paracetamol 500mg (10 tabs)",
			LabSummary:          "Pemeriksaan Profil Lipid & Kreatinin Darah direkomendasikan minggu depan",
			TotalCost:           282700,
		},
		{
			RecordNumber:        "MR-APT-20260807-002",
			PatientNumber:       "PAT-20260807-002",
			DoctorCode:          "DOC-002",
			VisitDate:           "2026-08-07",
			Diagnosis:           "Acute Asthma Exacerbation",
			ICD10Code:           "J45.901",
			SOAPSummary:         "S: Sesak napas kambuh saat cuaca dingin disertai batuk berdahak. O: Wheezing (+) di kedua lapang paru, RR 26x/mnt. A: Serangan Asma Akut. P: Nebulizer Ventolin 1 sesi di klinik, resep Amoxicillin 500mg 3x1.",
			PrescriptionSummary: "Amoxicillin 500mg (15 caps)",
			LabSummary:          "Tes Fungsi Paru (Spirometri) dijadwalkan ulang",
			TotalCost:           252500,
		},
		{
			RecordNumber:        "MR-APT-20260806-001",
			PatientNumber:       "PAT-20260807-003",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-08-06",
			Diagnosis:           "Gastritis & Acid Reflux Disease",
			ICD10Code:           "K29.7",
			SOAPSummary:         "S: Nyeri ulu hati menekan dan mual sesudah makan. O: Nyeri tekan epigastrium (+), BU (+) normal. A: Gastritis Akut. P: Omeprazole 20mg 2x1 sebelum makan.",
			PrescriptionSummary: "Omeprazole 20mg (14 caps)",
			LabSummary:          "Evaluasi Endoskopi jika keluhan berlanjut 2 minggu",
			TotalCost:           220000,
		},
		{
			RecordNumber:        "MR-APT-20260805-001",
			PatientNumber:       "PAT-004",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-08-05",
			Diagnosis:           "Migraine without aura",
			ICD10Code:           "G43.0",
			SOAPSummary:         "S: Nyeri kepala sebelah kanan berdenyut. O: Refleks cahaya pupil (+/+), TD 120/80 mmHg. A: Migrain Tanpa Aura. P: Ibuprofen 400mg 3x1 sesudah makan.",
			PrescriptionSummary: "Ibuprofen 400mg (10 tabs)",
			LabSummary:          "Pemeriksaan saraf cranial normal",
			TotalCost:           280500,
		},
		{
			RecordNumber:        "MR-APT-20260722-001",
			PatientNumber:       "PAT-005",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-07-22",
			Diagnosis:           "Non-insulin-dependent diabetes mellitus",
			ICD10Code:           "E11.9",
			SOAPSummary:         "S: Badan lemas & sering haus saat malam. O: GDS 210 mg/dL, TD 130/80 mmHg. A: DM Tipe 2 Terkontrol Sebagian. P: Metformin 500mg 2x1 bersama makan.",
			PrescriptionSummary: "Metformin 500mg (30 tabs)",
			LabSummary:          "Cek HbA1c & Fungsi Ginjal (Ureum/Kreatinin) direkomendasikan",
			TotalCost:           324500,
		},
		{
			RecordNumber:        "MR-APT-20260710-002",
			PatientNumber:       "PAT-006",
			DoctorCode:          "DOC-002",
			VisitDate:           "2026-07-10",
			Diagnosis:           "Acute upper respiratory infection (ISPA)",
			ICD10Code:           "J06.9",
			SOAPSummary:         "S: Batuk kering, tenggorokan gatal, demam 37.8 C. O: Faring hiperemis (+), Suhu 37.8 C. A: ISPA Akut. P: Paracetamol 500mg 3x1 & Vitamin C.",
			PrescriptionSummary: "Paracetamol 500mg (10 tabs), Vitamin C (10 tabs)",
			LabSummary:          "Istirahat cukup dan minum air putih hangat 2 Liter/hari",
			TotalCost:           247500,
		},
		{
			RecordNumber:        "MR-APT-20260618-001",
			PatientNumber:       "PAT-007",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-06-18",
			Diagnosis:           "Pure hypercholesterolemia",
			ICD10Code:           "E78.0",
			SOAPSummary:         "S: Tengkuk pegal dan berat sesudah makan gorengan. O: Kolesterol Total 240 mg/dL. A: Hiperkolesterolemia. P: Simvastatin 20mg 1x1 malam.",
			PrescriptionSummary: "Simvastatin 20mg (30 tabs)",
			LabSummary:          "Evaluasi Profil Lipid lengkap (HDL, LDL, Trigliserida) bulan depan",
			TotalCost:           379500,
		},
		{
			RecordNumber:        "MR-APT-20260515-001",
			PatientNumber:       "PAT-009",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-05-15",
			Diagnosis:           "Allergic contact dermatitis",
			ICD10Code:           "L23.9",
			SOAPSummary:         "S: Gatal kemerahan di lengan kanan setelah terpapar debu. O: Lesi eritema (+), papul (+). A: Dermatitis Kontak Alergi. P: Cetirizine 10mg 1x1 & Salep Hydrocortisone.",
			PrescriptionSummary: "Cetirizine 10mg (10 tabs), Hydrocortisone Salep 1%",
			LabSummary:          "Hindari kontak dengan alergen debu & pembersih kimia kuat",
			TotalCost:           297000,
		},
		{
			RecordNumber:        "MR-APT-20260410-001",
			PatientNumber:       "PAT-010",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-04-10",
			Diagnosis:           "Iron deficiency anemia",
			ICD10Code:           "D50.9",
			SOAPSummary:         "S: Wajah pucat & sering pusing saat berdiri mendadak. O: Konjungtiva anemis (+/+), Hb 10.2 g/dL. A: Anemia Defisiensi Besi. P: Sangobion 1x1 sesudah makan.",
			PrescriptionSummary: "Sangobion / Tablet Tambah Darah (30 tabs)",
			LabSummary:          "Pemeriksaan Darah Lengkap (DPL) ulang dalam 1 bulan",
			TotalCost:           324500,
		},
		{
			RecordNumber:        "MR-APT-20260402-002",
			PatientNumber:       "PAT-011",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-04-02",
			Diagnosis:           "Idiopathic gout without tophus",
			ICD10Code:           "M10.0",
			SOAPSummary:         "S: Nyeri hebat pada sendi jempol kaki kanan, merah & bengkak. O: Asam Urat 8.7 mg/dL, inflamasi (+). A: Gout Arthritis Akut. P: Allopurinol 100mg 1x1 & Meloxicam 15mg 1x1.",
			PrescriptionSummary: "Allopurinol 100mg (10 tabs), Meloxicam 15mg (10 tabs)",
			LabSummary:          "Hindari konsumsi jeroan, kacang-kacangan, dan emping",
			TotalCost:           310000,
		},
		{
			RecordNumber:        "MR-APT-20260320-001",
			PatientNumber:       "PAT-012",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-03-20",
			Diagnosis:           "Typhoid fever",
			ICD10Code:           "A01.0",
			SOAPSummary:         "S: Demam bertahap naik di sore/malam hari 4 hari, lidah kotor. O: Suhu 38.5 C, Widal Titer O 1/320. A: Demam Tifoid. P: Ciprofloxacin 500mg 2x1 & Paracetamol 500mg 3x1.",
			PrescriptionSummary: "Ciprofloxacin 500mg (10 tabs), Paracetamol 500mg (10 tabs)",
			LabSummary:          "Bed rest total 5 hari dan makan makanan lunak/bubur",
			TotalCost:           365000,
		},
		{
			RecordNumber:        "MR-APT-20260312-003",
			PatientNumber:       "PAT-013",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-03-12",
			Diagnosis:           "Primary generalized osteoarthritis",
			ICD10Code:           "M15.0",
			SOAPSummary:         "S: Lutut kanan gemeretak dan nyeri saat naik-turun tangga. O: Krepitasi (+), bengkak minimal. A: Osteoartritis Lutut Derajat 2. P: Glukosamin 500mg 2x1 & Natrium Diklofenak 50mg 2x1.",
			PrescriptionSummary: "Glukosamin 500mg (30 tabs), Natrium Diklofenak (10 tabs)",
			LabSummary:          "Rontgen Genu Dextra 2 posisi direkomendasikan",
			TotalCost:           340000,
		},
		{
			RecordNumber:        "MR-APT-20260225-001",
			PatientNumber:       "PAT-014",
			DoctorCode:          "DOC-002",
			VisitDate:           "2026-02-25",
			Diagnosis:           "Acute pharyngitis, unspecified",
			ICD10Code:           "J02.9",
			SOAPSummary:         "S: Sukar menelan makanan padat, tenggorokan perih & demam ringan. O: TONSIL T1/T1, Faring hiperemis (+). A: Faringitis Akut. P: Cefadroxil 500mg 2x1 & FG Troches 3x1.",
			PrescriptionSummary: "Cefadroxil 500mg (10 caps), FG Troches (10 tabs)",
			LabSummary:          "Kumur dengan air garam hangat 3x sehari",
			TotalCost:           255000,
		},
		{
			RecordNumber:        "MR-APT-20260214-002",
			PatientNumber:       "PAT-015",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-02-14",
			Diagnosis:           "Nonorganic insomnia, unspecified",
			ICD10Code:           "F51.01",
			SOAPSummary:         "S: Sulit memulai tidur & sering terbangun tengah malam karena stres pekerjaan. O: Vital signs normal, TD 125/80 mmHg. A: Insomnia Non-Organik. P: Edukasi Sleep Hygiene & Vitamin B-Complex 1x1.",
			PrescriptionSummary: "Vitamin B-Complex (30 tabs)",
			LabSummary:          "Batasi penggunaan HP/Laptop 1 jam sebelum tidur",
			TotalCost:           230000,
		},
		{
			RecordNumber:        "MR-APT-20260130-001",
			PatientNumber:       "PAT-016",
			DoctorCode:          "DOC-001",
			VisitDate:           "2026-01-30",
			Diagnosis:           "Acute conjunctivitis, unspecified",
			ICD10Code:           "H10.9",
			SOAPSummary:         "S: Mata kanan merah, berair, dan terasa mengganjal sejak 2 hari. O: Injeksi konjungtiva (+), sekret serous (+). A: Konjungtivitis Akut. P: Tetes Mata Chloramphenicol 4x1 tetes.",
			PrescriptionSummary: "Chloramphenicol Tetes Mata 0.5% (1 botol)",
			LabSummary:          "Gunakan kacamata pelindung dan hindari mengucek mata",
			TotalCost:           215000,
		},
	}

	for _, item := range mrSeedList {
		var count int64
		db.Model(&domain.MedicalRecord{}).Where("record_number = ?", item.RecordNumber).Count(&count)
		if count == 0 {
			var pat domain.Patient
			var doc domain.Doctor
			db.Where("patient_number = ?", item.PatientNumber).First(&pat)
			db.Where("doctor_code = ?", item.DoctorCode).First(&doc)

			if pat.ID > 0 && doc.ID > 0 {
				db.Create(&domain.MedicalRecord{
					RecordNumber:        item.RecordNumber,
					PatientID:           pat.ID,
					DoctorID:            doc.ID,
					ConsultationID:      1,
					VisitDate:           item.VisitDate,
					Diagnosis:           item.Diagnosis,
					ICD10Code:           item.ICD10Code,
					SOAPSummary:         item.SOAPSummary,
					PrescriptionSummary: item.PrescriptionSummary,
					LabSummary:          item.LabSummary,
					TotalCost:           item.TotalCost,
				})
			}
		}
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
