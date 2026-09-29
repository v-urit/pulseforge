// Package tenant defines organizational boundaries and subscription entities for PulseForge multi-tenancy.
package tenant

import (
	"context"
	"time"
)

// Tenant represents an isolated customer organization.
type Tenant struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	APIKey    string    `json:"api_key"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Repository defines data access methods for tenant organizations.
type Repository interface {
	// Create registers a new tenant.
	Create(ctx context.Context, t *Tenant) error
	// GetByID retrieves tenant metadata by primary key.
	GetByID(ctx context.Context, id string) (*Tenant, error)
	// GetByAPIKey retrieves tenant by metric ingestion API key.
	GetByAPIKey(ctx context.Context, apiKey string) (*Tenant, error)
	// GetBySlug retrieves tenant by organizational slug.
	GetBySlug(ctx context.Context, slug string) (*Tenant, error)
}
