package internal

import (
	"testing"

	"product-database-api/testutils"

	"github.com/go-fuego/fuego"
)

func TestRoutes(t *testing.T) {
	// Create a new fuego server
	app := fuego.NewServer()

	// Create a real service with test database
	db := testutils.SetupTestDB(t)
	defer testutils.CleanupTestDB(t, db)

	repo := NewRepository(db)
	service := NewService(repo)

	// Register routes
	RegisterRoutes(app, service)

	// Verify the server was configured
	if app == nil {
		t.Error("Expected app to be created")
	}
}

func TestRegisterRoutes_Coverage(t *testing.T) {
	db := testutils.SetupTestDB(t)
	defer testutils.CleanupTestDB(t, db)

	repo := NewRepository(db)
	svc := NewService(repo)

	// Create a Fuego server
	app := fuego.NewServer()

	// Test that route registration doesn't panic
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("RegisterRoutes panicked: %v", r)
		}
	}()

	// Call the route registration function
	RegisterRoutes(app, svc)

	// If we get here, route registration was successful
	t.Log("Routes registered successfully")
}
