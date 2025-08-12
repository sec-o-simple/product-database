package internal

import (
	"product-database-api/testutils"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestModels(t *testing.T) {
	db := testutils.SetupTestDB(t)
	defer testutils.CleanupTestDB(t, db)

	t.Run("NodeCreation", func(t *testing.T) {
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")

		testutils.AssertNotEmpty(t, vendor.ID, "Vendor ID should not be empty")
		testutils.AssertEqual(t, "Test Vendor", vendor.Name, "Vendor name should match")
		testutils.AssertEqual(t, "A test vendor", vendor.Description, "Vendor description should match")
		testutils.AssertEqual(t, testutils.Vendor, vendor.Category, "Vendor category should be correct")
	})

	t.Run("NodeHierarchy", func(t *testing.T) {
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)

		testutils.AssertEqual(t, vendor.ID, *product.ParentID, "Product should have correct parent ID")
		testutils.AssertEqual(t, testutils.ProductFamily, product.Category, "Product category should be correct")
		testutils.AssertEqual(t, testutils.Software, product.ProductType, "Product type should be correct")

		// Load with children
		var loadedVendor testutils.Node
		result := db.Preload("Children").First(&loadedVendor, "id = ?", vendor.ID)
		testutils.AssertNoError(t, result.Error, "Should load vendor with children")
		testutils.AssertCount(t, 1, len(loadedVendor.Children), "Vendor should have one child")
		testutils.AssertEqual(t, product.ID, loadedVendor.Children[0].ID, "Child should be the created product")
	})

	t.Run("RelationshipCreation", func(t *testing.T) {
		vendor1 := testutils.CreateTestVendor(t, db, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, db, "Vendor 2", "Second vendor")
		product1 := testutils.CreateTestProduct(t, db, "Product 1", "First product", vendor1.ID, testutils.Software)
		product2 := testutils.CreateTestProduct(t, db, "Product 2", "Second product", vendor2.ID, testutils.Software)

		relationship := testutils.CreateTestRelationship(t, db, product1.ID, product2.ID, testutils.DefaultComponentOf)

		testutils.AssertNotEmpty(t, relationship.ID, "Relationship ID should not be empty")
		testutils.AssertEqual(t, product1.ID, relationship.SourceNodeID, "Relationship source should be correct")
		testutils.AssertEqual(t, product2.ID, relationship.TargetNodeID, "Relationship target should be correct")
		testutils.AssertEqual(t, testutils.DefaultComponentOf, relationship.Category, "Relationship category should be correct")
	})

	t.Run("IdentificationHelperCreation", func(t *testing.T) {
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		metadata := []byte(`{"cpe": "cpe:2.3:a:test:vendor:*:*:*:*:*:*:*:*"}`)

		helper := testutils.CreateTestIdentificationHelper(t, db, vendor.ID, "cpe", metadata)

		testutils.AssertNotEmpty(t, helper.ID, "Helper ID should not be empty")
		testutils.AssertEqual(t, vendor.ID, helper.NodeID, "Helper should reference correct node")
		testutils.AssertEqual(t, string(metadata), string(helper.Metadata), "Helper metadata should match")
	})

	t.Run("ProductVersionWithReleaseDate", func(t *testing.T) {
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)

		releaseDate := time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)
		version := testutils.CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, &releaseDate)

		testutils.AssertNotEmpty(t, version.ID, "Version ID should not be empty")
		testutils.AssertEqual(t, product.ID, *version.ParentID, "Version should have correct parent")
		testutils.AssertEqual(t, testutils.ProductVersion, version.Category, "Version category should be correct")
		testutils.AssertEqual(t, true, version.ReleasedAt.Valid, "Release date should be valid")
		testutils.AssertEqual(t, releaseDate, version.ReleasedAt.Time, "Release date should match")
	})

	t.Run("NodeCategories", func(t *testing.T) {
		// Test all node categories
		testutils.AssertEqual(t, "vendor", string(testutils.Vendor), "Vendor category string")
		testutils.AssertEqual(t, "product_family", string(testutils.ProductFamily), "ProductFamily category string")
		testutils.AssertEqual(t, "product_name", string(testutils.ProductName), "ProductName category string")
		testutils.AssertEqual(t, "product_version", string(testutils.ProductVersion), "ProductVersion category string")
	})

	t.Run("RelationshipCategories", func(t *testing.T) {
		// Test all relationship categories
		testutils.AssertEqual(t, "default_component_of", string(testutils.DefaultComponentOf), "DefaultComponentOf category string")
		testutils.AssertEqual(t, "external_component_of", string(testutils.ExternalComponentOf), "ExternalComponentOf category string")
		testutils.AssertEqual(t, "installed_on", string(testutils.InstalledOn), "InstalledOn category string")
		testutils.AssertEqual(t, "installed_with", string(testutils.InstalledWith), "InstalledWith category string")
		testutils.AssertEqual(t, "optional_component_of", string(testutils.OptionalComponentOf), "OptionalComponentOf category string")
	})

	t.Run("ProductTypes", func(t *testing.T) {
		// Test all product types
		testutils.AssertEqual(t, "software", string(testutils.Software), "Software type string")
		testutils.AssertEqual(t, "hardware", string(testutils.Hardware), "Hardware type string")
		testutils.AssertEqual(t, "firmware", string(testutils.Firmware), "Firmware type string")
	})

	t.Run("ModelsFunction", func(t *testing.T) {
		models := Models()
		testutils.AssertCount(t, 3, len(models), "Should return 3 models")
		// Check that models contain the expected types
		var hasNode, hasRelationship, hasIdentificationHelper bool
		for _, model := range models {
			switch model.(type) {
			case *Node:
				hasNode = true
			case *Relationship:
				hasRelationship = true
			case *IdentificationHelper:
				hasIdentificationHelper = true
			}
		}
		testutils.AssertEqual(t, true, hasNode, "Should include Node model")
		testutils.AssertEqual(t, true, hasRelationship, "Should include Relationship model")
		testutils.AssertEqual(t, true, hasIdentificationHelper, "Should include IdentificationHelper model")
	})

	t.Run("SuccessorRelationship", func(t *testing.T) {
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)

		version1 := testutils.CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)

		// Create version2 with version1 as successor
		version2 := testutils.Node{
			ID:          uuid.New().String(),
			Name:        "2.0.0",
			Description: "Second version",
			Category:    testutils.ProductVersion,
			ParentID:    &product.ID,
			SuccessorID: &version1.ID,
		}

		result := db.Create(&version2)
		testutils.AssertNoError(t, result.Error, "Should create version with successor")

		// Load with successor
		var loadedVersion testutils.Node
		result = db.Preload("Successor").First(&loadedVersion, "id = ?", version2.ID)
		testutils.AssertNoError(t, result.Error, "Should load version with successor")
		testutils.AssertEqual(t, version1.ID, loadedVersion.Successor.ID, "Successor should be correct")
	})
}
