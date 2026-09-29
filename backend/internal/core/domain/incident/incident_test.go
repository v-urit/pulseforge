package incident_test

import (
	"testing"
	"time"

	"github.com/pulseforge/pulseforge/internal/core/domain/incident"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIncident_LifecycleTransitions(t *testing.T) {
	now := time.Now().UTC()
	inc := &incident.Incident{
		ID:          "inc-1",
		TenantID:    "tenant-1",
		Title:       "Database Latency Spike",
		Description: "P99 latency exceeding 500ms",
		Severity:    incident.SeverityCritical,
		State:       incident.StateTriggered,
		TriggeredBy: "alert-engine",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// 1. Valid: triggered -> acknowledged
	err := inc.TransitionTo(incident.StateAcknowledged, "user-alice", now.Add(1*time.Minute))
	require.NoError(t, err)
	assert.Equal(t, incident.StateAcknowledged, inc.State)
	assert.Equal(t, "user-alice", *inc.AcknowledgedBy)

	// 2. Invalid: cannot jump acknowledged -> postmortem directly
	err = inc.TransitionTo(incident.StatePostmortem, "user-alice", now.Add(2*time.Minute))
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "incident must be resolved")

	// 3. Valid: acknowledged -> resolved
	err = inc.TransitionTo(incident.StateResolved, "user-bob", now.Add(3*time.Minute))
	require.NoError(t, err)
	assert.Equal(t, incident.StateResolved, inc.State)
	assert.Equal(t, "user-bob", *inc.ResolvedBy)

	// 4. Valid: resolved -> postmortem
	err = inc.TransitionTo(incident.StatePostmortem, "user-carol", now.Add(4*time.Minute))
	require.NoError(t, err)
	assert.Equal(t, incident.StatePostmortem, inc.State)

	// 5. Invalid: terminal state cannot transition
	err = inc.TransitionTo(incident.StateTriggered, "user-attacker", now.Add(5*time.Minute))
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "terminal state")
}
