package main

import (
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/handler"
	"backend/internal/repository"
	"backend/internal/seed"
	"backend/internal/service"
	"backend/pkg/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize Database
	db, err := database.InitDatabase(cfg)
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}

	// Seed Initial Data
	if err := seed.SeedAll(db); err != nil {
		log.Printf("Warning: Seeding error: %v", err)
	}

	// Initialize Layers
	repo := repository.NewRepository(db)
	svc := service.NewService(repo, cfg)
	h := handler.NewHandler(svc, cfg.JWTSecret)

	// Set Gin mode
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()
	router.MaxMultipartMemory = 50 << 20 // 50 Megabytes Max Upload Size

	// Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	router.Use(cors.New(corsConfig))

	// Serve Static Uploads Directory
	router.Static("/uploads", "./uploads")

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"app":     "Klinik Alwi Hospital Management System API",
			"version": "1.0.0",
		})
	})

	// Register REST API Routes
	h.RegisterRoutes(router)

	log.Printf("[Server] Starting Klinik Alwi HMS Backend API on port :%s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Fatal: Server crash: %v", err)
	}
}
