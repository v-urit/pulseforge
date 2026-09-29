// Package config provides strongly typed, environment-validated configuration settings.
// It ensures that the application refuses to boot if critical security or connection parameters are missing.
package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/pulseforge/pulseforge/internal/platform/logger"
)

// AppEnv specifies the runtime environment.
type AppEnv string

const (
	// EnvDevelopment indicates a local developer workstation environment.
	EnvDevelopment AppEnv = "development"
	// EnvTest indicates an automated test runner environment.
	EnvTest AppEnv = "test"
	// EnvProduction indicates a secured live production environment.
	EnvProduction AppEnv = "production"
)

// Config aggregates all operational parameters required by PulseForge services.
type Config struct {
	// Environment specifies whether the app runs in development, test, or production.
	Environment AppEnv
	// HTTP holds parameters for the REST and WebSocket HTTP server.
	HTTP HTTPConfig
	// Database holds PostgreSQL / TimescaleDB connection pool parameters.
	Database DatabaseConfig
	// Redis holds cache, pub/sub, and session store parameters.
	Redis RedisConfig
	// Auth holds cryptographic keys, token TTLs, and OAuth credentials.
	Auth AuthConfig
	// Log holds logger verbosity and formatting settings.
	Log logger.Config
	// Mailer holds SMTP and alert notification credentials.
	Mailer MailerConfig
}

// HTTPConfig defines web server network bindings and timeout limits.
type HTTPConfig struct {
	Port            string
	Host            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	GracefulTimeout time.Duration
}

// DatabaseConfig encapsulates PostgreSQL connection details and pool bounds.
type DatabaseConfig struct {
	URL             string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

// RedisConfig defines endpoint and authentication for cache and realtime backplane.
type RedisConfig struct {
	URL      string
	Password string
	DB       int
}

// AuthConfig defines token lifecycles, cryptographic secrets, and OAuth parameters.
type AuthConfig struct {
	AccessSecret       string
	AccessTTL          time.Duration
	RefreshTTL         time.Duration
	WSTicketTTL        time.Duration
	CORSAllowedOrigins []string
	CookieDomain       string
	CookieSecure       bool
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	GitHubClientID     string
	GitHubClientSecret string
	GitHubRedirectURL  string
}

// MailerConfig defines email transport properties for alerts and support fallbacks.
type MailerConfig struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	SupportEmail string
}

// Load reads configuration from environment variables, applying sane defaults and validating required fields.
func Load() (*Config, error) {
	env := AppEnv(getEnvOrDefault("APP_ENV", string(EnvDevelopment)))

	cfg := &Config{
		Environment: env,
		HTTP: HTTPConfig{
			Port:            getEnvOrDefault("PORT", "8080"),
			Host:            getEnvOrDefault("HOST", "0.0.0.0"),
			ReadTimeout:     getEnvAsDurationOrDefault("HTTP_READ_TIMEOUT", 15*time.Second),
			WriteTimeout:    getEnvAsDurationOrDefault("HTTP_WRITE_TIMEOUT", 15*time.Second),
			GracefulTimeout: getEnvAsDurationOrDefault("HTTP_GRACEFUL_TIMEOUT", 10*time.Second),
		},
		Database: DatabaseConfig{
			URL:             getEnvOrDefault("DATABASE_URL", "postgres://pulseforge:pulseforge_secret@localhost:5432/pulseforge?sslmode=disable"),
			MaxConns:        int32(getEnvAsIntOrDefault("DB_MAX_CONNS", 25)),
			MinConns:        int32(getEnvAsIntOrDefault("DB_MIN_CONNS", 5)),
			MaxConnLifetime: getEnvAsDurationOrDefault("DB_MAX_CONN_LIFETIME", 1*time.Hour),
			MaxConnIdleTime: getEnvAsDurationOrDefault("DB_MAX_CONN_IDLE_TIME", 15*time.Minute),
		},
		Redis: RedisConfig{
			URL:      getEnvOrDefault("REDIS_URL", "redis://localhost:6379"),
			Password: getEnvOrDefault("REDIS_PASSWORD", ""),
			DB:       getEnvAsIntOrDefault("REDIS_DB", 0),
		},
		Auth: AuthConfig{
			AccessSecret:       getEnvOrDefault("AUTH_JWT_ACCESS_SECRET", "dev_super_secret_jwt_access_key_min_32_bytes!"),
			AccessTTL:          getEnvAsDurationOrDefault("AUTH_JWT_ACCESS_TTL", 15*time.Minute),
			RefreshTTL:         getEnvAsDurationOrDefault("AUTH_JWT_REFRESH_TTL", 7*24*time.Hour),
			WSTicketTTL:        getEnvAsDurationOrDefault("AUTH_WS_TICKET_TTL", 30*time.Second),
			CORSAllowedOrigins: parseCSV(getEnvOrDefault("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002")),
			CookieDomain:       getEnvOrDefault("COOKIE_DOMAIN", "localhost"),
			CookieSecure:       getEnvAsBoolOrDefault("COOKIE_SECURE", false),
			GoogleClientID:     getEnvOrDefault("GOOGLE_CLIENT_ID", ""),
			GoogleClientSecret: getEnvOrDefault("GOOGLE_CLIENT_SECRET", ""),
			GoogleRedirectURL:  getEnvOrDefault("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/google/callback"),
			GitHubClientID:     getEnvOrDefault("GITHUB_CLIENT_ID", ""),
			GitHubClientSecret: getEnvOrDefault("GITHUB_CLIENT_SECRET", ""),
			GitHubRedirectURL:  getEnvOrDefault("GITHUB_REDIRECT_URL", "http://localhost:8080/api/v1/auth/github/callback"),
		},
		Log: logger.Config{
			Level:  logger.Level(getEnvOrDefault("LOG_LEVEL", string(logger.LevelInfo))),
			Format: getEnvOrDefault("LOG_FORMAT", "json"),
		},
		Mailer: MailerConfig{
			SMTPHost:     getEnvOrDefault("SMTP_HOST", "localhost"),
			SMTPPort:     getEnvAsIntOrDefault("SMTP_PORT", 1025),
			SMTPUsername: getEnvOrDefault("SMTP_USERNAME", ""),
			SMTPPassword: getEnvOrDefault("SMTP_PASSWORD", ""),
			FromEmail:    getEnvOrDefault("SMTP_FROM_EMAIL", "notifications@pulseforge.local"),
			SupportEmail: getEnvOrDefault("SUPPORT_EMAIL", "support@pulseforge.local"),
		},
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("validating configuration: %w", err)
	}

	return cfg, nil
}

// Validate verifies required parameters and sanity constraints.
func (c *Config) Validate() error {
	if c.HTTP.Port == "" {
		return errors.New("HTTP port must not be empty")
	}
	if c.Database.URL == "" {
		return errors.New("DATABASE_URL must be specified")
	}
	if c.Redis.URL == "" {
		return errors.New("REDIS_URL must be specified")
	}
	if c.Environment == EnvProduction {
		if len(c.Auth.AccessSecret) < 32 {
			return errors.New("production AUTH_JWT_ACCESS_SECRET must be at least 32 characters long")
		}
		if !c.Auth.CookieSecure {
			return errors.New("production COOKIE_SECURE must be true")
		}
	}
	return nil
}

func getEnvOrDefault(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvAsIntOrDefault(key string, fallback int) int {
	valStr := os.Getenv(key)
	if valStr == "" {
		return fallback
	}
	val, err := strconv.Atoi(valStr)
	if err != nil {
		return fallback
	}
	return val
}

func getEnvAsDurationOrDefault(key string, fallback time.Duration) time.Duration {
	valStr := os.Getenv(key)
	if valStr == "" {
		return fallback
	}
	val, err := time.ParseDuration(valStr)
	if err != nil {
		return fallback
	}
	return val
}

func getEnvAsBoolOrDefault(key string, fallback bool) bool {
	valStr := os.Getenv(key)
	if valStr == "" {
		return fallback
	}
	val, err := strconv.ParseBool(valStr)
	if err != nil {
		return fallback
	}
	return val
}

func parseCSV(val string) []string {
	if val == "" {
		return nil
	}
	items := strings.Split(val, ",")
	res := make([]string, 0, len(items))
	for _, item := range items {
		trimmed := strings.TrimSpace(item)
		if trimmed != "" {
			res = append(res, trimmed)
		}
	}
	return res
}
