// Package logger provides structured, contextual logging using Go's standard slog package.
// It centralizes log configuration to ensure uniform JSON output across all services.
package logger

import (
	"log/slog"
	"os"
	"strings"
)

// Level defines supported log severity levels.
type Level string

const (
	// LevelDebug indicates verbose diagnostic information.
	LevelDebug Level = "debug"
	// LevelInfo indicates general operational messages.
	LevelInfo Level = "info"
	// LevelWarn indicates non-critical issues that require attention.
	LevelWarn Level = "warn"
	// LevelError indicates failures requiring immediate investigation.
	LevelError Level = "error"
)

// Config encapsulates log configuration parameters.
type Config struct {
	// Level represents minimum logged severity (debug, info, warn, error).
	Level Level
	// Format represents the output style ("json" or "text").
	Format string
}

// New initializes and returns a configured slog.Logger instance based on environment settings.
func New(cfg Config) *slog.Logger {
	var handler slog.Handler
	lvl := parseLevel(cfg.Level)
	opts := &slog.HandlerOptions{
		Level:     lvl,
		AddSource: cfg.Level == LevelDebug,
	}

	if strings.ToLower(cfg.Format) == "text" {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	l := slog.New(handler)
	slog.SetDefault(l)
	return l
}

// parseLevel converts string level representations into slog.Level values.
func parseLevel(level Level) slog.Level {
	switch Level(strings.ToLower(string(level))) {
	case LevelDebug:
		return slog.LevelDebug
	case LevelWarn:
		return slog.LevelWarn
	case LevelError:
		return slog.LevelError
	case LevelInfo:
		fallthrough
	default:
		return slog.LevelInfo
	}
}
