// Package usecase encapsulates pure application business logic without direct framework or HTTP dependencies.
package usecase

import (
	"context"

	"github.com/pulseforge/pulseforge/internal/core/domain/user"
)

// AuthUseCase defines pure business logic operations for authentication, token rotation, and identity verification.
type AuthUseCase interface {
	// Register creates a new tenant organization and primary administrator.
	Register(ctx context.Context, tenantName, email, password, fullName string) (*user.User, error)
	// Authenticate validates credentials and returns authenticated user details.
	Authenticate(ctx context.Context, email, password string) (*user.User, error)
	// RefreshSession handles refresh token family rotation and detects replay attacks.
	RefreshSession(ctx context.Context, rawRefreshToken string) (newAccessToken, newRefreshToken string, err error)
	// RevokeAllSessions invalidates all active token families for a user.
	RevokeAllSessions(ctx context.Context, userID string) error
}

// TokenService defines cryptographic token generation and verification contracts.
type TokenService interface {
	// GenerateAccessToken issues a short-lived JWT.
	GenerateAccessToken(u *user.User) (string, error)
	// GenerateRefreshToken issues an opaque UUID refresh token bound to a family.
	GenerateRefreshToken(u *user.User, familyID string) (string, error)
	// ValidateAccessToken parses and verifies JWT claims.
	ValidateAccessToken(tokenStr string) (*user.User, error)
}

// PasswordHasher defines cryptographic hashing contracts.
type PasswordHasher interface {
	// Hash creates a secure Argon2id password hash.
	Hash(password string) (string, error)
	// Verify checks password against stored hash in constant time.
	Verify(password, encodedHash string) (bool, error)
}
