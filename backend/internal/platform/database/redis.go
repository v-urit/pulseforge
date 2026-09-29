// Package database provides Redis client connections, health checks, and pub/sub utilities.
package database

import (
	"context"
	"fmt"
	"time"

	"github.com/pulseforge/pulseforge/internal/platform/config"
	"github.com/redis/go-redis/v9"
)

// RedisClient wraps the go-redis client for caching, rate limiting, and pub/sub backplane operations.
type RedisClient struct {
	Client *redis.Client
}

// NewRedisClient initializes and verifies connection to a Redis 7+ server.
func NewRedisClient(ctx context.Context, cfg config.RedisConfig) (*RedisClient, error) {
	opts, err := redis.ParseURL(cfg.URL)
	if err != nil {
		// If URL parsing fails, fallback to direct addr
		opts = &redis.Options{
			Addr:     cfg.URL,
			Password: cfg.Password,
			DB:       cfg.DB,
		}
	} else {
		if cfg.Password != "" {
			opts.Password = cfg.Password
		}
		if cfg.DB != 0 {
			opts.DB = cfg.DB
		}
	}

	client := redis.NewClient(opts)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("pinging redis during startup: %w", err)
	}

	return &RedisClient{Client: client}, nil
}

// Ping verifies active connectivity to Redis.
func (r *RedisClient) Ping(ctx context.Context) error {
	if r == nil || r.Client == nil {
		return fmt.Errorf("redis client is uninitialized")
	}
	if err := r.Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis ping failed: %w", err)
	}
	return nil
}

// Close terminates open network connections to the Redis server.
func (r *RedisClient) Close() error {
	if r != nil && r.Client != nil {
		if err := r.Client.Close(); err != nil {
			return fmt.Errorf("closing redis client: %w", err)
		}
	}
	return nil
}
