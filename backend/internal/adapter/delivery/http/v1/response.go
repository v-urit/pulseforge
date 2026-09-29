// Package v1 contains HTTP delivery handlers, routing, response formatting, and middleware for API v1.
package v1

import (
	"encoding/json"
	"net/http"
)

// Response standardizes successful API JSON responses.
type Response struct {
	Success bool   `json:"success"`
	Data    any    `json:"data,omitempty"`
	Message string `json:"message,omitempty"`
}

// ErrorResponse standardizes error API JSON responses.
type ErrorResponse struct {
	Success bool              `json:"success"`
	Error   string            `json:"error"`
	Details map[string]string `json:"details,omitempty"`
}

// RespondJSON marshals and sends a 2xx JSON payload with application/json header.
func RespondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(Response{
		Success: true,
		Data:    data,
	})
}

// RespondError marshals and writes a standardized error JSON response.
func RespondError(w http.ResponseWriter, status int, message string, details map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   message,
		Details: details,
	})
}
