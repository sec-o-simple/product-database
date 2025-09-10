package database

import (
	"os"
	"path/filepath"
	"product-database-api/internal"
	"testing"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func TestConnect_ErrorCases(t *testing.T) {
	// Save original env var
	originalDB := os.Getenv("DATABASE_PATH")
	defer func() {
		if originalDB != "" {
			os.Setenv("DATABASE_PATH", originalDB)
		} else {
			os.Unsetenv("DATABASE_PATH")
		}
	}()

	t.Run("ConnectWithEnvVariable", func(t *testing.T) {
		// Create a temporary database file
		tmpDir := t.TempDir()
		dbFile := filepath.Join(tmpDir, "test.db")
		os.Setenv("DATABASE_PATH", dbFile)

		db := Connect()
		if db == nil {
			t.Error("Connect should return a database connection")
		}

		// Verify the database is working
		err := db.Exec("SELECT 1").Error
		if err != nil {
			t.Errorf("Database should be functional: %v", err)
		}
	})

	t.Run("ConnectWithInvalidPath", func(t *testing.T) {
		// Set an invalid path that should fail
		invalidPath := "/root/nonexistent/path/test.db"
		os.Setenv("DATABASE_PATH", invalidPath)

		// This should panic, so we'll catch it
		defer func() {
			if r := recover(); r == nil {
				t.Error("Connect should panic with invalid path")
			}
		}()

		Connect()
	})

	t.Run("ConnectWithoutEnvVariable", func(t *testing.T) {
		// Clear env var
		os.Unsetenv("DATABASE_PATH")

		// This should panic
		defer func() {
			if r := recover(); r == nil {
				t.Error("Connect should panic without DATABASE_PATH")
			}
		}()

		Connect()
	})
}

func TestAutoMigrate_EdgeCases(t *testing.T) {
	t.Run("EmptyModelsList", func(t *testing.T) {
		db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err != nil {
			t.Fatal("Failed to create test database")
		}

		// AutoMigrate with no models should not panic
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("AutoMigrate with empty models should not panic: %v", r)
			}
		}()

		AutoMigrate(db)
	})

	t.Run("MigrateIdempotency", func(t *testing.T) {
		db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err != nil {
			t.Fatal("Failed to create test database")
		}

		// Migrate once
		models := internal.Models()
		AutoMigrate(db, models...)

		// Migrate again - should be idempotent
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("AutoMigrate should be idempotent: %v", r)
			}
		}()

		AutoMigrate(db, models...)
	})

	t.Run("MultipleAutoMigrateCalls", func(t *testing.T) {
		db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err != nil {
			t.Fatal("Failed to create test database")
		}

		models := internal.Models()

		// Call AutoMigrate multiple times
		for i := 0; i < 3; i++ {
			func() {
				defer func() {
					if r := recover(); r != nil {
						t.Errorf("AutoMigrate call %d should not panic: %v", i+1, r)
					}
				}()
				AutoMigrate(db, models...)
			}()
		}
	})
}

func TestDatabasePerformance(t *testing.T) {
	t.Run("DatabaseCreationTime", func(t *testing.T) {
		start := time.Now()

		// Create in-memory database for performance testing
		db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err != nil {
			t.Fatal("Failed to create test database")
		}

		duration := time.Since(start)

		// Database creation should be fast (less than 1 second)
		if duration > time.Second {
			t.Errorf("Database creation took too long: %v", duration)
		}

		t.Logf("Database creation took: %v", duration)

		// Test database is functional
		sqlDB, err := db.DB()
		if err != nil {
			t.Error("Should be able to get underlying sql.DB")
		}

		if err := sqlDB.Ping(); err != nil {
			t.Error("Database should be pingable")
		}
	})

	t.Run("MigrationTime", func(t *testing.T) {
		db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err != nil {
			t.Fatalf("Failed to create test database: %v", err)
		}

		models := internal.Models()
		start := time.Now()
		AutoMigrate(db, models...)
		duration := time.Since(start)

		// Migration should be fast (less than 1 second)
		if duration > time.Second {
			t.Errorf("Migration took too long: %v", duration)
		}

		t.Logf("Migration took: %v", duration)
	})
}

func TestDatabaseIntegration(t *testing.T) {
	t.Run("CompleteWorkflow", func(t *testing.T) {
		// Create in-memory database for testing
		db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err != nil {
			t.Fatal("Failed to create test database")
		}

		// Run migrations
		models := internal.Models()
		AutoMigrate(db, models...)

		// Test basic operations
		// Create a vendor
		vendor := internal.Node{
			ID:          "vendor-1",
			Name:        "Test Vendor",
			Description: "Test vendor description",
			Category:    internal.Vendor,
		}

		err = db.Create(&vendor).Error
		if err != nil {
			t.Errorf("Failed to create vendor: %v", err)
		}

		// Create a product
		product := internal.Node{
			ID:          "product-1",
			Name:        "Test Product",
			Description: "Test product description",
			Category:    "product",
			ParentID:    &vendor.ID,
		}

		err = db.Create(&product).Error
		if err != nil {
			t.Errorf("Failed to create product: %v", err)
		}

		// Create a version
		version := internal.Node{
			ID:          "version-1",
			Name:        "1.0.0",
			Description: "First version",
			Category:    internal.ProductVersion,
			ParentID:    &product.ID,
		}

		err = db.Create(&version).Error
		if err != nil {
			t.Errorf("Failed to create version: %v", err)
		}

		// Create a relationship
		relationship := internal.Relationship{
			ID:           "rel-1",
			SourceNodeID: version.ID,
			TargetNodeID: version.ID,
			Category:     internal.DefaultComponentOf,
		}

		err = db.Create(&relationship).Error
		if err != nil {
			t.Errorf("Failed to create relationship: %v", err)
		}

		// Create an identification helper
		helper := internal.IdentificationHelper{
			ID:       "helper-1",
			NodeID:   version.ID,
			Category: "cpe",
			Metadata: []byte(`{"cpe": "cpe:2.3:a:test:product:1.0.0:*:*:*:*:*:*:*"}`),
		}

		err = db.Create(&helper).Error
		if err != nil {
			t.Errorf("Failed to create identification helper: %v", err)
		}

		// Query back and verify
		var retrievedVendor internal.Node
		err = db.Preload("Children.Children").First(&retrievedVendor, "id = ?", vendor.ID).Error
		if err != nil {
			t.Errorf("Failed to retrieve vendor: %v", err)
		}

		if retrievedVendor.Name != "Test Vendor" {
			t.Error("Vendor name should match")
		}

		if len(retrievedVendor.Children) != 1 {
			t.Error("Vendor should have one child (product)")
		}

		if len(retrievedVendor.Children[0].Children) != 1 {
			t.Error("Product should have one child (version)")
		}
	})
}
