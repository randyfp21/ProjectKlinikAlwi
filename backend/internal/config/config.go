package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort     string
	AppEnv      string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	DBDriver    string
	SQLitePath  string
	JWTSecret   string
	JWTExpireHr int
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	appPort := getEnv("APP_PORT", "8086")
	appEnv := getEnv("APP_ENV", "development")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "klinik_alwi")
	dbSSLMode := getEnv("DB_SSLMODE", "disable")
	dbDriver := getEnv("DB_DRIVER", "sqlite") // Default sqlite for immediate test/standalone execution!
	sqlitePath := getEnv("SQLITE_PATH", "klinik_alwi.db")
	jwtSecret := getEnv("JWT_SECRET", "super-secret-klinik-alwi-key-2026")

	log.Printf("[Config] Loaded environment mode: %s, driver: %s", appEnv, dbDriver)

	return &Config{
		AppPort:     appPort,
		AppEnv:      appEnv,
		DBHost:      dbHost,
		DBPort:      dbPort,
		DBUser:      dbUser,
		DBPassword:  dbPassword,
		DBName:      dbName,
		DBSSLMode:   dbSSLMode,
		DBDriver:    dbDriver,
		SQLitePath:  sqlitePath,
		JWTSecret:   jwtSecret,
		JWTExpireHr: 24,
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
