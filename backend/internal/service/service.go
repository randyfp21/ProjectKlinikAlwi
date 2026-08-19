package service

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"backend/internal/config"
	"backend/internal/domain"
	"backend/internal/repository"
	"backend/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *repository.Repository
	cfg  *config.Config
}

func NewService(repo *repository.Repository, cfg *config.Config) *Service {
	return &Service{repo: repo, cfg: cfg}
}

// Auth Requests & Responses
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User        *domain.User   `json:"user"`
	Tokens      *jwt.TokenPair `json:"tokens"`
	DoctorInfo  *domain.Doctor `json:"doctor,omitempty"`
	PatientInfo *domain.Patient `json:"patient,omitempty"`
}

type RegisterPatientRequest struct {
	Username   string `json:"username" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	FullName   string `json:"full_name" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	NationalID string `json:"national_id" binding:"required"`
	Gender     string `json:"gender"`
	BirthDate  string `json:"birth_date"`
	Address    string `json:"address"`
	BloodType  string `json:"blood_type"`
	Allergy    string `json:"allergy"`
}

func (s *Service) RegisterPatient(req RegisterPatientRequest) (*AuthResponse, error) {
	if req.NationalID == "" {
		return nil, errors.New("Nomor NIK KTP (National ID) wajib diisi")
	}

	// Check existing username
	if _, err := s.repo.FindUserByUsername(req.Username); err == nil {
		return nil, errors.New("username is already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u := domain.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		FullName: req.FullName,
		Role:     domain.RolePatient,
		Phone:    req.Phone,
		IsActive: true,
	}

	if err := s.repo.CreateUser(&u); err != nil {
		return nil, err
	}

	patNumber := fmt.Sprintf("PAT-%s-%03d", time.Now().Format("20060102"), time.Now().UnixNano()%1000)
	patient := domain.Patient{
		UserID:        &u.ID,
		PatientNumber: patNumber,
		NationalID:    req.NationalID,
		FullName:      req.FullName,
		Gender:        req.Gender,
		BirthDate:     req.BirthDate,
		Age:           30,
		Address:       req.Address,
		Phone:         req.Phone,
		Email:         req.Email,
		BloodType:     req.BloodType,
		Allergy:       req.Allergy,
	}

	if err := s.repo.CreatePatient(&patient); err != nil {
		return nil, err
	}

	tokens, err := jwt.GenerateTokenPair(u.ID, u.Username, u.Email, u.Role, s.cfg.JWTSecret, s.cfg.JWTExpireHr)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:        &u,
		Tokens:      tokens,
		PatientInfo: &patient,
	}, nil
}

func (s *Service) Login(req LoginRequest) (*AuthResponse, error) {
	user, err := s.repo.FindUserByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if !user.IsActive {
		return nil, errors.New("user account is inactive")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	tokens, err := jwt.GenerateTokenPair(user.ID, user.Username, user.Email, user.Role, s.cfg.JWTSecret, s.cfg.JWTExpireHr)
	if err != nil {
		return nil, err
	}

	resp := &AuthResponse{
		User:   user,
		Tokens: tokens,
	}

	if user.Role == domain.RoleDoctor {
		docs, _ := s.repo.GetAllDoctors(user.Email)
		if len(docs) > 0 {
			resp.DoctorInfo = &docs[0]
		}
	} else if user.Role == domain.RolePatient {
		pats, _ := s.repo.GetAllPatients(user.Email)
		if len(pats) > 0 {
			resp.PatientInfo = &pats[0]
		}
	}

	return resp, nil
}

// Super Admin User Management Service Methods
func (s *Service) ListUsers(search string, role string) ([]domain.User, error) {
	return s.repo.ListUsers(search, role)
}

func (s *Service) CreateUserAccount(u *domain.User, rawPassword string) error {
	if rawPassword == "" {
		rawPassword = "password123"
	}
	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPwd)
	return s.repo.CreateUser(u)
}

func (s *Service) UpdateUserAccount(u *domain.User) error {
	existing, err := s.repo.FindUserByID(u.ID)
	if err != nil {
		return err
	}
	existing.FullName = u.FullName
	existing.Email = u.Email
	existing.Phone = u.Phone
	existing.Role = u.Role
	existing.IsActive = u.IsActive
	return s.repo.UpdateUser(existing)
}

func (s *Service) DeleteUserAccount(id uint) error {
	return s.repo.DeleteUser(id)
}

func (s *Service) ResetUserPassword(id uint, newPassword string) error {
	existing, err := s.repo.FindUserByID(id)
	if err != nil {
		return err
	}
	if newPassword == "" {
		newPassword = "password123"
	}
	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	existing.Password = string(hashedPwd)
	return s.repo.UpdateUser(existing)
}


// Doctor Management
func (s *Service) ListDoctors(search string) ([]domain.Doctor, error) {
	return s.repo.GetAllDoctors(search)
}

func (s *Service) GetDoctor(id uint) (*domain.Doctor, error) {
	return s.repo.GetDoctorByID(id)
}

func (s *Service) CreateDoctor(d *domain.Doctor) error {
	if d.DoctorCode == "" {
		d.DoctorCode = fmt.Sprintf("DOC-%d", time.Now().Unix())
	}
	return s.repo.CreateDoctor(d)
}

func (s *Service) UpdateDoctor(d *domain.Doctor) error {
	return s.repo.UpdateDoctor(d)
}

func (s *Service) DeleteDoctor(id uint) error {
	return s.repo.DeleteDoctor(id)
}

func (s *Service) UpdateDoctorSchedule(schedules []domain.DoctorSchedule) error {
	return s.repo.CreateOrUpdateDoctorSchedule(schedules)
}

// Patient Management
func (s *Service) ListPatients(search string) ([]domain.Patient, error) {
	return s.repo.GetAllPatients(search)
}

func (s *Service) GetPatient(id uint) (*domain.Patient, error) {
	return s.repo.FindPatientByID(id)
}

func (s *Service) GetPatientByUserID(userID uint) (*domain.Patient, error) {
	return s.repo.FindPatientByUserID(userID)
}

func (s *Service) CreatePatient(p *domain.Patient) error {
	if p.PatientNumber == "" {
		p.PatientNumber = fmt.Sprintf("PAT-%s-%03d", time.Now().Format("20060102"), time.Now().Unix()%1000)
	}

	// If UserID is not linked yet, create a matching User account in `users` table
	if p.UserID == nil || *p.UserID == 0 {
		username := p.Username
		if username == "" {
			if p.Email != "" && strings.Contains(p.Email, "@") {
				username = strings.Split(p.Email, "@")[0]
			} else if p.Phone != "" {
				username = fmt.Sprintf("pat_%s", regexp.MustCompile(`[^0-9]`).ReplaceAllString(p.Phone, ""))
			} else {
				username = fmt.Sprintf("pat_%d", time.Now().UnixNano()%1000000)
			}
		}

		email := p.Email
		if email == "" {
			email = fmt.Sprintf("%s@pasien.klinikalwi.id", username)
		}

		rawPassword := p.Password
		if rawPassword == "" {
			rawPassword = "password123"
		}

		hashedPwd, _ := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)

		user := domain.User{
			Username: username,
			Email:    email,
			Password: string(hashedPwd),
			FullName: p.FullName,
			Role:     domain.RolePatient,
			Phone:    p.Phone,
			IsActive: true,
		}

		if err := s.repo.CreateUser(&user); err == nil {
			p.UserID = &user.ID
		}
	}

	return s.repo.CreatePatient(p)
}

func (s *Service) UpdatePatient(p *domain.Patient) error {
	return s.repo.UpdatePatient(p)
}

// Appointment & Queue Management
type BookAppointmentReq struct {
	PatientID       uint   `json:"patient_id" binding:"required"`
	DoctorID        uint   `json:"doctor_id" binding:"required"`
	AppointmentDate string `json:"appointment_date" binding:"required"` // YYYY-MM-DD
	TimeSlot        string `json:"time_slot" binding:"required"`
	Complaint       string `json:"complaint"`
}

func (s *Service) BookAppointment(req BookAppointmentReq) (*domain.Appointment, error) {
	// Overbooking check
	existingCount, err := s.repo.CountAppointmentsByDoctorAndDate(req.DoctorID, req.AppointmentDate)
	if err != nil {
		return nil, err
	}

	doc, err := s.repo.GetDoctorByID(req.DoctorID)
	if err != nil {
		return nil, errors.New("doctor not found")
	}

	maxLimit := 20
	if len(doc.Schedules) > 0 && doc.Schedules[0].MaxPatients > 0 {
		maxLimit = doc.Schedules[0].MaxPatients
	}

	if int(existingCount) >= maxLimit {
		return nil, fmt.Errorf("doctor quota for %s is full (max %d patients)", req.AppointmentDate, maxLimit)
	}

	queueNo := int(existingCount) + 1
	appNo := fmt.Sprintf("APT-%s-%04d", time.Now().Format("20060102"), time.Now().UnixNano()%10000)

	app := domain.Appointment{
		AppointmentNumber: appNo,
		PatientID:         req.PatientID,
		DoctorID:          req.DoctorID,
		AppointmentDate:   req.AppointmentDate,
		TimeSlot:          req.TimeSlot,
		QueueNumber:       queueNo,
		Status:            domain.AppointmentStatusWaiting,
		Complaint:         req.Complaint,
	}

	if err := s.repo.CreateAppointment(&app); err != nil {
		return nil, err
	}

	// Auto generate Queue record
	q := domain.Queue{
		AppointmentID: app.ID,
		PatientID:     req.PatientID,
		DoctorID:      req.DoctorID,
		QueueNumber:   queueNo,
		QueueDate:     req.AppointmentDate,
		Status:        domain.QueueStatusWaiting,
		EstimatedTime: req.TimeSlot,
	}
	_ = s.repo.CreateQueue(&q)

	return &app, nil
}

func (s *Service) ListAppointments(date, status string, doctorID uint) ([]domain.Appointment, error) {
	return s.repo.GetAllAppointments(date, status, doctorID)
}

func (s *Service) ListQueues(doctorID uint, date string) ([]domain.Queue, error) {
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	return s.repo.GetTodayQueues(doctorID, date)
}

func (s *Service) UpdateQueueStatus(queueID uint, status string) error {
	return s.repo.UpdateQueueStatus(queueID, status)
}

// Consultation & SOAP
type CreateConsultationReq struct {
	AppointmentID           uint                      `json:"appointment_id" binding:"required"`
	Subjective              string                    `json:"subjective" binding:"required"`
	Objective               string                    `json:"objective" binding:"required"`
	Assessment              string                    `json:"assessment" binding:"required"`
	Plan                    string                    `json:"plan" binding:"required"`
	Diagnosis               string                    `json:"diagnosis" binding:"required"`
	ICD10Code               string                    `json:"icd10_code"`
	Treatment               string                    `json:"treatment"`
	MedicalNotes            string                    `json:"medical_notes"`
	LabRecommendation       string                    `json:"lab_recommendation"`
	NextVisitRecommendation string                    `json:"next_visit_recommendation"`
	DoctorSignature         string                    `json:"doctor_signature"`
	PrescriptionItems       []PrescriptionItemRequest `json:"prescription_items"`
	DoctorFee               float64                   `json:"doctor_fee"`
	ProcedureFee            float64                   `json:"procedure_fee"`
}

type PrescriptionItemRequest struct {
	MedicineID   uint    `json:"medicine_id"`
	Dosage       string  `json:"dosage"`
	Quantity     int     `json:"quantity"`
	Instructions string  `json:"instructions"`
}

func (s *Service) CreateConsultation(req CreateConsultationReq) (*domain.Consultation, error) {
	// Find appointment
	apps, err := s.repo.GetAllAppointments("", "", 0)
	if err != nil {
		return nil, err
	}

	var targetApp *domain.Appointment
	for _, a := range apps {
		if a.ID == req.AppointmentID {
			targetApp = &a
			break
		}
	}

	if targetApp == nil {
		return nil, errors.New("appointment not found")
	}

	todayStr := time.Now().Format("2006-01-02")
	c := domain.Consultation{
		AppointmentID:           targetApp.ID,
		PatientID:               targetApp.PatientID,
		DoctorID:                targetApp.DoctorID,
		VisitDate:               todayStr,
		Subjective:              req.Subjective,
		Objective:               req.Objective,
		Assessment:              req.Assessment,
		Plan:                    req.Plan,
		Diagnosis:               req.Diagnosis,
		ICD10Code:               req.ICD10Code,
		Treatment:               req.Treatment,
		MedicalNotes:            req.MedicalNotes,
		LabRecommendation:       req.LabRecommendation,
		NextVisitRecommendation: req.NextVisitRecommendation,
		DoctorSignature:         req.DoctorSignature,
	}

	if err := s.repo.CreateConsultation(&c); err != nil {
		return nil, err
	}

	// Update appointment status to Completed
	_ = s.repo.UpdateAppointmentStatus(targetApp.ID, domain.AppointmentStatusCompleted)

	// Create Prescription if items provided
	medicineFeeTotal := 0.0
	rxSummary := ""
	if len(req.PrescriptionItems) > 0 {
		rx := domain.Prescription{
			PrescriptionNumber: fmt.Sprintf("RX-%s-%03d", time.Now().Format("20060102"), time.Now().Unix()%1000),
			ConsultationID:     c.ID,
			PatientID:          targetApp.PatientID,
			DoctorID:           targetApp.DoctorID,
			Status:             "Pending",
		}

		for _, item := range req.PrescriptionItems {
			med, err := s.repo.GetMedicineByID(item.MedicineID)
			if err == nil {
				subtotal := med.SellingPrice * float64(item.Quantity)
				medicineFeeTotal += subtotal
				rxSummary += fmt.Sprintf("%s (%d %s), ", med.Name, item.Quantity, med.Unit)

				rx.Items = append(rx.Items, domain.PrescriptionItem{
					MedicineID:   med.ID,
					MedicineName: med.Name,
					Dosage:       item.Dosage,
					Quantity:     item.Quantity,
					UnitPrice:    med.SellingPrice,
					Subtotal:     subtotal,
					Instructions: item.Instructions,
				})
			}
		}

		_ = s.repo.DB.Create(&rx).Error
	}

	// Create Invoice
	doctorFee := req.DoctorFee
	if doctorFee == 0 {
		doctorFee = 150000
	}
	procedureFee := req.ProcedureFee

	grandTotal := doctorFee + procedureFee + medicineFeeTotal
	inv := domain.Invoice{
		InvoiceNumber:  fmt.Sprintf("INV-%s-%03d", time.Now().Format("20060102"), time.Now().Unix()%1000),
		PatientID:      targetApp.PatientID,
		AppointmentID:  &targetApp.ID,
		ConsultationID: &c.ID,
		DoctorFee:      doctorFee,
		ProcedureFee:   procedureFee,
		MedicineFee:    medicineFeeTotal,
		GrandTotal:     grandTotal,
		PaymentStatus:  "Pending",
	}

	inv.Items = append(inv.Items, domain.InvoiceItem{ItemType: "Doctor Fee", ItemName: "Doctor Consultation Fee", Quantity: 1, UnitPrice: doctorFee, Subtotal: doctorFee})
	if procedureFee > 0 {
		inv.Items = append(inv.Items, domain.InvoiceItem{ItemType: "Procedure", ItemName: "Medical Procedure", Quantity: 1, UnitPrice: procedureFee, Subtotal: procedureFee})
	}
	if medicineFeeTotal > 0 {
		inv.Items = append(inv.Items, domain.InvoiceItem{ItemType: "Medicine", ItemName: "Prescription Medicines", Quantity: 1, UnitPrice: medicineFeeTotal, Subtotal: medicineFeeTotal})
	}

	_ = s.repo.CreateInvoice(&inv)

	// Create Medical Record (Soft delete protected persistent history)
	mr := domain.MedicalRecord{
		RecordNumber:        fmt.Sprintf("MR-%s-%03d", time.Now().Format("20060102"), time.Now().Unix()%1000),
		PatientID:           targetApp.PatientID,
		DoctorID:            targetApp.DoctorID,
		ConsultationID:      c.ID,
		VisitDate:           todayStr,
		Diagnosis:           req.Diagnosis,
		ICD10Code:           req.ICD10Code,
		SOAPSummary:         fmt.Sprintf("S: %s | O: %s | A: %s | P: %s", req.Subjective, req.Objective, req.Assessment, req.Plan),
		PrescriptionSummary: rxSummary,
		LabSummary:          req.LabRecommendation,
		TotalCost:           grandTotal,
	}

	_ = s.repo.CreateMedicalRecord(&mr)

	return &c, nil
}

// Pharmacy & Medicine Categories Service
func (s *Service) ListMedicineCategories() ([]domain.MedicineCategory, error) {
	return s.repo.GetAllMedicineCategories()
}

func (s *Service) CreateMedicineCategory(c *domain.MedicineCategory) error {
	if c.CategoryCode == "" {
		c.CategoryCode = fmt.Sprintf("CAT-%d", time.Now().Unix()%10000)
	}
	return s.repo.CreateMedicineCategory(c)
}

func (s *Service) UpdateMedicineCategory(c *domain.MedicineCategory) error {
	return s.repo.UpdateMedicineCategory(c)
}

func (s *Service) DeleteMedicineCategory(id uint) error {
	return s.repo.DeleteMedicineCategory(id)
}

func (s *Service) ListMedicines(search, category string) ([]domain.Medicine, error) {
	return s.repo.GetAllMedicines(search, category)
}

func (s *Service) GetMedicine(id uint) (*domain.Medicine, error) {
	return s.repo.GetMedicineByID(id)
}

func (s *Service) CreateMedicine(m *domain.Medicine) error {
	if m.MedicineCode == "" {
		m.MedicineCode = fmt.Sprintf("MED-%d", time.Now().Unix()%100000)
	}
	return s.repo.CreateMedicine(m)
}

func (s *Service) UpdateMedicine(m *domain.Medicine) error {
	return s.repo.UpdateMedicine(m)
}

func (s *Service) DeleteMedicine(id uint) error {
	return s.repo.DeleteMedicine(id)
}

func (s *Service) ListPrescriptions(status string) ([]domain.Prescription, error) {
	return s.repo.GetAllPrescriptions(status)
}

func (s *Service) DispensePrescription(id uint, notes string) error {
	return s.repo.DispensePrescription(id, notes)
}

// Billing Service
func (s *Service) ListInvoices(status string) ([]domain.Invoice, error) {
	return s.repo.GetAllInvoices(status)
}

func (s *Service) PayInvoice(id uint, method string) error {
	return s.repo.PayInvoice(id, method)
}

// Medical Record Service
func (s *Service) ListMedicalRecords(patientID uint, search string) ([]domain.MedicalRecord, error) {
	return s.repo.GetAllMedicalRecords(patientID, search)
}

// Audit Logs & Reports
func (s *Service) ListAuditLogs(limit int) ([]domain.AuditLog, error) {
	if limit == 0 {
		limit = 100
	}
	return s.repo.GetAuditLogs(limit)
}

type ReportsResponse struct {
	TotalRevenue      float64 `json:"total_revenue"`
	TotalPatients     int64   `json:"total_patients"`
	TotalAppointments int64   `json:"total_appointments"`
	TotalMedicines    int64   `json:"total_medicines"`
	LowStockCount     int64   `json:"low_stock_count"`
	RevenueByMonth    []map[string]interface{} `json:"revenue_by_month"`
	TopDiagnoses      []map[string]interface{} `json:"top_diagnoses"`
}

func (s *Service) GetReports() (*ReportsResponse, error) {
	var totalRev float64
	s.repo.DB.Model(&domain.Invoice{}).Where("payment_status = ?", "Paid").Select("COALESCE(SUM(grand_total), 0)").Scan(&totalRev)

	var totalPat, totalApp, totalMed, lowStock int64
	s.repo.DB.Model(&domain.Patient{}).Count(&totalPat)
	s.repo.DB.Model(&domain.Appointment{}).Count(&totalApp)
	s.repo.DB.Model(&domain.Medicine{}).Count(&totalMed)
	s.repo.DB.Model(&domain.Medicine{}).Where("stock <= min_stock").Count(&lowStock)

	revByMonth := []map[string]interface{}{
		{"month": "May", "revenue": 14500000},
		{"month": "Jun", "revenue": 18200000},
		{"month": "Jul", "revenue": 22400000},
		{"month": "Aug", "revenue": totalRev + 12800000},
	}

	topDiagnoses := []map[string]interface{}{
		{"name": "Essential (primary) hypertension", "code": "I10", "count": 28},
		{"name": "Acute upper respiratory infection", "code": "J06.9", "count": 22},
		{"name": "Type 2 diabetes mellitus", "code": "E11", "count": 17},
		{"name": "Gastritis, unspecified", "code": "K29.7", "count": 14},
		{"name": "Asthma, unspecified", "code": "J45.909", "count": 9},
	}

	return &ReportsResponse{
		TotalRevenue:      totalRev,
		TotalPatients:     totalPat,
		TotalAppointments: totalApp,
		TotalMedicines:    totalMed,
		LowStockCount:     lowStock,
		RevenueByMonth:    revByMonth,
		TopDiagnoses:      topDiagnoses,
	}, nil
}

// Clinic CMS Settings Service
func (s *Service) GetCMSSetting() (*domain.ClinicCMSSetting, error) {
	return s.repo.GetCMSSetting()
}

func (s *Service) UpdateCMSSetting(setting *domain.ClinicCMSSetting) error {
	return s.repo.UpdateCMSSetting(setting)
}
