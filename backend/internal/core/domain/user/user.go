// Package user defines domain entities, roles, and repository contracts for authentication and RBAC.
package user

import (
	"context"
	"time"
)

// Role defines system access levels.
type Role string

const (
	// RoleSuperAdmin has global administrative privileges across all tenants.
	RoleSuperAdmin Role = "super_admin"
	// RoleAdmin has full administrative privileges within a single tenant.
	RoleAdmin Role = "admin"
	// RoleSupportAgent can manage live support tickets and customer interactions.
	RoleSupportAgent Role = "support_agent"
	// RoleMember has standard operational and monitoring visibility.
	RoleMember Role = "member"
)

// AuthProvider identifies the identity provider used for authentication.
type AuthProvider string

const (
	// ProviderEmail represents standard email and password authentication.
	ProviderEmail AuthProvider = "email"
	// ProviderGoogle represents Google OAuth2 federated login.
	ProviderGoogle AuthProvider = "google"
	// ProviderGitHub represents GitHub OAuth2 federated login.
	ProviderGitHub AuthProvider = "github"
)

// User represents an authenticated principal in PulseForge.
type User struct {
	ID           string       `json:"id"`
	TenantID     string       `json:"tenant_id"`
	Email        string       `json:"email"`
	PasswordHash string       `json:"-"`
	FullName     string       `json:"full_name"`
	Role         Role         `json:"role"`
	Provider     AuthProvider `json:"provider"`
	ProviderID   string       `json:"provider_id,omitempty"`
	IsActive     bool         `json:"is_active"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
}

// TokenFamily tracks refresh token lineage for rotation and reuse-detection attack prevention.
type TokenFamily struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TenantID  string    `json:"tenant_id"`
	TokenHash string    `json:"-"`
	IsRevoked bool      `json:"is_revoked"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// AuditLog records security-critical events for compliance and intrusion detection.
type AuditLog struct {
	ID        string    `json:"id"`
	TenantID  string    `json:"tenant_id"`
	UserID    string    `json:"user_id"`
	Action    string    `json:"action"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	Metadata  any       `json:"metadata,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// Repository defines storage operations for users with mandatory tenant boundary enforcement.
type Repository interface {
	// Create stores a new user record.
	Create(ctx context.Context, u *User) error
	// GetByID retrieves a user by ID within a tenant boundary.
	GetByID(ctx context.Context, tenantID, id string) (*User, error)
	// GetByEmail retrieves a user by email address across or within tenants.
	GetByEmail(ctx context.Context, email string) (*User, error)
	// Update modifies user properties.
	Update(ctx context.Context, tenantID string, u *User) error
	// StoreAuditLog inserts an immutable audit log record.
	StoreAuditLog(ctx context.Context, log *AuditLog) error
}
