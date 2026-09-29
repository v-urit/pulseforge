package v1

import (
	"context"
	"net/http"
	"time"

	"github.com/pulseforge/pulseforge/internal/platform/database"
)

// HealthHandler handles liveness and readiness probe checks.
type HealthHandler struct {
	pgClient    *database.PostgresClient
	redisClient *database.RedisClient
}

// NewHealthHandler returns an initialized HealthHandler.
func NewHealthHandler(pg *database.PostgresClient, redis *database.RedisClient) *HealthHandler {
	return &HealthHandler{
		pgClient:    pg,
		redisClient: redis,
	}
}

// Healthz performs a shallow liveness probe confirming the HTTP server is serving requests.
func (h *HealthHandler) Healthz(w http.ResponseWriter, r *http.Request) {
	RespondJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}

// Readyz performs a deep readiness check verifying PostgreSQL and Redis connections.
func (h *HealthHandler) Readyz(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	checks := make(map[string]string)
	isHealthy := true

	if h.pgClient != nil {
		if err := h.pgClient.Ping(ctx); err != nil {
			checks["postgres"] = err.Error()
			isHealthy = false
		} else {
			checks["postgres"] = "healthy"
		}
	} else {
		checks["postgres"] = "unconfigured"
	}

	if h.redisClient != nil {
		if err := h.redisClient.Ping(ctx); err != nil {
			checks["redis"] = err.Error()
			isHealthy = false
		} else {
			checks["redis"] = "healthy"
		}
	} else {
		checks["redis"] = "unconfigured"
	}

	if !isHealthy {
		RespondError(w, http.StatusServiceUnavailable, "service dependencies not ready", checks)
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"status": "ready",
		"checks": checks,
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}
