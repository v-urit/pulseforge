// Package ws provides WebSocket client connection handling, room multiplexing, and pub/sub routing.
package ws

import (
	"context"
	"fmt"
	"log/slog"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/pulseforge/pulseforge/internal/core/domain/realtime"
)

// Client wraps an active WebSocket connection and client metadata.
type Client struct {
	ID       string
	TenantID string
	UserID   string
	Conn     *websocket.Conn
	Send     chan realtime.Message
	Hub      *HubAdapter
}

// HubAdapter implements the domain realtime.Hub interface using in-memory room routing and gorilla/websocket.
type HubAdapter struct {
	mu          sync.RWMutex
	clients     map[string]*Client                   // clientID -> client
	tenantRooms map[string]map[string]map[string]*Client // tenantID -> roomID -> clientID -> client
	userClients map[string]map[string]*Client       // userID -> clientID -> client
	logger      *slog.Logger
}

// NewHubAdapter constructs and initializes a real-time HubAdapter.
func NewHubAdapter(logger *slog.Logger) *HubAdapter {
	return &HubAdapter{
		clients:     make(map[string]*Client),
		tenantRooms: make(map[string]map[string]map[string]*Client),
		userClients: make(map[string]map[string]*Client),
		logger:      logger,
	}
}

// Broadcast dispatches a real-time message to all connections in a specific tenant room.
func (h *HubAdapter) Broadcast(ctx context.Context, msg realtime.Message) error {
	h.mu.RLock()
	defer h.mu.RUnlock()

	rooms, ok := h.tenantRooms[msg.TenantID]
	if !ok {
		return nil
	}

	clients, ok := rooms[msg.RoomID]
	if !ok {
		return nil
	}

	for _, client := range clients {
		select {
		case client.Send <- msg:
		default:
			h.logger.WarnContext(ctx, "client buffer full, dropping message",
				"client_id", client.ID,
				"tenant_id", msg.TenantID,
			)
		}
	}

	return nil
}

// BroadcastToUser dispatches a targeted message to all active sockets of a specific user.
func (h *HubAdapter) BroadcastToUser(ctx context.Context, tenantID, userID string, msg realtime.Message) error {
	h.mu.RLock()
	defer h.mu.RUnlock()

	clients, ok := h.userClients[userID]
	if !ok {
		return nil
	}

	for _, client := range clients {
		if client.TenantID == tenantID {
			select {
			case client.Send <- msg:
			default:
				h.logger.WarnContext(ctx, "user client buffer full", "client_id", client.ID)
			}
		}
	}

	return nil
}

// Subscribe registers a client into a designated tenant room.
func (h *HubAdapter) Subscribe(tenantID, roomID, clientID string) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	client, ok := h.clients[clientID]
	if !ok {
		return fmt.Errorf("client %s not registered in hub", clientID)
	}

	if _, ok := h.tenantRooms[tenantID]; !ok {
		h.tenantRooms[tenantID] = make(map[string]map[string]*Client)
	}
	if _, ok := h.tenantRooms[tenantID][roomID]; !ok {
		h.tenantRooms[tenantID][roomID] = make(map[string]*Client)
	}

	h.tenantRooms[tenantID][roomID][clientID] = client
	return nil
}

// Unsubscribe removes a client from a room.
func (h *HubAdapter) Unsubscribe(tenantID, roomID, clientID string) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	if rooms, ok := h.tenantRooms[tenantID]; ok {
		if clients, ok := rooms[roomID]; ok {
			delete(clients, clientID)
			if len(clients) == 0 {
				delete(rooms, roomID)
			}
		}
	}
	return nil
}

// ActiveConnections returns the total number of connected WebSocket clients.
func (h *HubAdapter) ActiveConnections() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
