// Package main provides the background worker service for PulseForge.
// It handles asynchronous alert evaluation, email dispatch, and support chat notifications.
package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/pulseforge/pulseforge/internal/platform/config"
	"github.com/pulseforge/pulseforge/internal/platform/database"
	"github.com/pulseforge/pulseforge/internal/platform/logger"
	"github.com/pulseforge/pulseforge/internal/platform/mailer"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "worker failure: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	appLogger := logger.New(cfg.Log)
	appLogger.Info("starting PulseForge Worker service",
		"env", cfg.Environment,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var pgClient *database.PostgresClient
	var redisClient *database.RedisClient

	pg, err := database.NewPostgresPool(ctx, cfg.Database)
	if err != nil {
		appLogger.Warn("database connection failed for worker", "error", err)
	} else {
		pgClient = pg
		defer pgClient.Close()
	}

	rClient, err := database.NewRedisClient(ctx, cfg.Redis)
	if err != nil {
		appLogger.Warn("redis connection failed for worker", "error", err)
	} else {
		redisClient = rClient
		defer func() {
			if err := redisClient.Close(); err != nil {
				appLogger.Error("failed closing redis client", "error", err)
			}
		}()
	}

	_ = mailer.NewSMTPMailer(cfg.Mailer, appLogger)

	// Worker heartbeat loop
	workerCtx, workerCancel := context.WithCancel(context.Background())
	defer workerCancel()

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-workerCtx.Done():
				return
			case <-ticker.C:
				appLogger.Debug("worker heartbeat check", "timestamp", time.Now().UTC().Format(time.RFC3339))
			}
		}
	}()

	appLogger.Info("PulseForge Worker running in background")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	sig := <-quit
	appLogger.Info("shutdown signal received by worker", "signal", sig.String())
	workerCancel()

	time.Sleep(500 * time.Millisecond)
	appLogger.Info("PulseForge Worker exited cleanly")
	return nil
}
