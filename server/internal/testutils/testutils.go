package testutils

import (
	"database/sql"
	"fmt"
	"os"
	"product-database-api/internal"
	"product-database-api/internal/database"
	"testing"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// SetupTestDB creates an in-memory SQLite database for testing
func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto-migrate the schema
	database.AutoMigrate(db, internal.Models()...)

	return db
}

// CleanupTestDB closes the database connection and cleans up
func CleanupTestDB(t *testing.T, db *gorm.DB) {
	sqlDB, err := db.DB()
	if err != nil {
		t.Logf("Failed to get underlying SQL DB: %v", err)
		return
	}
	sqlDB.Close()
}

// CreateTestVendor creates a test vendor node
func CreateTestVendor(t *testing.T, db *gorm.DB, name, description string) internal.Node {
	vendor := internal.Node{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Category:    internal.Vendor,
	}

	result := db.Create(&vendor)
	if result.Error != nil {
		t.Fatalf("Failed to create test vendor: %v", result.Error)
	}

	return vendor
}

// CreateTestProduct creates a test product node
func CreateTestProduct(t *testing.T, db *gorm.DB, name, description string, vendorID string, productType internal.ProductType) internal.Node {
	product := internal.Node{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Category:    internal.ProductFamily,
		ParentID:    &vendorID,
		ProductType: productType,
	}

	result := db.Create(&product)
	if result.Error != nil {
		t.Fatalf("Failed to create test product: %v", result.Error)
	}

	return product
}

// CreateTestProductVersion creates a test product version node
func CreateTestProductVersion(t *testing.T, db *gorm.DB, name, description string, productID string, releasedAt *time.Time) internal.Node {
	var sqlTime sql.NullTime
	if releasedAt != nil {
		sqlTime = sql.NullTime{Time: *releasedAt, Valid: true}
	}

	version := internal.Node{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Category:    internal.ProductVersion,
		ParentID:    &productID,
		ReleasedAt:  sqlTime,
	}

	result := db.Create(&version)
	if result.Error != nil {
		t.Fatalf("Failed to create test product version: %v", result.Error)
	}

	return version
}

// CreateTestRelationship creates a test relationship
func CreateTestRelationship(t *testing.T, db *gorm.DB, sourceID, targetID string, category internal.RelationshipCategory) internal.Relationship {
	relationship := internal.Relationship{
		ID:           uuid.New().String(),
		Category:     category,
		SourceNodeID: sourceID,
		TargetNodeID: targetID,
	}

	result := db.Create(&relationship)
	if result.Error != nil {
		t.Fatalf("Failed to create test relationship: %v", result.Error)
	}

	return relationship
}

// CreateTestIdentificationHelper creates a test identification helper
func CreateTestIdentificationHelper(t *testing.T, db *gorm.DB, nodeID string, category internal.IdentificationHelperCategory, metadata []byte) internal.IdentificationHelper {
	helper := internal.IdentificationHelper{
		ID:       uuid.New().String(),
		Category: category,
		Metadata: metadata,
		NodeID:   nodeID,
	}

	result := db.Create(&helper)
	if result.Error != nil {
		t.Fatalf("Failed to create test identification helper: %v", result.Error)
	}

	return helper
}

// SetupTestEnv sets up environment variables for testing
func SetupTestEnv() {
	os.Setenv("ENV", "test")
	os.Setenv("HOST", "localhost")
	os.Setenv("PORT", "8080")
	os.Setenv("CORS_ORIGIN", "http://localhost:3000")
}

// CleanupTestEnv cleans up environment variables after testing
func CleanupTestEnv() {
	os.Unsetenv("ENV")
	os.Unsetenv("HOST")
	os.Unsetenv("PORT")
	os.Unsetenv("CORS_ORIGIN")
}

// AssertNoError is a helper to assert that no error occurred
func AssertNoError(t *testing.T, err error, msg string) {
	if err != nil {
		t.Fatalf("%s: %v", msg, err)
	}
}

// AssertError is a helper to assert that an error occurred
func AssertError(t *testing.T, err error, msg string) {
	if err == nil {
		t.Fatalf("%s: expected error but got nil", msg)
	}
}

// AssertEqual is a helper to assert equality
func AssertEqual(t *testing.T, expected, actual interface{}, msg string) {
	if expected != actual {
		t.Fatalf("%s: expected %v, got %v", msg, expected, actual)
	}
}

// AssertNotEmpty is a helper to assert that a string is not empty
func AssertNotEmpty(t *testing.T, value, msg string) {
	if value == "" {
		t.Fatalf("%s: expected non-empty string", msg)
	}
}

// AssertCount is a helper to assert slice length
func AssertCount(t *testing.T, expected int, actual int, msg string) {
	if expected != actual {
		t.Fatalf("%s: expected count %d, got %d", msg, expected, actual)
	}
}

// PrintTestSeparator prints a separator for better test output readability
func PrintTestSeparator(t *testing.T, testName string) {
	fmt.Printf("\n=== %s ===\n", testName)
}
