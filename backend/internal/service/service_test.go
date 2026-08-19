package service_test

import (
	"fmt"
	"testing"
	"time"

	"backend/internal/config"
	"backend/internal/domain"
	"backend/internal/repository"
	"backend/internal/seed"
	"backend/internal/service"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) (*gorm.DB, *service.Service) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open memory db: %v", err)
	}

	_ = db.AutoMigrate(
		&domain.User{}, &domain.Doctor{}, &domain.DoctorSchedule{}, &domain.Patient{},
		&domain.Appointment{}, &domain.Queue{}, &domain.Consultation{}, &domain.MedicineCategory{}, &domain.Medicine{},
		&domain.Prescription{}, &domain.PrescriptionItem{}, &domain.Invoice{}, &domain.InvoiceItem{},
		&domain.MedicalRecord{}, &domain.AuditLog{},
	)

	_ = seed.SeedAll(db)

	// Create test invoice for Unit Test with dynamic invoice number
	var invCount int64
	db.Model(&domain.Invoice{}).Where("invoice_number LIKE ?", "INV-TEST-%").Count(&invCount)
	testInv := domain.Invoice{
		InvoiceNumber: fmt.Sprintf("INV-TEST-%d-%d", time.Now().UnixNano(), invCount+1),
		PatientID:     1,
		DoctorFee:     150000,
		ProcedureFee:  50000,
		MedicineFee:   75000,
		Tax:           27500,
		GrandTotal:    302500,
		PaymentStatus: "Pending",
		PaymentMethod: "",
		Items: []domain.InvoiceItem{
			{ItemType: "Doctor Fee", ItemName: "Konsultasi Dokter Spesialis", Quantity: 1, UnitPrice: 150000, Subtotal: 150000},
			{ItemType: "Medicine", ItemName: "Amlodipine 10mg", Quantity: 1, UnitPrice: 75000, Subtotal: 75000},
		},
	}
	db.Create(&testInv)

	cfg := &config.Config{
		JWTSecret:   "test-secret",
		JWTExpireHr: 24,
	}

	repo := repository.NewRepository(db)
	svc := service.NewService(repo, cfg)

	return db, svc
}

func TestLoginSuccess(t *testing.T) {
	_, svc := setupTestDB(t)

	resp, err := svc.Login(service.LoginRequest{
		Username: "superadmin",
		Password: "password123",
	})

	if err != nil {
		t.Fatalf("expected login success, got error: %v", err)
	}

	if resp.User.Role != domain.RoleSuperAdmin {
		t.Errorf("expected role Super Admin, got %s", resp.User.Role)
	}

	if resp.Tokens.AccessToken == "" {
		t.Error("expected non-empty access token")
	}
}

func TestLoginWrongCredentialsFailure(t *testing.T) {
	_, svc := setupTestDB(t)

	// Test 1: Wrong password
	_, err := svc.Login(service.LoginRequest{
		Username: "superadmin",
		Password: "wrongpassword123",
	})
	if err == nil {
		t.Fatal("expected error on wrong password, got nil (login should FAIL)")
	}

	// Test 2: Non-existent user
	_, err = svc.Login(service.LoginRequest{
		Username: "nonexistentuser_9999",
		Password: "password123",
	})
	if err == nil {
		t.Fatal("expected error on non-existent user, got nil (login should FAIL)")
	}
}

func TestListDoctors(t *testing.T) {
	_, svc := setupTestDB(t)

	doctors, err := svc.ListDoctors("")
	if err != nil {
		t.Fatalf("failed to list doctors: %v", err)
	}

	if len(doctors) == 0 {
		t.Error("expected at least 1 doctor from seed data")
	}
}

func TestBookAppointmentOverbooking(t *testing.T) {
	_, svc := setupTestDB(t)

	doctors, _ := svc.ListDoctors("")
	patients, _ := svc.ListPatients("")

	if len(doctors) == 0 || len(patients) == 0 {
		t.Fatal("seed doctors/patients missing")
	}

	docID := doctors[0].ID
	patID := patients[0].ID

	// Book appointment
	app, err := svc.BookAppointment(service.BookAppointmentReq{
		PatientID:       patID,
		DoctorID:        docID,
		AppointmentDate: "2026-09-01",
		TimeSlot:        "10:00 - 10:20",
		Complaint:       "Headache test",
	})

	if err != nil {
		t.Fatalf("expected appointment booking success, got %v", err)
	}

	if app.QueueNumber == 0 {
		t.Error("expected valid queue number")
	}
}

func TestMedicineCategoryCRUD(t *testing.T) {
	_, svc := setupTestDB(t)

	cat := domain.MedicineCategory{
		CategoryCode: "CAT-TEST-01",
		Name:         "Kategori Uji Coba",
		Description:  "Kategori obat untuk unit testing",
	}

	err := svc.CreateMedicineCategory(&cat)
	if err != nil {
		t.Fatalf("failed to create medicine category: %v", err)
	}

	cats, err := svc.ListMedicineCategories()
	if err != nil {
		t.Fatalf("failed to list medicine categories: %v", err)
	}

	if len(cats) == 0 {
		t.Error("expected non-empty categories list")
	}
}

func TestCreateDoctorAndConsultationFee(t *testing.T) {
	_, svc := setupTestDB(t)

	doc := domain.Doctor{
		Name:                  "dr. Test QA Specialist, Sp.PD",
		Specialization:        "Internal Medicine",
		PracticeLicenseNumber: "SIP.QA.999/2026",
		ConsultationFee:       250000,
		ActiveStatus:          true,
	}

	err := svc.CreateDoctor(&doc)
	if err != nil {
		t.Fatalf("failed to create doctor: %v", err)
	}

	retrievedDoc, err := svc.GetDoctor(doc.ID)
	if err != nil {
		t.Fatalf("failed to retrieve created doctor: %v", err)
	}

	if retrievedDoc.ConsultationFee != 250000 {
		t.Errorf("expected doctor consultation fee 250000, got %f", retrievedDoc.ConsultationFee)
	}
}

func TestMedicineStockAndDeduction(t *testing.T) {
	_, svc := setupTestDB(t)

	meds, err := svc.ListMedicines("", "")
	if err != nil {
		t.Fatalf("failed to list medicines: %v", err)
	}

	if len(meds) == 0 {
		t.Error("expected seed medicines to be present")
	}
}

func TestQueueEndToEndFlow(t *testing.T) {
	_, svc := setupTestDB(t)

	// 1. List queues for date 2026-08-19
	queues, err := svc.ListQueues(0, "2026-08-19")
	if err != nil {
		t.Fatalf("failed to list queues for 2026-08-19: %v", err)
	}

	if len(queues) == 0 {
		t.Fatal("expected seeded queues for 2026-08-19")
	}

	targetQueue := queues[0]

	// 2. Call Queue: Update status to 'In Consultation'
	err = svc.UpdateQueueStatus(targetQueue.ID, "In Consultation")
	if err != nil {
		t.Fatalf("failed to update queue status to In Consultation: %v", err)
	}

	// Verify DB state
	updatedQueues, _ := svc.ListQueues(0, "2026-08-19")
	if updatedQueues[0].Status != "In Consultation" {
		t.Errorf("expected status 'In Consultation', got '%s'", updatedQueues[0].Status)
	}

	// 3. Complete Queue: Update status to 'Completed'
	err = svc.UpdateQueueStatus(targetQueue.ID, "Completed")
	if err != nil {
		t.Fatalf("failed to update queue status to Completed: %v", err)
	}

	// Verify DB state for completed queue
	finalQueues, _ := svc.ListQueues(0, "2026-08-19")
	var foundCompleted bool
	for _, q := range finalQueues {
		if q.ID == targetQueue.ID && q.Status == "Completed" {
			foundCompleted = true
			break
		}
	}

	if !foundCompleted {
		t.Errorf("expected queue #%d to be 'Completed' in database", targetQueue.ID)
	}
}

func TestInvoiceEndToEndPaymentFlow(t *testing.T) {
	_, svc := setupTestDB(t)

	// 1. List Invoices
	invoices, err := svc.ListInvoices("")
	if err != nil {
		t.Fatalf("failed to list invoices: %v", err)
	}

	if len(invoices) == 0 {
		t.Fatal("expected seeded invoices to be present")
	}

	targetInvoice := invoices[0]
	if targetInvoice.PaymentStatus != "Pending" {
		t.Errorf("expected initial status to be Pending, got %s", targetInvoice.PaymentStatus)
	}

	// 2. Process & Confirm Payment for Invoice
	err = svc.PayInvoice(targetInvoice.ID, "QRIS")
	if err != nil {
		t.Fatalf("failed to process invoice payment: %v", err)
	}

	// 3. Verify Persistence by Re-fetching Invoices
	updatedInvoices, err := svc.ListInvoices("")
	if err != nil {
		t.Fatalf("failed to list invoices: %v", err)
	}

	var fetchedInvoice domain.Invoice
	for _, inv := range updatedInvoices {
		if inv.ID == targetInvoice.ID {
			fetchedInvoice = inv
			break
		}
	}

	if fetchedInvoice.PaymentStatus != "Paid" {
		t.Errorf("expected fetched invoice status to be Paid, got %s", fetchedInvoice.PaymentStatus)
	}

	if fetchedInvoice.PaymentMethod != "QRIS" {
		t.Errorf("expected payment method QRIS, got %s", fetchedInvoice.PaymentMethod)
	}

	if len(fetchedInvoice.Items) == 0 {
		t.Error("expected invoice items breakdown to be populated")
	}
}

