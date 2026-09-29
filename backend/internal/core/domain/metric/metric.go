// Package metric defines telemetry point models, alert rule thresholds, and repository interfaces.
package metric

import (
	"context"
	"time"
)

// Point represents an individual time-series measurement.
type Point struct {
	TenantID  string            `json:"tenant_id"`
	Metric    string            `json:"metric"`
	Value     float64           `json:"value"`
	Tags      map[string]string `json:"tags,omitempty"`
	Timestamp time.Time         `json:"timestamp"`
}

// AlertRule represents a threshold or anomaly evaluation rule.
type AlertRule struct {
	ID          string    `json:"id"`
	TenantID    string    `json:"tenant_id"`
	Name        string    `json:"name"`
	MetricName  string    `json:"metric_name"`
	Operator    string    `json:"operator"` // gt, lt, eq, gte, lte
	Threshold   float64   `json:"threshold"`
	WindowSec   int       `json:"window_sec"`
	Severity    string    `json:"severity"`
	IsEnabled   bool      `json:"is_enabled"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Repository defines data access operations for high-throughput time-series metrics.
type Repository interface {
	// IngestBatch inserts a slice of telemetry points into the TimescaleDB hypertable.
	IngestBatch(ctx context.Context, tenantID string, points []Point) error
	// QueryRange aggregates time-series values across a time window.
	QueryRange(ctx context.Context, tenantID, metric string, from, to time.Time, stepSec int) ([]Point, error)
}
