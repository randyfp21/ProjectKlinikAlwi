package database

import (
	"fmt"
	"log"

	"backend/internal/config"
	"backend/internal/domain"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase(cfg *config.Config) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	if cfg.DBDriver == "postgres" {
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
			cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode)
		db, err = gorm.Open(postgres.Open(dsn), gormConfig)
	} else {
		// Default SQLite for easy execution and testing
		db, err = gorm.Open(sqlite.Open(cfg.SQLitePath), gormConfig)
	}

	if err != nil {
		log.Printf("[Database Error] Failed to connect: %v", err)
		return nil, err
	}

	log.Println("[Database] Successfully connected to database")

	// Auto Migrate Schema
	err = Migrate(db)
	if err != nil {
		log.Printf("[Database Migration Error] %v", err)
		return nil, err
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("[Database] Executing AutoMigrate...")
	return db.AutoMigrate(
		&domain.User{},
		&domain.Doctor{},
		&domain.DoctorSchedule{},
		&domain.Patient{},
		&domain.Appointment{},
		&domain.Queue{},
		&domain.Consultation{},
		&domain.MedicineCategory{},
		&domain.Medicine{},
		&domain.Prescription{},
		&domain.PrescriptionItem{},
		&domain.Invoice{},
		&domain.InvoiceItem{},
		&domain.MedicalRecord{},
		&domain.AuditLog{},
		&domain.ClinicCMSSetting{},
	)
}
