package v1

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/pulseforge/pulseforge/internal/platform/config"
	"github.com/pulseforge/pulseforge/internal/platform/database"
)

// NewRouter builds and configures the top-level HTTP handler with all middlewares and routes.
func NewRouter(cfg *config.Config, logger *slog.Logger, pg *database.PostgresClient, redis *database.RedisClient) http.Handler {
	r := chi.NewRouter()

	// Standard middleware stack
	r.Use(middleware.RequestID)
	r.Use(StructuredLogger(logger))
	r.Use(middleware.Recoverer)
	r.Use(SecurityHeaders)

	// Strict CORS Allowlist
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.Auth.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Tenant-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health and Readiness probes (root path for k8s/docker orchestration)
	healthHandler := NewHealthHandler(pg, redis)
	r.Get("/healthz", healthHandler.Healthz)
	r.Get("/health", healthHandler.Healthz)
	r.Get("/api/health", healthHandler.Healthz)
	r.Get("/readyz", healthHandler.Readyz)

	// API v1 Sub-router
	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/healthz", healthHandler.Healthz)
		api.Get("/health", healthHandler.Healthz)
		api.Get("/readyz", healthHandler.Readyz)

		// Placeholder for upcoming v1 routes in subsequent milestones:
		// api.Mount("/auth", authHandler.Routes())
		// api.Mount("/metrics", metricsHandler.Routes())
		// api.Mount("/incidents", incidentsHandler.Routes())
		// api.Mount("/support", supportHandler.Routes())
		// api.Mount("/admin", adminHandler.Routes())
	})

	return r
}
