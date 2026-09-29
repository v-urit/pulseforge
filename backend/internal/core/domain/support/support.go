// Package support defines entities and repository contracts for live customer support conversations.
package support

import (
	"context"
	"time"
)

// ConversationStatus indicates the triage lifecycle of a support ticket.
type ConversationStatus string

const (
	// StatusOpen indicates an unresolved conversation awaiting response.
	StatusOpen ConversationStatus = "open"
	// StatusAssigned indicates an agent is actively chatting with the customer.
	StatusAssigned ConversationStatus = "assigned"
	// StatusClosed indicates the issue has been resolved.
	StatusClosed ConversationStatus = "closed"
)

// Conversation represents a support thread between a tenant customer and agents.
type Conversation struct {
	ID         string             `json:"id"`
	TenantID   string             `json:"tenant_id"`
	CustomerID string             `json:"customer_id"`
	AgentID    *string            `json:"agent_id,omitempty"`
	Subject    string             `json:"subject"`
	Status     ConversationStatus `json:"status"`
	CreatedAt  time.Time          `json:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at"`
}

// Message represents an individual text message in a conversation.
type Message struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversation_id"`
	TenantID       string    `json:"tenant_id"`
	SenderID       string    `json:"sender_id"`
	SenderType     string    `json:"sender_type"` // customer, agent, system
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"created_at"`
}

// Repository defines data access methods for support threads and messages.
type Repository interface {
	// CreateConversation opens a new support conversation.
	CreateConversation(ctx context.Context, tenantID string, c *Conversation) error
	// GetConversationByID retrieves conversation metadata.
	GetConversationByID(ctx context.Context, tenantID, id string) (*Conversation, error)
	// ListConversations lists open threads across or within tenants.
	ListConversations(ctx context.Context, tenantID string, status ConversationStatus) ([]*Conversation, error)
	// SaveMessage persists a chat message.
	SaveMessage(ctx context.Context, tenantID string, m *Message) error
	// GetMessages retrieves recent history for a conversation thread.
	GetMessages(ctx context.Context, tenantID, conversationID string, limit int) ([]*Message, error)
}
