package testutils

import (
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NodeCategory represents the type of node
type NodeCategory string

const (
	Vendor         NodeCategory = "vendor"
	ProductFamily  NodeCategory = "product_family"
	ProductName    NodeCategory = "product_name"
	ProductVersion NodeCategory = "product_version"
)

// RelationshipCategory represents the type of relationship
type RelationshipCategory string

const (
	DefaultComponentOf  RelationshipCategory = "default_component_of"
	ExternalComponentOf RelationshipCategory = "external_component_of"
	InstalledOn         RelationshipCategory = "installed_on"
	InstalledWith       RelationshipCategory = "installed_with"
	OptionalComponentOf RelationshipCategory = "optional_component_of"
)

// ProductType represents the type of product
type ProductType string

const (
	Software ProductType = "software"
	Hardware ProductType = "hardware"
	Firmware ProductType = "firmware"
)

// Node represents a node in the database for testing
type Node struct {
	ID       string `gorm:"primaryKey"`
	Category NodeCategory

	Name        string
	Description string `gorm:"type:text"`

	ParentID *string
	Parent   *Node  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Children []Node `gorm:"foreignKey:ParentID"`

	SourceRelationships []Relationship `gorm:"foreignKey:SourceNodeID"`
	TargetRelationships []Relationship `gorm:"foreignKey:TargetNodeID"`

	ProductType ProductType `gorm:"type:product_type"`
	ReleasedAt  sql.NullTime

	SuccessorID *string
	Successor   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

// Relationship represents a relationship between nodes for testing
type Relationship struct {
	ID       string `gorm:"primaryKey"`
	Category RelationshipCategory

	SourceNodeID string
	SourceNode   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	TargetNodeID string
	TargetNode   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// IdentificationHelper represents an identification helper for testing
type IdentificationHelper struct {
	ID       string `gorm:"primaryKey"`
	Category string
	Metadata []byte `gorm:"serializer:json"`

	NodeID string
	Node   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

// SetupTestDB creates an in-memory SQLite database for testing
func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto-migrate the schema
	err = db.AutoMigrate(&Node{}, &Relationship{}, &IdentificationHelper{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

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
func CreateTestVendor(t *testing.T, db *gorm.DB, name, description string) Node {
	vendor := Node{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Category:    Vendor,
	}

	result := db.Create(&vendor)
	if result.Error != nil {
		t.Fatalf("Failed to create test vendor: %v", result.Error)
	}

	return vendor
}

// CreateTestProduct creates a test product node
func CreateTestProduct(t *testing.T, db *gorm.DB, name, description string, vendorID string, productType ProductType) Node {
	product := Node{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Category:    ProductFamily,
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
func CreateTestProductVersion(t *testing.T, db *gorm.DB, name, description string, productID string, releasedAt *time.Time) Node {
	var sqlTime sql.NullTime
	if releasedAt != nil {
		sqlTime = sql.NullTime{Time: *releasedAt, Valid: true}
	}

	version := Node{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Category:    ProductVersion,
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
func CreateTestRelationship(t *testing.T, db *gorm.DB, sourceID, targetID string, category RelationshipCategory) Relationship {
	relationship := Relationship{
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
func CreateTestIdentificationHelper(t *testing.T, db *gorm.DB, nodeID string, category string, metadata []byte) IdentificationHelper {
	helper := IdentificationHelper{
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
