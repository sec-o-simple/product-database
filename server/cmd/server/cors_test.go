package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCorsMiddleware(t *testing.T) {
	// Test handler that just returns 200
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("NoAllowedOrigins", func(t *testing.T) {
		middleware := corsMiddleware([]string{})
		handler := middleware(testHandler)

		req := httptest.NewRequest("GET", "/test", nil)
		req.Header.Set("Origin", "http://example.com")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should not set any CORS headers when no origins are allowed
		if rec.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Error("Expected no CORS headers when no origins are allowed")
		}
	})

	t.Run("AllowedOriginMatch", func(t *testing.T) {
		allowedOrigins := []string{"http://localhost:3000", "http://example.com"}
		middleware := corsMiddleware(allowedOrigins)
		handler := middleware(testHandler)

		req := httptest.NewRequest("GET", "/test", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should set CORS headers for allowed origin
		if rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
			t.Errorf("Expected Access-Control-Allow-Origin to be http://localhost:3000, got %s", rec.Header().Get("Access-Control-Allow-Origin"))
		}
		if rec.Header().Get("Access-Control-Allow-Methods") == "" {
			t.Error("Expected Access-Control-Allow-Methods to be set")
		}
		if rec.Header().Get("Access-Control-Allow-Headers") == "" {
			t.Error("Expected Access-Control-Allow-Headers to be set")
		}
	})

	t.Run("WildcardOrigin", func(t *testing.T) {
		allowedOrigins := []string{"*"}
		middleware := corsMiddleware(allowedOrigins)
		handler := middleware(testHandler)

		req := httptest.NewRequest("GET", "/test", nil)
		req.Header.Set("Origin", "http://any-domain.com")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should allow wildcard origin
		if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
			t.Errorf("Expected Access-Control-Allow-Origin to be *, got %s", rec.Header().Get("Access-Control-Allow-Origin"))
		}
	})

	t.Run("DisallowedOrigin", func(t *testing.T) {
		allowedOrigins := []string{"http://localhost:3000"}
		middleware := corsMiddleware(allowedOrigins)
		handler := middleware(testHandler)

		req := httptest.NewRequest("GET", "/test", nil)
		req.Header.Set("Origin", "http://malicious-site.com")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should not set CORS headers for disallowed origin
		if rec.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Error("Expected no CORS headers for disallowed origin")
		}
	})

	t.Run("PreflightRequest", func(t *testing.T) {
		allowedOrigins := []string{"http://localhost:3000"}
		middleware := corsMiddleware(allowedOrigins)
		handler := middleware(testHandler)

		req := httptest.NewRequest("OPTIONS", "/test", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should handle preflight requests properly
		if rec.Code != http.StatusOK {
			t.Errorf("Expected status 200 for OPTIONS request, got %d", rec.Code)
		}
		if rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
			t.Error("Expected CORS headers to be set for OPTIONS request")
		}
	})

	t.Run("NoOriginHeader", func(t *testing.T) {
		allowedOrigins := []string{"http://localhost:3000"}
		middleware := corsMiddleware(allowedOrigins)
		handler := middleware(testHandler)

		req := httptest.NewRequest("GET", "/test", nil)
		// No Origin header set
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should not set CORS headers when no origin is provided
		if rec.Header().Get("Access-Control-Allow-Origin") != "" {
			t.Error("Expected no CORS headers when no Origin header is provided")
		}
		if rec.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", rec.Code)
		}
	})
}
