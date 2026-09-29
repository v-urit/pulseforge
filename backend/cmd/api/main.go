// Package main provides the entrypoint for the PulseForge HTTP and WebSocket API service.
package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	v1 "github.com/pulseforge/pulseforge/internal/adapter/delivery/http/v1"
	"github.com/pulseforge/pulseforge/internal/platform/config"
	"github.com/pulseforge/pulseforge/internal/platform/database"
	"github.com/pulseforge/pulseforge/internal/platform/logger"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "startup failure: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	appLogger := logger.New(cfg.Log)
	appLogger.Info("starting PulseForge API service",
		"env", cfg.Environment,
		"port", cfg.HTTP.Port,
	)

	// In development, attempt DB/Redis connection gracefully
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var pgClient *database.PostgresClient
	var redisClient *database.RedisClient

	pg, err := database.NewPostgresPool(ctx, cfg.Database)
	if err != nil {
		appLogger.Warn("database connection failed (will be marked unhealthy in /readyz)", "error", err)
	} else {
		pgClient = pg
		defer pgClient.Close()
		appLogger.Info("connected to PostgreSQL/TimescaleDB")
	}

	rClient, err := database.NewRedisClient(ctx, cfg.Redis)
	if err != nil {
		appLogger.Warn("redis connection failed (will be marked unhealthy in /readyz)", "error", err)
	} else {
		redisClient = rClient
		defer func() {
			if err := redisClient.Close(); err != nil {
				appLogger.Error("failed closing redis client", "error", err)
			}
		}()
		appLogger.Info("connected to Redis")
	}

	router := v1.NewRouter(cfg, appLogger, pgClient, redisClient)

	addr := fmt.Sprintf("%s:%s", cfg.HTTP.Host, cfg.HTTP.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
	}

	// Server run context for graceful shutdown
	serverErrChan := make(chan error, 1)
	go func() {
		appLogger.Info("HTTP server listening", "address", addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrChan <- fmt.Errorf("http server listen: %w", err)
		}
	}()

	// Listen for OS interrupt signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	select {
	case err := <-serverErrChan:
		return err
	case sig := <-quit:
		appLogger.Info("shutdown signal received", "signal", sig.String())
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), cfg.HTTP.GracefulTimeout)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("graceful shutdown failed: %w", err)
	}

	appLogger.Info("PulseForge API exited cleanly")
	return nil
}
