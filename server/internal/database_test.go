package internal

import (
	"product-database-api/testutils"
	"testing"
)

func TestDatabaseOperations(t *testing.T) {
	db := testutils.SetupTestDB(t)
	defer testutils.CleanupTestDB(t, db)

	t.Run("DatabaseConnection", func(t *testing.T) {
		// Test basic database connection and table creation
		sqlDB, err := db.DB()
		testutils.AssertNoError(t, err, "Should get underlying SQL DB")

		err = sqlDB.Ping()
		testutils.AssertNoError(t, err, "Should be able to ping database")
	})

	t.Run("NodeCRUD", func(t *testing.T) {
		// Test Create
		var vendor Node
		vendor.ID = "test-vendor-123"
		vendor.Name = "Test Vendor"
		vendor.Description = "A test vendor for CRUD operations"
		vendor.Category = Vendor

		result := db.Create(&vendor)
		testutils.AssertNoError(t, result.Error, "Should create vendor node")
		testutils.AssertEqual(t, int64(1), result.RowsAffected, "Should affect 1 row")

		// Test Read
		var foundVendor Node
		result = db.First(&foundVendor, "id = ?", vendor.ID)
		testutils.AssertNoError(t, result.Error, "Should find vendor node")
		testutils.AssertEqual(t, vendor.ID, foundVendor.ID, "Should have correct ID")
		testutils.AssertEqual(t, vendor.Name, foundVendor.Name, "Should have correct name")
		testutils.AssertEqual(t, vendor.Category, foundVendor.Category, "Should have correct category")

		// Test Update
		foundVendor.Name = "Updated Vendor Name"
		result = db.Save(&foundVendor)
		testutils.AssertNoError(t, result.Error, "Should update vendor node")

		var updatedVendor Node
		result = db.First(&updatedVendor, "id = ?", vendor.ID)
		testutils.AssertNoError(t, result.Error, "Should find updated vendor")
		testutils.AssertEqual(t, "Updated Vendor Name", updatedVendor.Name, "Should have updated name")

		// Test Delete
		result = db.Delete(&vendor, "id = ?", vendor.ID)
		testutils.AssertNoError(t, result.Error, "Should delete vendor node")
		testutils.AssertEqual(t, int64(1), result.RowsAffected, "Should affect 1 row")

		// Verify deletion
		result = db.First(&foundVendor, "id = ?", vendor.ID)
		testutils.AssertError(t, result.Error, "Should not find deleted vendor")
	})

	t.Run("RelationshipCRUD", func(t *testing.T) {
		// Create source and target nodes
		sourceNode := testutils.CreateTestVendor(t, db, "Source Vendor", "Source vendor for relationship test")
		targetNode := testutils.CreateTestVendor(t, db, "Target Vendor", "Target vendor for relationship test")

		// Create product nodes for relationship
		sourceProduct := testutils.CreateTestProduct(t, db, "Source Product", "Source product", sourceNode.ID, testutils.Software)
		targetProduct := testutils.CreateTestProduct(t, db, "Target Product", "Target product", targetNode.ID, testutils.Software)

		// Test Create Relationship
		var relationship Relationship
		relationship.ID = "test-relationship-123"
		relationship.Category = DefaultComponentOf
		relationship.SourceNodeID = sourceProduct.ID
		relationship.TargetNodeID = targetProduct.ID

		result := db.Create(&relationship)
		testutils.AssertNoError(t, result.Error, "Should create relationship")
		testutils.AssertEqual(t, int64(1), result.RowsAffected, "Should affect 1 row")

		// Test Read Relationship
		var foundRelationship Relationship
		result = db.Preload("SourceNode").Preload("TargetNode").First(&foundRelationship, "id = ?", relationship.ID)
		testutils.AssertNoError(t, result.Error, "Should find relationship")
		testutils.AssertEqual(t, relationship.ID, foundRelationship.ID, "Should have correct ID")
		testutils.AssertEqual(t, relationship.Category, foundRelationship.Category, "Should have correct category")
		testutils.AssertEqual(t, sourceProduct.ID, foundRelationship.SourceNodeID, "Should have correct source")
		testutils.AssertEqual(t, targetProduct.ID, foundRelationship.TargetNodeID, "Should have correct target")

		// Test relationships loaded correctly
		testutils.AssertEqual(t, sourceProduct.ID, foundRelationship.SourceNode.ID, "Source node should be loaded")
		testutils.AssertEqual(t, targetProduct.ID, foundRelationship.TargetNode.ID, "Target node should be loaded")

		// Test Update Relationship
		foundRelationship.Category = OptionalComponentOf
		result = db.Save(&foundRelationship)
		testutils.AssertNoError(t, result.Error, "Should update relationship")

		var updatedRelationship Relationship
		result = db.First(&updatedRelationship, "id = ?", relationship.ID)
		testutils.AssertNoError(t, result.Error, "Should find updated relationship")
		testutils.AssertEqual(t, OptionalComponentOf, updatedRelationship.Category, "Should have updated category")

		// Test Delete Relationship
		result = db.Delete(&relationship, "id = ?", relationship.ID)
		testutils.AssertNoError(t, result.Error, "Should delete relationship")
		testutils.AssertEqual(t, int64(1), result.RowsAffected, "Should affect 1 row")

		// Verify deletion
		result = db.First(&foundRelationship, "id = ?", relationship.ID)
		testutils.AssertError(t, result.Error, "Should not find deleted relationship")
	})

	t.Run("IdentificationHelperCRUD", func(t *testing.T) {
		// Create a node for the identification helper
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)
		version := testutils.CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)

		// Test Create Identification Helper
		var helper IdentificationHelper
		helper.ID = "test-helper-123"
		helper.Category = "cpe"
		helper.Metadata = []byte(`{"cpe": "cpe:2.3:a:test:product:1.0.0:*:*:*:*:*:*:*"}`)
		helper.NodeID = version.ID

		result := db.Create(&helper)
		testutils.AssertNoError(t, result.Error, "Should create identification helper")
		testutils.AssertEqual(t, int64(1), result.RowsAffected, "Should affect 1 row")

		// Test Read Identification Helper
		var foundHelper IdentificationHelper
		result = db.Preload("Node").First(&foundHelper, "id = ?", helper.ID)
		testutils.AssertNoError(t, result.Error, "Should find identification helper")
		testutils.AssertEqual(t, helper.ID, foundHelper.ID, "Should have correct ID")
		testutils.AssertEqual(t, helper.Category, foundHelper.Category, "Should have correct category")
		testutils.AssertEqual(t, version.ID, foundHelper.NodeID, "Should have correct node ID")
		testutils.AssertEqual(t, string(helper.Metadata), string(foundHelper.Metadata), "Should have correct metadata")

		// Test node is loaded correctly
		testutils.AssertEqual(t, version.ID, foundHelper.Node.ID, "Node should be loaded")

		// Test Update Identification Helper
		foundHelper.Metadata = []byte(`{"cpe": "cpe:2.3:a:test:product:1.0.1:*:*:*:*:*:*:*"}`)
		result = db.Save(&foundHelper)
		testutils.AssertNoError(t, result.Error, "Should update identification helper")

		var updatedHelper IdentificationHelper
		result = db.First(&updatedHelper, "id = ?", helper.ID)
		testutils.AssertNoError(t, result.Error, "Should find updated helper")
		testutils.AssertEqual(t, string(foundHelper.Metadata), string(updatedHelper.Metadata), "Should have updated metadata")

		// Test Delete Identification Helper
		result = db.Delete(&helper, "id = ?", helper.ID)
		testutils.AssertNoError(t, result.Error, "Should delete identification helper")
		testutils.AssertEqual(t, int64(1), result.RowsAffected, "Should affect 1 row")

		// Verify deletion
		result = db.First(&foundHelper, "id = ?", helper.ID)
		testutils.AssertError(t, result.Error, "Should not find deleted helper")
	})

	t.Run("HierarchicalQueries", func(t *testing.T) {
		// Create a hierarchy: vendor -> product -> version
		vendor := testutils.CreateTestVendor(t, db, "Microsoft", "Microsoft Corporation")
		product := testutils.CreateTestProduct(t, db, "Windows", "Windows Operating System", vendor.ID, testutils.Software)
		version1 := testutils.CreateTestProductVersion(t, db, "10", "Windows 10", product.ID, nil)
		testutils.CreateTestProductVersion(t, db, "11", "Windows 11", product.ID, nil)

		// Test finding children
		var productWithVersions Node
		result := db.Preload("Children").First(&productWithVersions, "id = ?", product.ID)
		testutils.AssertNoError(t, result.Error, "Should find product with versions")
		testutils.AssertCount(t, 2, len(productWithVersions.Children), "Should have 2 versions")

		// Test finding parent
		var versionWithProduct Node
		result = db.Preload("Parent").First(&versionWithProduct, "id = ?", version1.ID)
		testutils.AssertNoError(t, result.Error, "Should find version with product")
		testutils.AssertEqual(t, product.ID, versionWithProduct.Parent.ID, "Should have correct parent")

		// Test finding vendor with all descendants
		var vendorWithAll Node
		result = db.Preload("Children.Children").First(&vendorWithAll, "id = ?", vendor.ID)
		testutils.AssertNoError(t, result.Error, "Should find vendor with all descendants")
		testutils.AssertCount(t, 1, len(vendorWithAll.Children), "Should have 1 product")
		testutils.AssertCount(t, 2, len(vendorWithAll.Children[0].Children), "Product should have 2 versions")
	})

	t.Run("ComplexQueries", func(t *testing.T) {
		// Use a fresh database for this test to avoid interference
		freshDB := testutils.SetupTestDB(t)
		defer testutils.CleanupTestDB(t, freshDB)

		// Create multiple vendors for testing complex queries
		testutils.CreateTestVendor(t, freshDB, "Apple", "Apple Inc.")
		testutils.CreateTestVendor(t, freshDB, "Google", "Google LLC")
		testutils.CreateTestVendor(t, freshDB, "Amazon", "Amazon.com Inc.")

		// Test COUNT query
		var count int64
		result := freshDB.Model(&Node{}).Where("category = ?", Vendor).Count(&count)
		testutils.AssertNoError(t, result.Error, "Should count vendors")
		testutils.AssertEqual(t, int64(3), count, "Should have 3 vendors")

		// Test LIKE query
		var appleVendors []Node
		result = freshDB.Where("category = ? AND name LIKE ?", Vendor, "%Apple%").Find(&appleVendors)
		testutils.AssertNoError(t, result.Error, "Should find vendors with Apple in name")
		testutils.AssertCount(t, 1, len(appleVendors), "Should find 1 Apple vendor")
		testutils.AssertEqual(t, "Apple", appleVendors[0].Name, "Should be Apple vendor")

		// Test ORDER BY query
		var sortedVendors []Node
		result = freshDB.Where("category = ?", Vendor).Order("name ASC").Find(&sortedVendors)
		testutils.AssertNoError(t, result.Error, "Should find sorted vendors")
		testutils.AssertCount(t, 3, len(sortedVendors), "Should find 3 vendors")
		testutils.AssertEqual(t, "Amazon", sortedVendors[0].Name, "First should be Amazon")
		testutils.AssertEqual(t, "Apple", sortedVendors[1].Name, "Second should be Apple")
		testutils.AssertEqual(t, "Google", sortedVendors[2].Name, "Third should be Google")
	})
}
