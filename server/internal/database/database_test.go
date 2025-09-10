package database

import (
	"os"
	"product-database-api/internal"
	"testing"
)

func TestConnect(t *testing.T) {
	// Set up test environment variable
	originalPath := os.Getenv("DATABASE_PATH")
	defer func() {
		if originalPath != "" {
			os.Setenv("DATABASE_PATH", originalPath)
		} else {
			os.Unsetenv("DATABASE_PATH")
		}
	}()

	// Test database connection with memory database
	os.Setenv("DATABASE_PATH", ":memory:")
	db := Connect()

	if db == nil {
		t.Error("Database connection should not be nil")
	}

	// Test that we can perform basic operations
	var result int64
	err := db.Raw("SELECT 1").Count(&result).Error
	if err != nil {
		t.Errorf("Failed to execute basic query: %v", err)
	}
}

func TestConnectWithFile(t *testing.T) {
	// Set up test environment variable
	originalPath := os.Getenv("DATABASE_PATH")
	defer func() {
		if originalPath != "" {
			os.Setenv("DATABASE_PATH", originalPath)
		} else {
			os.Unsetenv("DATABASE_PATH")
		}
	}()

	// Test database connection with file database
	dbPath := "test_connect.db"
	defer os.Remove(dbPath)

	os.Setenv("DATABASE_PATH", dbPath)
	db := Connect()

	if db == nil {
		t.Error("Database connection should not be nil")
	}

	// Verify file was created
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Error("Database file should be created")
	}
}

func TestConnectPanic(t *testing.T) {
	// Set up test environment variable
	originalPath := os.Getenv("DATABASE_PATH")
	defer func() {
		if originalPath != "" {
			os.Setenv("DATABASE_PATH", originalPath)
		} else {
			os.Unsetenv("DATABASE_PATH")
		}
	}()

	// Test that Connect panics when DATABASE_PATH is not set
	os.Unsetenv("DATABASE_PATH")

	defer func() {
		if r := recover(); r == nil {
			t.Error("Connect should panic when DATABASE_PATH is not set")
		}
	}()

	Connect()
}

func TestAutoMigrate(t *testing.T) {
	// Set up test environment variable
	originalPath := os.Getenv("DATABASE_PATH")
	defer func() {
		if originalPath != "" {
			os.Setenv("DATABASE_PATH", originalPath)
		} else {
			os.Unsetenv("DATABASE_PATH")
		}
	}()

	// Create a test database
	os.Setenv("DATABASE_PATH", ":memory:")
	db := Connect()

	// Test auto migration
	models := internal.Models()
	AutoMigrate(db, models...)

	// Verify tables were created by checking if we can create records
	testNode := internal.Node{
		ID:       "test-id",
		Category: "test",
		Name:     "Test Node",
	}

	err := db.Create(&testNode).Error
	if err != nil {
		t.Errorf("Failed to create test record after migration: %v", err)
	}

	// Verify the record exists
	var count int64
	db.Model(&internal.Node{}).Where("id = ?", "test-id").Count(&count)
	if count != 1 {
		t.Errorf("Expected 1 record, got %d", count)
	}
}

func TestAutoMigrateWithExistingTables(t *testing.T) {
	// Set up test environment variable
	originalPath := os.Getenv("DATABASE_PATH")
	defer func() {
		if originalPath != "" {
			os.Setenv("DATABASE_PATH", originalPath)
		} else {
			os.Unsetenv("DATABASE_PATH")
		}
	}()

	// Create a test database
	os.Setenv("DATABASE_PATH", ":memory:")
	db := Connect()

	// Run migration twice to test idempotency
	models := internal.Models()
	AutoMigrate(db, models...)
	AutoMigrate(db, models...)

	// Should not cause errors when run multiple times
	testNode := internal.Node{
		ID:       "test-id-2",
		Category: "test",
		Name:     "Test Node 2",
	}

	err := db.Create(&testNode).Error
	if err != nil {
		t.Errorf("Failed to create test record after multiple migrations: %v", err)
	}
}
