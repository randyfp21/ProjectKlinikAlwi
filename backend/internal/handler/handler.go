package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"backend/internal/domain"
	"backend/internal/middleware"
	"backend/internal/service"
	"backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc    *service.Service
	secret string
}

func NewHandler(svc *service.Service, secret string) *Handler {
	return &Handler{svc: svc, secret: secret}
}

func (h *Handler) RegisterRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")

	// Public File Upload & Auth Routes
	v1.POST("/upload", h.UploadFile)
	authGroup := v1.Group("/auth")
	{
		authGroup.POST("/login", h.Login)
		authGroup.POST("/register-patient", h.RegisterPatient)
		authGroup.POST("/forgot-password", h.ForgotPassword)
	}

	// Public CMS route for landing page
	v1.GET("/cms", h.GetCMSSetting)

	// Protected Routes
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware(h.secret))
	{
		// CMS Settings Route
		protected.PUT("/cms", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.UpdateCMSSetting)
		// Profile & Password
		protected.GET("/auth/me", h.GetProfile)
		protected.POST("/auth/change-password", h.ChangePassword)

		// Super Admin User Management Routes
		users := protected.Group("/users")
		users.Use(middleware.RequireRoles(domain.RoleSuperAdmin))
		{
			users.GET("", h.ListUsers)
			users.POST("", h.CreateUser)
			users.PUT("/:id", h.UpdateUser)
			users.DELETE("/:id", h.DeleteUser)
			users.POST("/:id/reset-password", h.ResetUserPassword)
		}

		// Doctor Routes
		doctors := protected.Group("/doctors")
		{
			doctors.GET("", h.ListDoctors)
			doctors.GET("/:id", h.GetDoctor)
			doctors.POST("", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.CreateDoctor)
			doctors.PUT("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.UpdateDoctor)
			doctors.DELETE("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.DeleteDoctor)
			doctors.POST("/:id/schedules", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RoleDoctor), h.UpdateDoctorSchedule)
		}

		// Patient Routes
		patients := protected.Group("/patients")
		{
			patients.GET("", h.ListPatients)
			patients.GET("/:id", h.GetPatient)
			patients.POST("", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RoleDoctor), h.CreatePatient)
			patients.PUT("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RoleDoctor), h.UpdatePatient)
		}

		// Appointment & Queue Routes
		appointments := protected.Group("/appointments")
		{
			appointments.GET("", h.ListAppointments)
			appointments.POST("", h.BookAppointment)
		}

		queues := protected.Group("/queues")
		{
			queues.GET("", h.ListQueues)
			queues.PUT("/:id/status", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RoleDoctor), h.UpdateQueueStatus)
			queues.PATCH("/:id/status", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RoleDoctor), h.UpdateQueueStatus)
		}

		// Consultation & SOAP
		consultations := protected.Group("/consultations")
		{
			consultations.POST("", middleware.RequireRoles(domain.RoleDoctor), h.CreateConsultation)
		}

		// Medicine Categories Routes
		categories := protected.Group("/medicine-categories")
		{
			categories.GET("", h.ListMedicineCategories)
			categories.POST("", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RolePharmacist), h.CreateMedicineCategory)
			categories.PUT("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RolePharmacist), h.UpdateMedicineCategory)
			categories.DELETE("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RolePharmacist), h.DeleteMedicineCategory)
		}

		// Pharmacy Routes
		medicines := protected.Group("/medicines")
		{
			medicines.GET("", h.ListMedicines)
			medicines.GET("/:id", h.GetMedicine)
			medicines.POST("", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RolePharmacist), h.CreateMedicine)
			medicines.PUT("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RolePharmacist), h.UpdateMedicine)
			medicines.DELETE("/:id", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RolePharmacist), h.DeleteMedicine)
		}

		prescriptions := protected.Group("/prescriptions")
		{
			prescriptions.GET("", h.ListPrescriptions)
			prescriptions.POST("/:id/dispense", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RolePharmacist), h.DispensePrescription)
		}

		// Billing & Invoice Routes
		invoices := protected.Group("/invoices")
		{
			invoices.GET("", h.ListInvoices)
			invoices.POST("/:id/pay", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.PayInvoice)
		}

		// Medical Records
		medicalRecords := protected.Group("/medical-records")
		{
			medicalRecords.GET("", h.ListMedicalRecords)
		}

		// Reports & Audit Logs
		reports := protected.Group("/reports")
		{
			reports.GET("", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.GetReports)
		}

		auditLogs := protected.Group("/audit-logs")
		{
			auditLogs.GET("", middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin), h.ListAuditLogs)
		}
	}
}

// Auth Handlers
func (h *Handler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	res, err := h.svc.Login(req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Login successful", res)
}

func (h *Handler) RegisterPatient(c *gin.Context) {
	var req service.RegisterPatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	res, err := h.svc.RegisterPatient(req)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Patient account registered successfully", res)
}

func (h *Handler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	email, _ := c.Get("email")
	role, _ := c.Get("role")

	response.Success(c, http.StatusOK, "Profile fetched", gin.H{
		"user_id":  userID,
		"username": username,
		"email":    email,
		"role":     role,
	})
}

func (h *Handler) ForgotPassword(c *gin.Context) {
	response.Success(c, http.StatusOK, "Password reset instructions sent if email exists", nil)
}

func (h *Handler) ChangePassword(c *gin.Context) {
	response.Success(c, http.StatusOK, "Password changed successfully", nil)
}

// Doctor Handlers
func (h *Handler) ListDoctors(c *gin.Context) {
	search := c.Query("search")
	doctors, err := h.svc.ListDoctors(search)
	if err != nil {
		response.InternalServerError(c, "Failed to list doctors", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Doctors retrieved", doctors)
}

func (h *Handler) GetDoctor(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	doc, err := h.svc.GetDoctor(uint(id))
	if err != nil {
		response.NotFound(c, "Doctor not found")
		return
	}
	response.Success(c, http.StatusOK, "Doctor retrieved", doc)
}

func (h *Handler) CreateDoctor(c *gin.Context) {
	var doc domain.Doctor
	if err := c.ShouldBindJSON(&doc); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.CreateDoctor(&doc); err != nil {
		response.InternalServerError(c, "Failed to create doctor", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Doctor created successfully", doc)
}

func (h *Handler) UpdateDoctor(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var doc domain.Doctor
	if err := c.ShouldBindJSON(&doc); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	doc.ID = uint(id)
	if err := h.svc.UpdateDoctor(&doc); err != nil {
		response.InternalServerError(c, "Failed to update doctor", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Doctor updated successfully", doc)
}

func (h *Handler) DeleteDoctor(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.svc.DeleteDoctor(uint(id)); err != nil {
		response.InternalServerError(c, "Failed to delete doctor", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Doctor deleted successfully", nil)
}

func (h *Handler) UpdateDoctorSchedule(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var schedules []domain.DoctorSchedule
	if err := c.ShouldBindJSON(&schedules); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	for i := range schedules {
		schedules[i].DoctorID = uint(id)
	}
	if err := h.svc.UpdateDoctorSchedule(schedules); err != nil {
		response.InternalServerError(c, "Failed to update schedules", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Doctor schedules updated", schedules)
}

// Patient Handlers
func (h *Handler) ListPatients(c *gin.Context) {
	search := c.Query("search")
	patients, err := h.svc.ListPatients(search)
	if err != nil {
		response.InternalServerError(c, "Failed to list patients", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Patients retrieved", patients)
}

func (h *Handler) GetPatient(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	p, err := h.svc.GetPatient(uint(id))
	if err != nil {
		response.NotFound(c, "Patient not found")
		return
	}
	response.Success(c, http.StatusOK, "Patient retrieved", p)
}

func (h *Handler) CreatePatient(c *gin.Context) {
	var p domain.Patient
	if err := c.ShouldBindJSON(&p); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.CreatePatient(&p); err != nil {
		response.InternalServerError(c, "Failed to create patient", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Patient registered successfully", p)
}

func (h *Handler) UpdatePatient(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var p domain.Patient
	if err := c.ShouldBindJSON(&p); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	p.ID = uint(id)
	if err := h.svc.UpdatePatient(&p); err != nil {
		response.InternalServerError(c, "Failed to update patient", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Patient updated successfully", p)
}

// Appointment & Queue Handlers
func (h *Handler) BookAppointment(c *gin.Context) {
	var req service.BookAppointmentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	app, err := h.svc.BookAppointment(req)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Appointment booked successfully", app)
}

func (h *Handler) ListAppointments(c *gin.Context) {
	date := c.Query("date")
	status := c.Query("status")
	doctorID, _ := strconv.Atoi(c.Query("doctor_id"))
	apps, err := h.svc.ListAppointments(date, status, uint(doctorID))
	if err != nil {
		response.InternalServerError(c, "Failed to fetch appointments", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Appointments retrieved", apps)
}

func (h *Handler) ListQueues(c *gin.Context) {
	date := c.Query("date")
	doctorID, _ := strconv.Atoi(c.Query("doctor_id"))
	queues, err := h.svc.ListQueues(uint(doctorID), date)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch queues", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Queues retrieved", queues)
}

func (h *Handler) UpdateQueueStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.UpdateQueueStatus(uint(id), body.Status); err != nil {
		response.InternalServerError(c, "Failed to update queue status", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Queue status updated", nil)
}

// Consultation Handler
func (h *Handler) CreateConsultation(c *gin.Context) {
	var req service.CreateConsultationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	res, err := h.svc.CreateConsultation(req)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Consultation record saved", res)
}

// Medicine Category Handlers
func (h *Handler) ListMedicineCategories(c *gin.Context) {
	list, err := h.svc.ListMedicineCategories()
	if err != nil {
		response.InternalServerError(c, "Failed to fetch medicine categories", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medicine categories retrieved", list)
}

func (h *Handler) CreateMedicineCategory(c *gin.Context) {
	var cat domain.MedicineCategory
	if err := c.ShouldBindJSON(&cat); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.CreateMedicineCategory(&cat); err != nil {
		response.InternalServerError(c, "Failed to create medicine category", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Medicine category created successfully", cat)
}

func (h *Handler) UpdateMedicineCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ValidationError(c, "Invalid category ID")
		return
	}
	var cat domain.MedicineCategory
	if err := c.ShouldBindJSON(&cat); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	cat.ID = uint(id)
	if err := h.svc.UpdateMedicineCategory(&cat); err != nil {
		response.InternalServerError(c, "Failed to update medicine category", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medicine category updated successfully", cat)
}

func (h *Handler) DeleteMedicineCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ValidationError(c, "Invalid category ID")
		return
	}
	if err := h.svc.DeleteMedicineCategory(uint(id)); err != nil {
		response.InternalServerError(c, "Failed to delete medicine category", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medicine category deleted successfully", nil)
}

// Medicine Handlers
func (h *Handler) ListMedicines(c *gin.Context) {
	search := c.Query("search")
	category := c.Query("category")
	list, err := h.svc.ListMedicines(search, category)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch medicines", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medicines retrieved", list)
}

func (h *Handler) GetMedicine(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ValidationError(c, "Invalid medicine ID")
		return
	}
	m, err := h.svc.GetMedicine(uint(id))
	if err != nil {
		response.NotFound(c, "Medicine not found")
		return
	}
	response.Success(c, http.StatusOK, "Medicine retrieved", m)
}

func (h *Handler) CreateMedicine(c *gin.Context) {
	var m domain.Medicine
	if err := c.ShouldBindJSON(&m); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.CreateMedicine(&m); err != nil {
		response.InternalServerError(c, "Failed to create medicine", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Medicine created", m)
}

func (h *Handler) UpdateMedicine(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ValidationError(c, "Invalid medicine ID")
		return
	}
	var m domain.Medicine
	if err := c.ShouldBindJSON(&m); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	m.ID = uint(id)
	if err := h.svc.UpdateMedicine(&m); err != nil {
		response.InternalServerError(c, "Failed to update medicine", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medicine updated", m)
}

func (h *Handler) DeleteMedicine(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ValidationError(c, "Invalid medicine ID")
		return
	}
	if err := h.svc.DeleteMedicine(uint(id)); err != nil {
		response.InternalServerError(c, "Failed to delete medicine", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medicine deleted successfully", nil)
}

func (h *Handler) ListPrescriptions(c *gin.Context) {
	status := c.Query("status")
	list, err := h.svc.ListPrescriptions(status)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch prescriptions", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Prescriptions retrieved", list)
}

func (h *Handler) DispensePrescription(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct {
		Notes string `json:"notes"`
	}
	_ = c.ShouldBindJSON(&body)
	if err := h.svc.DispensePrescription(uint(id), body.Notes); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Prescription dispensed and stock updated", nil)
}

// Billing Handlers
func (h *Handler) ListInvoices(c *gin.Context) {
	status := c.Query("status")
	list, err := h.svc.ListInvoices(status)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch invoices", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Invoices retrieved", list)
}

func (h *Handler) PayInvoice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct {
		PaymentMethod string `json:"payment_method" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.PayInvoice(uint(id), body.PaymentMethod); err != nil {
		response.InternalServerError(c, "Failed to record payment", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Payment recorded successfully", nil)
}

// Medical Record Handlers
func (h *Handler) ListMedicalRecords(c *gin.Context) {
	userRole := c.GetString("user_role")
	userID := c.GetUint("user_id")

	patientID, _ := strconv.Atoi(c.Query("patient_id"))
	search := c.Query("search")

	// Strictly scope data for Patient role
	if userRole == domain.RolePatient {
		pat, err := h.svc.GetPatientByUserID(userID)
		if err == nil && pat != nil {
			patientID = int(pat.ID)
		} else {
			response.Success(c, http.StatusOK, "Medical records retrieved", []domain.MedicalRecord{})
			return
		}
	}

	list, err := h.svc.ListMedicalRecords(uint(patientID), search)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch medical records", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Medical records retrieved", list)
}

// Reports & Audit Handlers
func (h *Handler) GetReports(c *gin.Context) {
	rep, err := h.svc.GetReports()
	if err != nil {
		response.InternalServerError(c, "Failed to generate report", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Reports generated", rep)
}

func (h *Handler) ListAuditLogs(c *gin.Context) {
	limit, _ := strconv.Atoi(c.Query("limit"))
	logs, err := h.svc.ListAuditLogs(limit)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch audit logs", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Audit logs retrieved", logs)
}

func (h *Handler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.ValidationError(c, "No image file provided in form data")
		return
	}

	_ = os.MkdirAll("./uploads", 0755)

	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".png"
	}
	filename := fmt.Sprintf("img_%d%s", time.Now().UnixNano(), ext)
	dst := filepath.Join("./uploads", filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		response.InternalServerError(c, "Failed to save uploaded image file", err.Error())
		return
	}

	fileURL := fmt.Sprintf("/uploads/%s", filename)
	response.Success(c, http.StatusOK, "Image file uploaded successfully", gin.H{
		"url":      fileURL,
		"filename": filename,
	})
}

// Clinic CMS Settings Handlers
func (h *Handler) GetCMSSetting(c *gin.Context) {
	setting, err := h.svc.GetCMSSetting()
	if err != nil {
		response.InternalServerError(c, "Failed to fetch CMS settings", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "CMS settings retrieved", setting)
}

func (h *Handler) UpdateCMSSetting(c *gin.Context) {
	var setting domain.ClinicCMSSetting
	if err := c.ShouldBindJSON(&setting); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	if err := h.svc.UpdateCMSSetting(&setting); err != nil {
		response.InternalServerError(c, "Failed to update CMS settings", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "CMS settings updated successfully", setting)
}

// User Management Handlers (Super Admin Only)
func (h *Handler) ListUsers(c *gin.Context) {
	search := c.Query("search")
	role := c.Query("role")
	users, err := h.svc.ListUsers(search, role)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch users", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Users retrieved", users)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req struct {
		domain.User
		RawPassword string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.CreateUserAccount(&req.User, req.RawPassword); err != nil {
		response.InternalServerError(c, "Failed to create user", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "User account created successfully", req.User)
}

func (h *Handler) UpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var u domain.User
	if err := c.ShouldBindJSON(&u); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	u.ID = uint(id)
	if err := h.svc.UpdateUserAccount(&u); err != nil {
		response.InternalServerError(c, "Failed to update user", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "User account updated successfully", u)
}

func (h *Handler) DeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.svc.DeleteUserAccount(uint(id)); err != nil {
		response.InternalServerError(c, "Failed to delete user", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "User account deleted successfully", nil)
}

func (h *Handler) ResetUserPassword(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	if err := h.svc.ResetUserPassword(uint(id), req.Password); err != nil {
		response.InternalServerError(c, "Failed to reset password", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "User password reset successfully", nil)
}
