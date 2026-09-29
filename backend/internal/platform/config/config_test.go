package config_test

import (
	"os"
	"testing"
	"time"

	"github.com/pulseforge/pulseforge/internal/platform/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestConfig_LoadDefaults(t *testing.T) {
	os.Clearenv()

	cfg, err := config.Load()
	require.NoError(t, err)
	require.NotNil(t, cfg)

	assert.Equal(t, config.EnvDevelopment, cfg.Environment)
	assert.Equal(t, "8080", cfg.HTTP.Port)
	assert.Equal(t, "0.0.0.0", cfg.HTTP.Host)
	assert.Equal(t, 15*time.Minute, cfg.Auth.AccessTTL)
	assert.Equal(t, 7*24*time.Hour, cfg.Auth.RefreshTTL)
}

func TestConfig_ProductionValidation(t *testing.T) {
	cfg := &config.Config{
		Environment: config.EnvProduction,
		HTTP: config.HTTPConfig{
			Port: "8080",
		},
		Database: config.DatabaseConfig{
			URL: "postgres://pulseforge:secret@localhost:5432/pulseforge",
		},
		Redis: config.RedisConfig{
			URL: "redis://localhost:6379",
		},
		Auth: config.AuthConfig{
			AccessSecret: "short", // Invalid in production: must be >= 32 chars
			CookieSecure: true,
		},
	}

	err := cfg.Validate()
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "must be at least 32 characters long")
}
