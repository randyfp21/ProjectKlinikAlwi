package repository

import (
	"errors"
	"time"

	"backend/internal/domain"

	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{DB: db}
}

// User Repository
func (r *Repository) FindUserByUsername(identifier string) (*domain.User, error) {
	var user domain.User
	err := r.DB.Where("username = ? OR email = ? OR phone = ?", identifier, identifier, identifier).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) FindUserByID(id uint) (*domain.User, error) {
	var user domain.User
	err := r.DB.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateUser(user *domain.User) error {
	return r.DB.Create(user).Error
}

func (r *Repository) UpdateUser(user *domain.User) error {
	return r.DB.Save(user).Error
}

func (r *Repository) ListUsers(search string, role string) ([]domain.User, error) {
	var users []domain.User
	query := r.DB.Order("id desc")
	if role != "" && role != "All" {
		query = query.Where("role = ?", role)
	}
	if search != "" {
		query = query.Where("full_name LIKE ? OR username LIKE ? OR email LIKE ? OR phone LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	err := query.Find(&users).Error
	return users, err
}

func (r *Repository) DeleteUser(id uint) error {
	return r.DB.Delete(&domain.User{}, id).Error
}

// Doctor Repository
func (r *Repository) GetAllDoctors(search string) ([]domain.Doctor, error) {
	var doctors []domain.Doctor
	query := r.DB.Preload("Schedules").Preload("User")
	if search != "" {
		query = query.Where("name LIKE ? OR specialization LIKE ? OR doctor_code LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	err := query.Find(&doctors).Error
	return doctors, err
}

func (r *Repository) GetDoctorByID(id uint) (*domain.Doctor, error) {
	var doctor domain.Doctor
	err := r.DB.Preload("Schedules").Preload("User").First(&doctor, id).Error
	if err != nil {
		return nil, err
	}
	return &doctor, nil
}

func (r *Repository) CreateDoctor(doctor *domain.Doctor) error {
	return r.DB.Create(doctor).Error
}

func (r *Repository) UpdateDoctor(doctor *domain.Doctor) error {
	return r.DB.Save(doctor).Error
}

func (r *Repository) DeleteDoctor(id uint) error {
	return r.DB.Delete(&domain.Doctor{}, id).Error
}

func (r *Repository) CreateOrUpdateDoctorSchedule(schedules []domain.DoctorSchedule) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		if len(schedules) > 0 {
			tx.Where("doctor_id = ?", schedules[0].DoctorID).Delete(&domain.DoctorSchedule{})
			for _, s := range schedules {
				if err := tx.Create(&s).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

// Patient Repository
func (r *Repository) GetAllPatients(search string) ([]domain.Patient, error) {
	var patients []domain.Patient
	query := r.DB.Order("id desc")
	if search != "" {
		query = query.Where("full_name LIKE ? OR patient_number LIKE ? OR national_id LIKE ? OR phone LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	err := query.Find(&patients).Error
	return patients, err
}

func (r *Repository) FindPatientByID(id uint) (*domain.Patient, error) {
	var patient domain.Patient
	err := r.DB.First(&patient, id).Error
	if err != nil {
		return nil, err
	}
	return &patient, nil
}

func (r *Repository) FindPatientByUserID(userID uint) (*domain.Patient, error) {
	var patient domain.Patient
	err := r.DB.Where("user_id = ?", userID).First(&patient).Error
	if err != nil {
		return nil, err
	}
	return &patient, nil
}

func (r *Repository) CreatePatient(patient *domain.Patient) error {
	return r.DB.Create(patient).Error
}

func (r *Repository) UpdatePatient(patient *domain.Patient) error {
	return r.DB.Save(patient).Error
}

// Appointment Repository
func (r *Repository) GetAllAppointments(date, status string, doctorID uint) ([]domain.Appointment, error) {
	var appointments []domain.Appointment
	query := r.DB.Preload("Patient").Preload("Doctor").Order("appointment_date desc, queue_number asc")
	if date != "" {
		query = query.Where("appointment_date = ?", date)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if doctorID > 0 {
		query = query.Where("doctor_id = ?", doctorID)
	}
	err := query.Find(&appointments).Error
	return appointments, err
}

func (r *Repository) CountAppointmentsByDoctorAndDate(doctorID uint, date string) (int64, error) {
	var count int64
	err := r.DB.Model(&domain.Appointment{}).Where("doctor_id = ? AND appointment_date = ? AND status != ?", doctorID, date, domain.AppointmentStatusCancelled).Count(&count).Error
	return count, err
}

func (r *Repository) CreateAppointment(app *domain.Appointment) error {
	return r.DB.Create(app).Error
}

func (r *Repository) UpdateAppointmentStatus(id uint, status string) error {
	return r.DB.Model(&domain.Appointment{}).Where("id = ?", id).Update("status", status).Error
}

// Queue Repository
func (r *Repository) GetTodayQueues(doctorID uint, date string) ([]domain.Queue, error) {
	var queues []domain.Queue
	query := r.DB.Preload("Appointment").Preload("Patient").Preload("Doctor").Order("queue_number asc")
	if date != "" {
		query = query.Where("queue_date = ?", date)
	}
	if doctorID > 0 {
		query = query.Where("doctor_id = ?", doctorID)
	}
	err := query.Find(&queues).Error
	return queues, err
}

func (r *Repository) CreateQueue(q *domain.Queue) error {
	return r.DB.Create(q).Error
}

func (r *Repository) UpdateQueueStatus(id uint, status string) error {
	updates := map[string]interface{}{"status": status}
	now := time.Now()
	if status == domain.QueueStatusCalled {
		updates["called_at"] = &now
	} else if status == domain.QueueStatusCompleted {
		updates["completed_at"] = &now
	}
	return r.DB.Model(&domain.Queue{}).Where("id = ?", id).Updates(updates).Error
}

// Consultation Repository
func (r *Repository) CreateConsultation(c *domain.Consultation) error {
	return r.DB.Create(c).Error
}

func (r *Repository) GetConsultationsByPatientID(patientID uint) ([]domain.Consultation, error) {
	var list []domain.Consultation
	err := r.DB.Preload("Doctor").Preload("Prescription.Items").Preload("Invoice").Where("patient_id = ?", patientID).Order("visit_date desc").Find(&list).Error
	return list, err
}

func (r *Repository) GetConsultationByID(id uint) (*domain.Consultation, error) {
	var c domain.Consultation
	err := r.DB.Preload("Patient").Preload("Doctor").Preload("Prescription.Items.Medicine").Preload("Invoice.Items").First(&c, id).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// Medicine Categories Repository
func (r *Repository) GetAllMedicineCategories() ([]domain.MedicineCategory, error) {
	var list []domain.MedicineCategory
	err := r.DB.Order("id asc").Find(&list).Error
	return list, err
}

func (r *Repository) GetMedicineCategoryByID(id uint) (*domain.MedicineCategory, error) {
	var c domain.MedicineCategory
	err := r.DB.First(&c, id).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *Repository) CreateMedicineCategory(c *domain.MedicineCategory) error {
	return r.DB.Create(c).Error
}

func (r *Repository) UpdateMedicineCategory(c *domain.MedicineCategory) error {
	return r.DB.Save(c).Error
}

func (r *Repository) DeleteMedicineCategory(id uint) error {
	return r.DB.Delete(&domain.MedicineCategory{}, id).Error
}

// Medicine Repository
func (r *Repository) GetAllMedicines(search, category string) ([]domain.Medicine, error) {
	var list []domain.Medicine
	query := r.DB.Preload("Category").Order("id desc")
	if search != "" {
		query = query.Where("name LIKE ? OR medicine_code LIKE ? OR barcode LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if category != "" && category != "All" {
		query = query.Where("category_name = ? OR category_id = ?", category, category)
	}
	err := query.Find(&list).Error
	return list, err
}

func (r *Repository) GetMedicineByID(id uint) (*domain.Medicine, error) {
	var m domain.Medicine
	err := r.DB.Preload("Category").First(&m, id).Error
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *Repository) CreateMedicine(m *domain.Medicine) error {
	return r.DB.Create(m).Error
}

func (r *Repository) UpdateMedicine(m *domain.Medicine) error {
	return r.DB.Save(m).Error
}

func (r *Repository) DeleteMedicine(id uint) error {
	return r.DB.Delete(&domain.Medicine{}, id).Error
}

// Prescription Repository
func (r *Repository) GetAllPrescriptions(status string) ([]domain.Prescription, error) {
	var list []domain.Prescription
	query := r.DB.Preload("Patient").Preload("Doctor").Preload("Items.Medicine").Order("id desc")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Find(&list).Error
	return list, err
}

func (r *Repository) DispensePrescription(id uint, pharmacistNotes string) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		var rx domain.Prescription
		if err := tx.Preload("Items").First(&rx, id).Error; err != nil {
			return err
		}

		if rx.Status == "Dispensed" {
			return errors.New("prescription is already dispensed")
		}

		// Deduct stock
		for _, item := range rx.Items {
			var med domain.Medicine
			if err := tx.First(&med, item.MedicineID).Error; err != nil {
				return err
			}
			if med.Stock < item.Quantity {
				return errors.New("insufficient stock for medicine: " + med.Name)
			}
			med.Stock -= item.Quantity
			if err := tx.Save(&med).Error; err != nil {
				return err
			}
		}

		now := time.Now()
		rx.Status = "Dispensed"
		rx.PharmacistNotes = pharmacistNotes
		rx.DispensedAt = &now
		return tx.Save(&rx).Error
	})
}

// Invoice Repository
func (r *Repository) GetAllInvoices(status string) ([]domain.Invoice, error) {
	var list []domain.Invoice
	query := r.DB.Preload("Patient").Preload("Items").Order("id desc")
	if status != "" {
		query = query.Where("payment_status = ?", status)
	}
	err := query.Find(&list).Error
	return list, err
}

func (r *Repository) CreateInvoice(inv *domain.Invoice) error {
	return r.DB.Create(inv).Error
}

func (r *Repository) PayInvoice(id uint, method string) error {
	now := time.Now()
	return r.DB.Model(&domain.Invoice{}).Where("id = ?", id).Updates(map[string]interface{}{
		"payment_status": "Paid",
		"payment_method": method,
		"paid_at":        &now,
	}).Error
}

// Medical Record Repository (Soft Delete Protection)
func (r *Repository) GetAllMedicalRecords(patientID uint, search string) ([]domain.MedicalRecord, error) {
	var list []domain.MedicalRecord
	query := r.DB.Preload("Patient").Preload("Doctor").Order("visit_date desc")
	if patientID > 0 {
		query = query.Where("patient_id = ?", patientID)
	}
	if search != "" {
		query = query.Where("diagnosis LIKE ? OR icd10_code LIKE ? OR record_number LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	err := query.Find(&list).Error
	return list, err
}

func (r *Repository) CreateMedicalRecord(mr *domain.MedicalRecord) error {
	return r.DB.Create(mr).Error
}

// Audit Log Repository
func (r *Repository) GetAuditLogs(limit int) ([]domain.AuditLog, error) {
	var list []domain.AuditLog
	err := r.DB.Order("id desc").Limit(limit).Find(&list).Error
	return list, err
}

func (r *Repository) CreateAuditLog(log *domain.AuditLog) error {
	return r.DB.Create(log).Error
}

// Clinic CMS Settings Repository
func (r *Repository) GetCMSSetting() (*domain.ClinicCMSSetting, error) {
	var setting domain.ClinicCMSSetting
	err := r.DB.First(&setting, 1).Error
	if err != nil {
		setting = domain.ClinicCMSSetting{
			ID:            1,
			ClinicName:    "Klinik Utama Alwi",
			ClinicTagline: "Layanan Kesehatan Modern, Cepat & Terpercaya",
			ContactPhone:  "+628-13-1100-103",
			ContactEmail:  "info@klinikalwi.id",
			ClinicAddress: "📍 Jl. Jalur 20, blok 47, No.24B Meruya Utara, Kembangan Jakarta barat",
			HeroTitle:     "Klinik Modern & Terpercaya Untuk Keluarga Anda",
			HeroSubtitle:  "Memberikan pelayanan medis terbaik dengan tim dokter spesialis berpengalaman dan fasilitas kesehatan modern lengkap.",
			HeroBadge:     "Klinik Alwi Shahab • 24/7 Home Service Available",
		}
		_ = r.DB.Create(&setting).Error
	}
	return &setting, nil
}

func (r *Repository) UpdateCMSSetting(setting *domain.ClinicCMSSetting) error {
	setting.ID = 1
	return r.DB.Save(setting).Error
}
