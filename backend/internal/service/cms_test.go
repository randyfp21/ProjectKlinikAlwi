package service_test

import (
	"encoding/json"
	"testing"
	"time"

	"backend/internal/config"
	"backend/internal/domain"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/pkg/database"
)

func TestCMSEndToEndSync(t *testing.T) {
	cfg := &config.Config{
		DBDriver:  "sqlite",
		DBHost:    ":memory:",
		JWTSecret: "test-secret",
	}

	db, err := database.InitDatabase(cfg)
	if err != nil {
		t.Fatalf("Failed to init in-memory test database: %v", err)
	}

	repo := repository.NewRepository(db)
	svc := service.NewService(repo, cfg)

	// 1. Fetch initial CMS setting
	initial, err := svc.GetCMSSetting()
	if err != nil {
		t.Fatalf("Failed to fetch initial CMS setting: %v", err)
	}
	if initial.ID != 1 {
		t.Errorf("Expected CMS ID to be 1, got %d", initial.ID)
	}

	// 2. Update CMS Setting (including Hero, Section Titles, Doctors, Gallery)
	testDocs := []domain.Doctor{
		{
			ID:             101,
			Name:           "dr. E2E Test Specialist",
			Specialization: "Spesialis Penyakit Dalam",
		},
	}
	docsJSON, _ := json.Marshal(testDocs)

	updatePayload := &domain.ClinicCMSSetting{
		ID:                    1,
		ClinicName:            "Klinik E2E Test Alwi",
		ClinicTagline:         "Tagline E2E Testing",
		ContactPhone:          "+62811223344",
		ContactEmail:          "e2e@klinikalwi.id",
		ContactInstagram:      "https://instagram.com/klinik.e2etest",
		ClinicAddress:         "Jl. E2E Testing Address No. 1",
		HeroTitle:             "H1 BANNER HERO E2E TEST TITLE",
		HeroSubtitle:          "Subtitle Banner Hero E2E Test Description",
		HeroBadge:             "🏆 E2E TEST BADGE 2026",
		GalleryHeaderTitle:    "Judul Galeri Photo E2E",
		GalleryHeaderSubtitle: "Subtitle Galeri Photo E2E Description",
		DoctorsHeaderTitle:    "Judul Tim Dokter E2E",
		DoctorsHeaderSubtitle: "Subtitle Tim Dokter E2E Description",
		PromosHeaderTitle:     "Judul Promo E2E",
		DoctorsJSON:           string(docsJSON),
		UpdatedAt:             time.Now(),
	}

	err = svc.UpdateCMSSetting(updatePayload)
	if err != nil {
		t.Fatalf("Failed to update CMS setting: %v", err)
	}

	// 3. Re-fetch from DB & Verify Persistence
	fetched, err := svc.GetCMSSetting()
	if err != nil {
		t.Fatalf("Failed to re-fetch CMS setting: %v", err)
	}

	if fetched.ClinicName != "Klinik E2E Test Alwi" {
		t.Errorf("ClinicName mismatch: expected 'Klinik E2E Test Alwi', got '%s'", fetched.ClinicName)
	}
	if fetched.HeroTitle != "H1 BANNER HERO E2E TEST TITLE" {
		t.Errorf("HeroTitle mismatch: expected 'H1 BANNER HERO E2E TEST TITLE', got '%s'", fetched.HeroTitle)
	}
	if fetched.GalleryHeaderTitle != "Judul Galeri Photo E2E" {
		t.Errorf("GalleryHeaderTitle mismatch: expected 'Judul Galeri Photo E2E', got '%s'", fetched.GalleryHeaderTitle)
	}
	if fetched.DoctorsHeaderTitle != "Judul Tim Dokter E2E" {
		t.Errorf("DoctorsHeaderTitle mismatch: expected 'Judul Tim Dokter E2E', got '%s'", fetched.DoctorsHeaderTitle)
	}
}
