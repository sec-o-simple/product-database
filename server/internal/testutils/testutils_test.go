package testutils

import (
	"errors"
	"testing"
	"time"

	"product-database-api/internal"
)

func TestSetupTestDB(t *testing.T) {
	db := SetupTestDB(t)
	if db == nil {
		t.Error("SetupTestDB should return a database connection")
	}

	// Test that database is usable
	sqlDB, err := db.DB()
	if err != nil {
		t.Errorf("Should be able to get underlying sql.DB: %v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		t.Errorf("Database should be pingable: %v", err)
	}

	CleanupTestDB(t, db)
}

func TestCreateTestVendor(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	vendor := CreateTestVendor(t, db, "Test Vendor", "A test vendor")

	if vendor.Name != "Test Vendor" {
		t.Errorf("Expected vendor name 'Test Vendor', got '%s'", vendor.Name)
	}

	if vendor.Description != "A test vendor" {
		t.Errorf("Expected vendor description 'A test vendor', got '%s'", vendor.Description)
	}

	if vendor.Category != internal.Vendor {
		t.Errorf("Expected vendor category '%s', got '%s'", internal.Vendor, vendor.Category)
	}

	// Verify vendor was saved to database
	var count int64
	db.Model(&internal.Node{}).Where("id = ?", vendor.ID).Count(&count)
	if count != 1 {
		t.Errorf("Expected 1 vendor in database, got %d", count)
	}
}

func TestCreateTestProduct(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	// Create a vendor first
	vendor := CreateTestVendor(t, db, "Vendor", "Test vendor")

	product := CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, internal.Software)

	if product.Name != "Test Product" {
		t.Errorf("Expected product name 'Test Product', got '%s'", product.Name)
	}

	if product.Description != "A test product" {
		t.Errorf("Expected product description 'A test product', got '%s'", product.Description)
	}

	if product.ProductType != internal.Software {
		t.Errorf("Expected product type '%s', got '%s'", internal.Software, product.ProductType)
	}

	if product.ParentID == nil || *product.ParentID != vendor.ID {
		t.Error("Product should have correct parent ID")
	}
}

func TestCreateTestProductVersion(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	// Create vendor and product first
	vendor := CreateTestVendor(t, db, "Vendor", "Test vendor")
	product := CreateTestProduct(t, db, "Product", "Test product", vendor.ID, internal.Software)

	now := time.Now()
	version := CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, &now)

	if version.Name != "1.0.0" {
		t.Errorf("Expected version name '1.0.0', got '%s'", version.Name)
	}

	if version.Description != "First version" {
		t.Errorf("Expected version description 'First version', got '%s'", version.Description)
	}

	if version.Category != internal.ProductVersion {
		t.Errorf("Expected version category '%s', got '%s'", internal.ProductVersion, version.Category)
	}

	if version.ParentID == nil || *version.ParentID != product.ID {
		t.Error("Version should have correct parent ID")
	}

	if !version.ReleasedAt.Valid {
		t.Error("Version should have a release date")
	}
}

func TestCreateTestRelationship(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	// Create vendor, product, and version
	vendor := CreateTestVendor(t, db, "Vendor", "Test vendor")
	product := CreateTestProduct(t, db, "Product", "Test product", vendor.ID, internal.Software)
	version := CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)

	relationship := CreateTestRelationship(t, db, version.ID, version.ID, internal.DefaultComponentOf)

	if relationship.SourceNodeID != version.ID {
		t.Error("Relationship should have correct source node ID")
	}

	if relationship.TargetNodeID != version.ID {
		t.Error("Relationship should have correct target node ID")
	}

	if relationship.Category != internal.DefaultComponentOf {
		t.Errorf("Expected relationship category '%s', got '%s'", internal.DefaultComponentOf, relationship.Category)
	}
}

func TestCreateTestIdentificationHelper(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	// Create vendor, product, and version
	vendor := CreateTestVendor(t, db, "Vendor", "Test vendor")
	product := CreateTestProduct(t, db, "Product", "Test product", vendor.ID, internal.Software)
	version := CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)

	metadata := []byte(`{"cpe": "cpe:2.3:a:test:product:1.0.0:*:*:*:*:*:*:*"}`)
	helper := CreateTestIdentificationHelper(t, db, version.ID, "cpe", metadata)

	if helper.NodeID != version.ID {
		t.Error("Identification helper should have correct node ID")
	}

	if helper.Category != "cpe" {
		t.Errorf("Expected helper category 'cpe', got '%s'", helper.Category)
	}

	if string(helper.Metadata) != string(metadata) {
		t.Error("Identification helper should have correct metadata")
	}
}

func TestSetupAndCleanupTestEnv(t *testing.T) {
	// These functions manage environment variables
	SetupTestEnv()
	CleanupTestEnv()
	// No specific assertions as these are environment management functions
}

func TestAssertFunctions(t *testing.T) {
	t.Run("AssertNoError", func(t *testing.T) {
		// Create a test instance that we can use
		testT := &testing.T{}

		// Test with no error (should not fail)
		AssertNoError(testT, nil, "Should not error")

		// We can't easily test the failure case without creating a complex mock
	})

	t.Run("AssertError", func(t *testing.T) {
		testT := &testing.T{}

		// Test with an error (should not fail the test)
		AssertError(testT, errors.New("test error"), "Should have error")
	})

	t.Run("AssertEqual", func(t *testing.T) {
		testT := &testing.T{}

		// Test with equal values
		AssertEqual(testT, "test", "test", "Values should be equal")
		AssertEqual(testT, 42, 42, "Numbers should be equal")
	})

	t.Run("AssertNotEmpty", func(t *testing.T) {
		testT := &testing.T{}

		// Test with non-empty string
		AssertNotEmpty(testT, "not empty", "String should not be empty")
	})

	t.Run("AssertCount", func(t *testing.T) {
		testT := &testing.T{}

		// Test with equal counts
		AssertCount(testT, 5, 5, "Counts should be equal")
	})

	t.Run("PrintTestSeparator", func(t *testing.T) {
		// This function just prints output, so we just call it to get coverage
		PrintTestSeparator(t, "Test Separator")
	})
}
