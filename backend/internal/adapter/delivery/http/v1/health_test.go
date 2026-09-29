package v1_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/pulseforge/pulseforge/internal/adapter/delivery/http/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHealthHandler_Healthz(t *testing.T) {
	handler := v1.NewHealthHandler(nil, nil)

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()

	handler.Healthz(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))

	var resp v1.Response
	err := json.Unmarshal(rec.Body.Bytes(), &resp)
	require.NoError(t, err)
	assert.True(t, resp.Success)

	dataMap, ok := resp.Data.(map[string]any)
	require.True(t, ok)
	assert.Equal(t, "ok", dataMap["status"])
}

func TestHealthHandler_Readyz_Unconfigured(t *testing.T) {
	handler := v1.NewHealthHandler(nil, nil)

	req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
	rec := httptest.NewRecorder()

	handler.Readyz(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var resp v1.Response
	err := json.Unmarshal(rec.Body.Bytes(), &resp)
	require.NoError(t, err)
	assert.True(t, resp.Success)
}
