// Package incident encapsulates the incident lifecycle domain entity, state machine, and repository interfaces.
package incident

import (
	"context"
	"fmt"
	"time"
)

// State represents the formal incident lifecycle phase.
type State string

const (
	// StateTriggered indicates a newly detected outage or anomaly.
	StateTriggered State = "triggered"
	// StateAcknowledged indicates an on-call engineer has taken ownership.
	StateAcknowledged State = "acknowledged"
	// StateResolved indicates service has been restored.
	StateResolved State = "resolved"
	// StatePostmortem indicates post-incident review and root-cause analysis.
	StatePostmortem State = "postmortem"
)

// Severity indicates the business criticality and blast radius of an incident.
type Severity string

const (
	// SeverityCritical indicates severe customer outage / data loss (Sev1).
	SeverityCritical Severity = "sev1_critical"
	// SeverityHigh indicates major feature failure / degradation (Sev2).
	SeverityHigh Severity = "sev2_high"
	// SeverityMedium indicates minor impact / workaround exists (Sev3).
	SeverityMedium Severity = "sev3_medium"
	// SeverityLow indicates low impact operational warning (Sev4).
	SeverityLow Severity = "sev4_low"
)

// Incident represents an operational incident in the War Room.
type Incident struct {
	ID             string    `json:"id"`
	TenantID       string    `json:"tenant_id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Severity       Severity  `json:"severity"`
	State          State     `json:"state"`
	TriggeredBy    string    `json:"triggered_by"`
	AcknowledgedBy *string   `json:"acknowledged_by,omitempty"`
	ResolvedBy     *string   `json:"resolved_by,omitempty"`
	AcknowledgedAt *time.Time `json:"acknowledged_at,omitempty"`
	ResolvedAt     *time.Time `json:"resolved_at,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// TransitionTo validates and transitions the incident to a target state according to the formal state machine.
// Valid transitions:
//   triggered -> acknowledged
//   acknowledged -> resolved
//   resolved -> postmortem
// Re-triggering or skipping transitions is strictly rejected at the domain layer.
func (i *Incident) TransitionTo(target State, actorID string, now time.Time) error {
	switch i.State {
	case StateTriggered:
		if target != StateAcknowledged {
			return fmt.Errorf("invalid transition from %s to %s; incident must be acknowledged first", i.State, target)
		}
		i.State = StateAcknowledged
		i.AcknowledgedBy = &actorID
		i.AcknowledgedAt = &now
		i.UpdatedAt = now
		return nil

	case StateAcknowledged:
		if target != StateResolved {
			return fmt.Errorf("invalid transition from %s to %s; incident must be resolved", i.State, target)
		}
		i.State = StateResolved
		i.ResolvedBy = &actorID
		i.ResolvedAt = &now
		i.UpdatedAt = now
		return nil

	case StateResolved:
		if target != StatePostmortem {
			return fmt.Errorf("invalid transition from %s to %s; resolved incidents can only move to postmortem", i.State, target)
		}
		i.State = StatePostmortem
		i.UpdatedAt = now
		return nil

	case StatePostmortem:
		return fmt.Errorf("incident is in terminal state %s and cannot transition further", i.State)

	default:
		return fmt.Errorf("unknown current incident state: %s", i.State)
	}
}

// Repository defines data access for incidents with mandatory tenant isolation.
type Repository interface {
	// Create registers a new incident within a tenant.
	Create(ctx context.Context, tenantID string, inc *Incident) error
	// GetByID fetches an incident by ID within a tenant boundary.
	GetByID(ctx context.Context, tenantID, id string) (*Incident, error)
	// List returns incidents matching filter criteria within a tenant.
	List(ctx context.Context, tenantID string, limit, offset int) ([]*Incident, error)
	// Update persists state and field updates with tenant boundary verification.
	Update(ctx context.Context, tenantID string, inc *Incident) error
}
