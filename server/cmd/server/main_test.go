package main

import (
	"os"
	"product-database-api/internal"
	"product-database-api/internal/database"
	"product-database-api/testutils"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func TestMain(m *testing.M) {
	// Setup test environment
	testutils.SetupTestEnv()

	// Run tests
	code := m.Run()

	// Cleanup
	testutils.CleanupTestEnv()

	os.Exit(code)
}

func TestApplicationIntegration(t *testing.T) {
	// Setup test database
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	testutils.AssertNoError(t, err, "Should connect to test database")

	// Run migrations
	database.AutoMigrate(db, internal.Models()...)

	// Create repository, service, and handler
	repo := internal.NewRepository(db)
	service := internal.NewService(repo)
	handler := internal.NewHandler(service)

	// Verify all components are created successfully
	testutils.AssertEqual(t, true, repo != nil, "Repository should be created")
	testutils.AssertEqual(t, true, service != nil, "Service should be created")
	testutils.AssertEqual(t, true, handler != nil, "Handler should be created")

	t.Run("FullWorkflow", func(t *testing.T) {
		// Test a complete workflow from creation to cleanup
		ctx := testutils.CreateTestVendor(t, db, "Integration Test Vendor", "A vendor for integration testing")

		// Verify the vendor was created properly
		testutils.AssertNotEmpty(t, ctx.ID, "Vendor should have an ID")
		testutils.AssertEqual(t, "Integration Test Vendor", ctx.Name, "Vendor should have correct name")

		// Create a product under this vendor
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", ctx.ID, testutils.Software)
		testutils.AssertNotEmpty(t, product.ID, "Product should have an ID")
		testutils.AssertEqual(t, ctx.ID, *product.ParentID, "Product should belong to vendor")

		// Create a version under this product
		version := testutils.CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)
		testutils.AssertNotEmpty(t, version.ID, "Version should have an ID")
		testutils.AssertEqual(t, product.ID, *version.ParentID, "Version should belong to product")

		// Create identification helper for the version
		metadata := []byte(`{"cpe": "cpe:2.3:a:test:product:1.0.0:*:*:*:*:*:*:*"}`)
		helper := testutils.CreateTestIdentificationHelper(t, db, version.ID, "cpe", metadata)
		testutils.AssertNotEmpty(t, helper.ID, "Helper should have an ID")
		testutils.AssertEqual(t, version.ID, helper.NodeID, "Helper should reference version")

		// Verify the complete hierarchy can be queried
		var vendorWithHierarchy testutils.Node
		result := db.Preload("Children.Children").First(&vendorWithHierarchy, "id = ?", ctx.ID)
		testutils.AssertNoError(t, result.Error, "Should load vendor with complete hierarchy")
		testutils.AssertCount(t, 1, len(vendorWithHierarchy.Children), "Vendor should have 1 product")
		testutils.AssertCount(t, 1, len(vendorWithHierarchy.Children[0].Children), "Product should have 1 version")
	})
}

func TestEnvironmentVariables(t *testing.T) {
	// Test that environment variables are properly set for testing
	testutils.AssertEqual(t, "test", os.Getenv("ENV"), "ENV should be set to test")
	testutils.AssertEqual(t, "localhost", os.Getenv("HOST"), "HOST should be set")
	testutils.AssertEqual(t, "8080", os.Getenv("PORT"), "PORT should be set")
	testutils.AssertEqual(t, "http://localhost:3000", os.Getenv("CORS_ORIGIN"), "CORS_ORIGIN should be set")
}

func TestModelsRegistration(t *testing.T) {
	models := internal.Models()
	testutils.AssertCount(t, 3, len(models), "Should register 3 models")

	// Verify model types
	hasNode := false
	hasRelationship := false
	hasIdentificationHelper := false

	for _, model := range models {
		switch model.(type) {
		case *internal.Node:
			hasNode = true
		case *internal.Relationship:
			hasRelationship = true
		case *internal.IdentificationHelper:
			hasIdentificationHelper = true
		}
	}

	testutils.AssertEqual(t, true, hasNode, "Should include Node model")
	testutils.AssertEqual(t, true, hasRelationship, "Should include Relationship model")
	testutils.AssertEqual(t, true, hasIdentificationHelper, "Should include IdentificationHelper model")
}
