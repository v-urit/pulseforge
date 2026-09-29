// Package realtime defines core domain abstractions for real-time messaging and WebSocket hubs.
// This decouples business logic from specific WebSocket transport libraries (e.g. Gorilla vs Coder).
package realtime

import (
	"context"
	"time"
)

// ChannelType designates the stream topic (e.g. live support, incident war room, metrics).
type ChannelType string

const (
	// ChannelSupport represents tenant live customer support conversations.
	ChannelSupport ChannelType = "support"
	// ChannelIncident represents active incident war room events.
	ChannelIncident ChannelType = "incident"
	// ChannelMetrics represents real-time ingestion and telemetry streams.
	ChannelMetrics ChannelType = "metrics"
)

// Message encapsulates payload dispatched to connected WebSocket clients.
type Message struct {
	Type      string      `json:"type"`
	Channel   ChannelType `json:"channel"`
	RoomID    string      `json:"room_id"`
	TenantID  string      `json:"tenant_id"`
	SenderID  string      `json:"sender_id"`
	Payload   any         `json:"payload"`
	CreatedAt time.Time   `json:"created_at"`
}

// Hub defines the provider-agnostic interface for room management and real-time broadcasts.
type Hub interface {
	// Broadcast sends a message to all active clients subscribed to a given room within a tenant.
	Broadcast(ctx context.Context, msg Message) error
	// BroadcastToUser sends a targeted message to a specific user's active connections.
	BroadcastToUser(ctx context.Context, tenantID, userID string, msg Message) error
	// Subscribe registers a client connection to a room.
	Subscribe(tenantID, roomID, clientID string) error
	// Unsubscribe removes a client connection from a room.
	Unsubscribe(tenantID, roomID, clientID string) error
	// ActiveConnections returns current count of active WebSocket sessions.
	ActiveConnections() int
}
