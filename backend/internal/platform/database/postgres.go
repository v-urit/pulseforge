// Package database provides connection lifecycle management and health checking for PostgreSQL/TimescaleDB and Redis.
package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pulseforge/pulseforge/internal/platform/config"
)

// PostgresClient wraps a pgx connection pool for database transactions and health checks.
type PostgresClient struct {
	Pool *pgxpool.Pool
}

// NewPostgresPool initializes a PostgreSQL connection pool configured according to runtime settings.
func NewPostgresPool(ctx context.Context, cfg config.DatabaseConfig) (*PostgresClient, error) {
	pgxCfg, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("parsing database connection URL: %w", err)
	}

	pgxCfg.MaxConns = cfg.MaxConns
	pgxCfg.MinConns = cfg.MinConns
	pgxCfg.MaxConnLifetime = cfg.MaxConnLifetime
	pgxCfg.MaxConnIdleTime = cfg.MaxConnIdleTime

	pool, err := pgxpool.NewWithConfig(ctx, pgxCfg)
	if err != nil {
		return nil, fmt.Errorf("creating pgx connection pool: %w", err)
	}

	// Verify connectivity with a short timeout.
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("pinging database during startup: %w", err)
	}

	return &PostgresClient{Pool: pool}, nil
}

// Ping checks if the PostgreSQL pool is currently healthy and responsive.
func (p *PostgresClient) Ping(ctx context.Context) error {
	if p == nil || p.Pool == nil {
		return fmt.Errorf("postgres client is uninitialized")
	}
	if err := p.Pool.Ping(ctx); err != nil {
		return fmt.Errorf("postgres ping failed: %w", err)
	}
	return nil
}

// Close gracefully terminates all pooled database connections.
func (p *PostgresClient) Close() {
	if p != nil && p.Pool != nil {
		p.Pool.Close()
	}
}
