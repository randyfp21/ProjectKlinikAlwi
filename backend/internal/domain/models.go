package domain

import (
	"time"

	"gorm.io/gorm"
)

// User Roles
const (
	RoleSuperAdmin = "Super Admin"
	RoleAdmin      = "Admin"
	RoleDoctor     = "Doctor"
	RolePharmacist = "Pharmacist"
	RolePatient    = "Patient"
)

// User Model
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Email     string         `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	FullName  string         `gorm:"size:100;not null" json:"full_name"`
	Role      string         `gorm:"size:30;not null;index" json:"role"`
	Phone     string         `gorm:"size:20" json:"phone"`
	Avatar    string         `gorm:"size:255" json:"avatar"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Doctor Model
type Doctor struct {
	ID                    uint             `gorm:"primaryKey" json:"id"`
	UserID                uint             `gorm:"uniqueIndex" json:"user_id"`
	User                  *User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	DoctorCode            string           `gorm:"size:30;uniqueIndex;not null" json:"doctor_code"`
	Name                  string           `gorm:"size:100;not null" json:"name"`
	Gender                string           `gorm:"size:10;not null" json:"gender"`
	Phone                 string           `gorm:"size:20" json:"phone"`
	Email                 string           `gorm:"size:100" json:"email"`
	PracticeLicenseNumber string           `gorm:"size:50;not null" json:"practice_license_number"`
	Specialization        string           `gorm:"size:100;not null;index" json:"specialization"`
	Education             string           `gorm:"size:255" json:"education"`
	PracticeRoom          string           `gorm:"size:50" json:"practice_room"`
	ConsultationFee       float64          `gorm:"type:decimal(12,2);default:150000" json:"consultation_fee"`
	Photo                 string           `gorm:"size:255" json:"photo"`
	ActiveStatus          bool             `gorm:"default:true" json:"active_status"`
	Schedules             []DoctorSchedule `gorm:"foreignKey:DoctorID" json:"schedules,omitempty"`
	CreatedAt             time.Time        `json:"created_at"`
	UpdatedAt             time.Time        `json:"updated_at"`
	DeletedAt             gorm.DeletedAt   `gorm:"index" json:"-"`
}

// Doctor Schedule Model
type DoctorSchedule struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	DoctorID            uint      `gorm:"not null;index" json:"doctor_id"`
	DayOfWeek           string    `gorm:"size:15;not null" json:"day_of_week"` // Monday, Tuesday, ...
	StartTime           string    `gorm:"size:10;not null" json:"start_time"`  // 08:00
	EndTime             string    `gorm:"size:10;not null" json:"end_time"`    // 14:00
	SlotDurationMinutes int       `gorm:"default:20" json:"slot_duration_minutes"`
	MaxPatients         int       `gorm:"default:20" json:"max_patients"`
	IsActive            bool      `gorm:"default:true" json:"is_active"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// Patient Model
type Patient struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	UserID           *uint          `gorm:"index" json:"user_id,omitempty"`
	User             *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Username         string         `gorm:"-" json:"username,omitempty"`
	Password         string         `gorm:"-" json:"password,omitempty"`
	PatientNumber    string         `gorm:"size:30;uniqueIndex;not null" json:"patient_number"`
	NationalID       string         `gorm:"size:30;uniqueIndex" json:"national_id"`
	FullName         string         `gorm:"size:100;not null;index" json:"full_name"`
	Gender           string         `gorm:"size:10;not null" json:"gender"`
	BirthDate        string         `gorm:"size:20;not null" json:"birth_date"`
	Age              int            `json:"age"`
	Address          string         `gorm:"type:text" json:"address"`
	Phone            string         `gorm:"size:20;not null" json:"phone"`
	Email            string         `gorm:"size:100" json:"email"`
	BloodType        string         `gorm:"size:5" json:"blood_type"`
	Allergy          string         `gorm:"type:text" json:"allergy"`
	DiseaseHistory   string         `gorm:"type:text" json:"disease_history"`
	CurrentComplaint string         `gorm:"type:text" json:"current_complaint"`
	EmergencyContact string         `gorm:"size:100" json:"emergency_contact"`
	Photo            string         `gorm:"size:255" json:"photo"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// Appointment Statuses
const (
	AppointmentStatusWaiting   = "Waiting"
	AppointmentStatusConfirmed = "Confirmed"
	AppointmentStatusCompleted = "Completed"
	AppointmentStatusCancelled = "Cancelled"
)

// Appointment Model
type Appointment struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	AppointmentNumber string    `gorm:"size:30;uniqueIndex;not null" json:"appointment_number"`
	PatientID         uint      `gorm:"not null;index" json:"patient_id"`
	Patient           *Patient  `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	DoctorID          uint      `gorm:"not null;index" json:"doctor_id"`
	Doctor            *Doctor   `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	AppointmentDate   string    `gorm:"size:20;not null;index" json:"appointment_date"` // YYYY-MM-DD
	TimeSlot          string    `gorm:"size:20;not null" json:"time_slot"`              // 09:00 - 09:20
	QueueNumber       int       `gorm:"not null" json:"queue_number"`
	Status            string    `gorm:"size:30;default:'Waiting';index" json:"status"`
	Complaint         string    `gorm:"type:text" json:"complaint"`
	Notes             string    `gorm:"type:text" json:"notes"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// Queue Statuses
const (
	QueueStatusWaiting        = "Waiting"
	QueueStatusCalled         = "Called"
	QueueStatusInConsultation = "In Consultation"
	QueueStatusCompleted      = "Completed"
	QueueStatusSkipped        = "Skipped"
)

// Queue Model
type Queue struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	AppointmentID uint         `gorm:"uniqueIndex" json:"appointment_id"`
	Appointment   *Appointment `gorm:"foreignKey:AppointmentID" json:"appointment,omitempty"`
	PatientID     uint         `gorm:"not null;index" json:"patient_id"`
	Patient       *Patient     `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	DoctorID      uint         `gorm:"not null;index" json:"doctor_id"`
	Doctor        *Doctor      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	QueueNumber   int          `gorm:"not null" json:"queue_number"`
	QueueDate     string       `gorm:"size:20;not null;index" json:"queue_date"`
	Status        string       `gorm:"size:30;default:'Waiting';index" json:"status"`
	EstimatedTime string       `gorm:"size:20" json:"estimated_time"`
	CalledAt      *time.Time   `json:"called_at,omitempty"`
	CompletedAt   *time.Time   `json:"completed_at,omitempty"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

// Consultation Model
type Consultation struct {
	ID                     uint          `gorm:"primaryKey" json:"id"`
	AppointmentID          uint          `gorm:"uniqueIndex" json:"appointment_id"`
	Appointment            *Appointment  `gorm:"foreignKey:AppointmentID" json:"appointment,omitempty"`
	PatientID              uint          `gorm:"not null;index" json:"patient_id"`
	Patient                *Patient      `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	DoctorID               uint          `gorm:"not null;index" json:"doctor_id"`
	Doctor                 *Doctor       `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	VisitDate              string        `gorm:"size:20;not null;index" json:"visit_date"`
	Subjective             string        `gorm:"type:text" json:"subjective"` // Complaints
	Objective              string        `gorm:"type:text" json:"objective"`  // Physical exam / Vitals
	Assessment             string        `gorm:"type:text" json:"assessment"` // Clinical judgment
	Plan                   string        `gorm:"type:text" json:"plan"`       // Treatment plan
	Diagnosis              string        `gorm:"size:255;not null" json:"diagnosis"`
	ICD10Code              string        `gorm:"size:30;index" json:"icd10_code"`
	Treatment              string        `gorm:"type:text" json:"treatment"`
	MedicalNotes           string        `gorm:"type:text" json:"medical_notes"`
	LabRecommendation      string        `gorm:"type:text" json:"lab_recommendation"`
	NextVisitRecommendation string       `gorm:"size:20" json:"next_visit_recommendation"`
	DoctorSignature        string        `gorm:"type:text" json:"doctor_signature"`
	Prescription           *Prescription `gorm:"foreignKey:ConsultationID" json:"prescription,omitempty"`
	Invoice                *Invoice      `gorm:"foreignKey:ConsultationID" json:"invoice,omitempty"`
	CreatedAt              time.Time     `json:"created_at"`
	UpdatedAt              time.Time     `json:"updated_at"`
}

// MedicineCategory Model
type MedicineCategory struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CategoryCode string         `gorm:"size:30;uniqueIndex;not null" json:"category_code"`
	Name         string         `gorm:"size:100;not null;index" json:"name"`
	Description  string         `gorm:"type:text" json:"description"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Medicine Model
type Medicine struct {
	ID            uint              `gorm:"primaryKey" json:"id"`
	CategoryID    *uint             `gorm:"index" json:"category_id"`
	Category      *MedicineCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	MedicineCode  string            `gorm:"size:30;uniqueIndex;not null" json:"medicine_code"`
	Name          string            `gorm:"size:100;not null;index" json:"name"`
	CategoryName  string            `gorm:"size:50;index" json:"category_name"`
	Manufacturer  string            `gorm:"size:100" json:"manufacturer"`
	Unit          string            `gorm:"size:20;not null" json:"unit"` // Tablet, Syrup, Capsule, etc.
	Stock         int               `gorm:"not null;default:0" json:"stock"`
	MinStock      int               `gorm:"not null;default:10" json:"min_stock"`
	PurchasePrice float64           `gorm:"type:decimal(12,2);not null" json:"purchase_price"`
	SellingPrice  float64           `gorm:"type:decimal(12,2);not null" json:"selling_price"`
	ExpiryDate    string            `gorm:"size:20;not null;index" json:"expiry_date"`
	BatchNumber   string            `gorm:"size:50" json:"batch_number"`
	Barcode       string            `gorm:"size:50;index" json:"barcode"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	DeletedAt     gorm.DeletedAt    `gorm:"index" json:"-"`
}

// Prescription Model
type Prescription struct {
	ID                 uint               `gorm:"primaryKey" json:"id"`
	PrescriptionNumber string             `gorm:"size:30;uniqueIndex;not null" json:"prescription_number"`
	ConsultationID     uint               `gorm:"not null;index" json:"consultation_id"`
	PatientID          uint               `gorm:"not null;index" json:"patient_id"`
	Patient            *Patient           `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	DoctorID           uint               `gorm:"not null;index" json:"doctor_id"`
	Doctor             *Doctor            `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Status             string             `gorm:"size:30;default:'Pending';index" json:"status"` // Pending, Processing, Dispensed, Cancelled
	PharmacistNotes    string             `gorm:"type:text" json:"pharmacist_notes"`
	Items              []PrescriptionItem `gorm:"foreignKey:PrescriptionID" json:"items,omitempty"`
	DispensedAt        *time.Time         `json:"dispensed_at,omitempty"`
	CreatedAt          time.Time          `json:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at"`
}

// Prescription Item Model
type PrescriptionItem struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	PrescriptionID uint      `gorm:"not null;index" json:"prescription_id"`
	MedicineID     uint      `gorm:"not null;index" json:"medicine_id"`
	Medicine       *Medicine `gorm:"foreignKey:MedicineID" json:"medicine,omitempty"`
	MedicineName   string    `gorm:"size:100;not null" json:"medicine_name"`
	Dosage         string    `gorm:"size:50;not null" json:"dosage"` // 3x1 after meal
	Quantity       int       `gorm:"not null" json:"quantity"`
	UnitPrice      float64   `gorm:"type:decimal(12,2);not null" json:"unit_price"`
	Subtotal       float64   `gorm:"type:decimal(12,2);not null" json:"subtotal"`
	Instructions   string    `gorm:"type:text" json:"instructions"`
}

// Invoice Model
type Invoice struct {
	ID             uint          `gorm:"primaryKey" json:"id"`
	InvoiceNumber  string        `gorm:"size:30;uniqueIndex;not null" json:"invoice_number"`
	PatientID      uint          `gorm:"not null;index" json:"patient_id"`
	Patient        *Patient      `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	AppointmentID  *uint         `gorm:"index" json:"appointment_id,omitempty"`
	ConsultationID *uint         `gorm:"index" json:"consultation_id,omitempty"`
	DoctorFee      float64       `gorm:"type:decimal(12,2);default:0" json:"doctor_fee"`
	ProcedureFee   float64       `gorm:"type:decimal(12,2);default:0" json:"procedure_fee"`
	MedicineFee    float64       `gorm:"type:decimal(12,2);default:0" json:"medicine_fee"`
	Discount       float64       `gorm:"type:decimal(12,2);default:0" json:"discount"`
	Tax            float64       `gorm:"type:decimal(12,2);default:0" json:"tax"`
	GrandTotal     float64       `gorm:"type:decimal(12,2);not null" json:"grand_total"`
	PaymentStatus  string        `gorm:"size:30;default:'Pending';index" json:"payment_status"` // Pending, Paid, Cancelled
	PaymentMethod  string        `gorm:"size:50" json:"payment_method"`                         // Cash, Credit Card, Insurance, QRIS
	PaidAt         *time.Time    `json:"paid_at,omitempty"`
	Items          []InvoiceItem `gorm:"foreignKey:InvoiceID" json:"items,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}

// Invoice Item Model
type InvoiceItem struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	InvoiceID   uint    `gorm:"not null;index" json:"invoice_id"`
	ItemType    string  `gorm:"size:50;not null" json:"item_type"` // Doctor Fee, Procedure, Medicine
	ItemName    string  `gorm:"size:100;not null" json:"item_name"`
	Quantity    int     `gorm:"default:1" json:"quantity"`
	UnitPrice   float64 `gorm:"type:decimal(12,2);not null" json:"unit_price"`
	Subtotal    float64 `gorm:"type:decimal(12,2);not null" json:"subtotal"`
}

// Medical Record Model (Soft delete only)
type MedicalRecord struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	RecordNumber        string         `gorm:"size:30;uniqueIndex;not null" json:"record_number"`
	AppointmentID       *uint          `gorm:"index" json:"appointment_id,omitempty"`
	AppointmentNumber   string         `gorm:"size:30" json:"appointment_number,omitempty"`
	PatientID           uint           `gorm:"not null;index" json:"patient_id"`
	Patient             *Patient       `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	DoctorID            uint           `gorm:"not null;index" json:"doctor_id"`
	Doctor              *Doctor        `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	ConsultationID      uint           `gorm:"not null;index" json:"consultation_id"`
	VisitDate           string         `gorm:"size:20;not null;index" json:"visit_date"`
	Diagnosis           string         `gorm:"size:255;not null" json:"diagnosis"`
	ICD10Code           string         `gorm:"size:30" json:"icd10_code"`
	SOAPSummary         string         `gorm:"type:text" json:"soap_summary"`
	PrescriptionSummary string         `gorm:"type:text" json:"prescription_summary"`
	LabSummary          string         `gorm:"type:text" json:"lab_summary"`
	TotalCost           float64        `gorm:"type:decimal(12,2)" json:"total_cost"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

// Audit Log Model
type AuditLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index" json:"user_id"`
	UserEmail   string    `gorm:"size:100" json:"user_email"`
	UserRole    string    `gorm:"size:30" json:"user_role"`
	Action      string    `gorm:"size:50;not null;index" json:"action"` // Login, Create, Update, Delete, Dispense, Print
	Module      string    `gorm:"size:50;not null;index" json:"module"` // Auth, Doctor, Patient, Pharmacy, Billing, etc.
	Description string    `gorm:"type:text" json:"description"`
	IPAddress   string    `gorm:"size:50" json:"ip_address"`
	CreatedAt   time.Time `json:"created_at"`
}

// ClinicCMSSetting Model (PostgreSQL table `clinic_cms_settings`)
type ClinicCMSSetting struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ClinicName     string    `gorm:"size:100;not null;default:'Klinik Utama Alwi'" json:"clinic_name"`
	ClinicTagline  string    `gorm:"size:255;default:'Layanan Kesehatan Modern, Cepat & Terpercaya'" json:"clinic_tagline"`
	ClinicLogoIcon string    `gorm:"size:255" json:"clinic_logo_icon"`
	ContactPhone   string    `gorm:"size:50;default:'+628-13-1100-103'" json:"contact_phone"`
	ContactEmail   string    `gorm:"size:100;default:'info@klinikalwi.id'" json:"contact_email"`
	ContactInstagram string  `gorm:"size:255;default:'https://instagram.com/klinikalwi.official'" json:"contact_instagram"`
	ClinicAddress  string    `gorm:"type:text" json:"clinic_address"`
	HeroTitle      string    `gorm:"size:255" json:"hero_title"`
	HeroSubtitle   string    `gorm:"type:text" json:"hero_subtitle"`
	HeroBadge      string    `gorm:"size:100" json:"hero_badge"`
	GalleryHeaderTitle string `gorm:"size:255;default:'Klinik Modern & Terpercaya Untuk Keluarga Anda'" json:"gallery_header_title"`
	GalleryHeaderSubtitle string `gorm:"type:text;default:'Memberikan pelayanan medis terbaik dengan tim dokter spesialis berpengalaman dan fasilitas kesehatan modern lengkap.'" json:"gallery_header_subtitle"`
	DoctorsHeaderTitle string `gorm:"size:255;default:'TIM DOKTER SPESIALIS UNGGULAN'" json:"doctors_header_title"`
	DoctorsHeaderSubtitle string `gorm:"type:text;default:'Ditangani Oleh Dokter Spesialis Berpengalaman. Setiap pasien mendapatkan perawatan medis terbaik dari dokter spesialis profesional berlisensi resmi dengan standar pelayanan ramah dan tepat.'" json:"doctors_header_subtitle"`
	PromosHeaderTitle string `gorm:"size:255;default:'PROMO & ARTIKEL KESEHATAN BERLANGSUNG'" json:"promos_header_title"`
	FacilitiesJSON string    `gorm:"type:text" json:"facilities_json"`
	DoctorsJSON    string    `gorm:"type:text" json:"doctors_json"`
	GalleryJSON    string    `gorm:"type:text" json:"gallery_json"`
	PromosJSON     string    `gorm:"type:text" json:"promos_json"`
	UpdatedAt      time.Time `json:"updated_at"`
}
