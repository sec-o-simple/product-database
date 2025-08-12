package internal

import (
	"context"
	"product-database-api/testutils"
	"testing"

	"github.com/google/uuid"
)

func TestRepository(t *testing.T) {
	db := testutils.SetupTestDB(t)
	defer testutils.CleanupTestDB(t, db)

	repo := NewRepository(db)
	ctx := context.Background()

	t.Run("CreateNode", func(t *testing.T) {
		node := Node{
			ID:          uuid.New().String(),
			Name:        "Test Vendor",
			Description: "A test vendor",
			Category:    Vendor,
		}

		createdNode, err := repo.CreateNode(ctx, node)
		testutils.AssertNoError(t, err, "Should create node successfully")
		testutils.AssertEqual(t, node.ID, createdNode.ID, "Created node should have correct ID")
		testutils.AssertEqual(t, node.Name, createdNode.Name, "Created node should have correct name")
		testutils.AssertEqual(t, node.Description, createdNode.Description, "Created node should have correct description")
		testutils.AssertEqual(t, node.Category, createdNode.Category, "Created node should have correct category")
	})

	t.Run("GetNodeByID", func(t *testing.T) {
		// Create a test vendor
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")

		// Get node by ID
		foundNode, err := repo.GetNodeByID(ctx, vendor.ID)
		testutils.AssertNoError(t, err, "Should find node by ID")
		testutils.AssertEqual(t, vendor.ID, foundNode.ID, "Found node should have correct ID")
		testutils.AssertEqual(t, vendor.Name, foundNode.Name, "Found node should have correct name")
	})

	t.Run("GetNodeByIDWithChildren", func(t *testing.T) {
		// Create vendor and product
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)

		// Get vendor with children
		foundNode, err := repo.GetNodeByID(ctx, vendor.ID, WithChildren())
		testutils.AssertNoError(t, err, "Should find node with children")
		testutils.AssertCount(t, 1, len(foundNode.Children), "Should have one child")
		testutils.AssertEqual(t, product.ID, foundNode.Children[0].ID, "Child should be the created product")
	})

	t.Run("GetNodeByIDWithRelationships", func(t *testing.T) {
		// Create nodes and relationship
		vendor1 := testutils.CreateTestVendor(t, db, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, db, "Vendor 2", "Second vendor")
		product1 := testutils.CreateTestProduct(t, db, "Product 1", "First product", vendor1.ID, testutils.Software)
		product2 := testutils.CreateTestProduct(t, db, "Product 2", "Second product", vendor2.ID, testutils.Software)

		testutils.CreateTestRelationship(t, db, product1.ID, product2.ID, testutils.DefaultComponentOf)

		// Get node with relationships
		foundNode, err := repo.GetNodeByID(ctx, product1.ID, WithRelationships())
		testutils.AssertNoError(t, err, "Should find node with relationships")
		testutils.AssertCount(t, 1, len(foundNode.SourceRelationships), "Should have one source relationship")
		testutils.AssertEqual(t, product2.ID, foundNode.SourceRelationships[0].TargetNodeID, "Relationship target should be correct")
	})

	t.Run("GetNodeByIDWithParent", func(t *testing.T) {
		// Create vendor and product
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)

		// Get product with parent
		foundNode, err := repo.GetNodeByID(ctx, product.ID, WithParent())
		testutils.AssertNoError(t, err, "Should find node with parent")
		testutils.AssertEqual(t, vendor.ID, foundNode.Parent.ID, "Parent should be the created vendor")
	})

	t.Run("GetNodeByIDNotFound", func(t *testing.T) {
		nonExistentID := uuid.New().String()
		_, err := repo.GetNodeByID(ctx, nonExistentID)
		testutils.AssertError(t, err, "Should return error for non-existent node")
	})

	t.Run("UpdateNode", func(t *testing.T) {
		// Create a test node
		vendor := testutils.CreateTestVendor(t, db, "Original Name", "Original description")

		// Update the node
		vendor.Name = "Updated Name"
		vendor.Description = "Updated description"

		err := repo.UpdateNode(ctx, Node{
			ID:          vendor.ID,
			Name:        vendor.Name,
			Description: vendor.Description,
			Category:    Vendor,
		})
		testutils.AssertNoError(t, err, "Should update node successfully")

		// Get the updated node to verify changes
		updatedNode, err := repo.GetNodeByID(ctx, vendor.ID)
		testutils.AssertNoError(t, err, "Should get updated node")
		testutils.AssertEqual(t, "Updated Name", updatedNode.Name, "Updated node should have new name")
		testutils.AssertEqual(t, "Updated description", updatedNode.Description, "Updated node should have new description")
	})

	t.Run("DeleteNode", func(t *testing.T) {
		// Create a test node
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")

		// Delete the node
		err := repo.DeleteNode(ctx, vendor.ID)
		testutils.AssertNoError(t, err, "Should delete node successfully")

		// Verify it's deleted
		_, err = repo.GetNodeByID(ctx, vendor.ID)
		testutils.AssertError(t, err, "Should not find deleted node")
	})

	t.Run("GetNodesByCategory", func(t *testing.T) {
		// Use a fresh database for this test
		freshDB := testutils.SetupTestDB(t)
		defer testutils.CleanupTestDB(t, freshDB)
		freshRepo := NewRepository(freshDB)

		// Create multiple vendors
		vendor1 := testutils.CreateTestVendor(t, freshDB, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, freshDB, "Vendor 2", "Second vendor")

		// Create a product (different category)
		testutils.CreateTestProduct(t, freshDB, "Product 1", "A product", vendor1.ID, testutils.Software)

		// Get all vendors
		vendors, err := freshRepo.GetNodesByCategory(ctx, Vendor)
		testutils.AssertNoError(t, err, "Should get nodes by category")
		testutils.AssertCount(t, 2, len(vendors), "Should return 2 vendors")

		// Verify the vendors are the ones we created
		vendorIDs := make(map[string]bool)
		for _, vendor := range vendors {
			vendorIDs[vendor.ID] = true
		}
		testutils.AssertEqual(t, true, vendorIDs[vendor1.ID], "Should include first vendor")
		testutils.AssertEqual(t, true, vendorIDs[vendor2.ID], "Should include second vendor")
	})

	t.Run("GetRelationshipsBySourceAndCategory", func(t *testing.T) {
		// Create nodes
		vendor1 := testutils.CreateTestVendor(t, db, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, db, "Vendor 2", "Second vendor")
		vendor3 := testutils.CreateTestVendor(t, db, "Vendor 3", "Third vendor")
		product1 := testutils.CreateTestProduct(t, db, "Product 1", "First product", vendor1.ID, testutils.Software)
		product2 := testutils.CreateTestProduct(t, db, "Product 2", "Second product", vendor2.ID, testutils.Software)
		product3 := testutils.CreateTestProduct(t, db, "Product 3", "Third product", vendor3.ID, testutils.Software)

		// Create relationships from product1 to product2 and product3
		rel1 := testutils.CreateTestRelationship(t, db, product1.ID, product2.ID, testutils.DefaultComponentOf)
		testutils.CreateTestRelationship(t, db, product1.ID, product3.ID, testutils.OptionalComponentOf)

		// Get relationships by source node ID and category
		relationships, err := repo.GetRelationshipsBySourceAndCategory(ctx, product1.ID, string(DefaultComponentOf))
		testutils.AssertNoError(t, err, "Should get relationships by source node ID and category")
		testutils.AssertCount(t, 1, len(relationships), "Should return 1 relationship")
		testutils.AssertEqual(t, rel1.ID, relationships[0].ID, "Should return the correct relationship")
	})

	t.Run("CreateRelationship", func(t *testing.T) {
		// Create nodes
		vendor1 := testutils.CreateTestVendor(t, db, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, db, "Vendor 2", "Second vendor")
		product1 := testutils.CreateTestProduct(t, db, "Product 1", "First product", vendor1.ID, testutils.Software)
		product2 := testutils.CreateTestProduct(t, db, "Product 2", "Second product", vendor2.ID, testutils.Software)

		// Create relationship
		relationship := Relationship{
			ID:           uuid.New().String(),
			Category:     DefaultComponentOf,
			SourceNodeID: product1.ID,
			TargetNodeID: product2.ID,
		}

		createdRelationship, err := repo.CreateRelationship(ctx, relationship)
		testutils.AssertNoError(t, err, "Should create relationship successfully")
		testutils.AssertEqual(t, relationship.ID, createdRelationship.ID, "Created relationship should have correct ID")
		testutils.AssertEqual(t, relationship.Category, createdRelationship.Category, "Created relationship should have correct category")
		testutils.AssertEqual(t, relationship.SourceNodeID, createdRelationship.SourceNodeID, "Created relationship should have correct source")
		testutils.AssertEqual(t, relationship.TargetNodeID, createdRelationship.TargetNodeID, "Created relationship should have correct target")
	})

	t.Run("GetRelationshipByID", func(t *testing.T) {
		// Create nodes and relationship
		vendor1 := testutils.CreateTestVendor(t, db, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, db, "Vendor 2", "Second vendor")
		product1 := testutils.CreateTestProduct(t, db, "Product 1", "First product", vendor1.ID, testutils.Software)
		product2 := testutils.CreateTestProduct(t, db, "Product 2", "Second product", vendor2.ID, testutils.Software)

		relationship := testutils.CreateTestRelationship(t, db, product1.ID, product2.ID, testutils.DefaultComponentOf)

		// Get relationship by ID
		foundRelationship, err := repo.GetRelationshipByID(ctx, relationship.ID)
		testutils.AssertNoError(t, err, "Should find relationship by ID")
		testutils.AssertEqual(t, relationship.ID, foundRelationship.ID, "Found relationship should have correct ID")
		testutils.AssertEqual(t, product1.ID, foundRelationship.SourceNodeID, "Found relationship should have correct source")
		testutils.AssertEqual(t, product2.ID, foundRelationship.TargetNodeID, "Found relationship should have correct target")
	})

	t.Run("DeleteRelationship", func(t *testing.T) {
		// Create nodes and relationship
		vendor1 := testutils.CreateTestVendor(t, db, "Vendor 1", "First vendor")
		vendor2 := testutils.CreateTestVendor(t, db, "Vendor 2", "Second vendor")
		product1 := testutils.CreateTestProduct(t, db, "Product 1", "First product", vendor1.ID, testutils.Software)
		product2 := testutils.CreateTestProduct(t, db, "Product 2", "Second product", vendor2.ID, testutils.Software)

		relationship := testutils.CreateTestRelationship(t, db, product1.ID, product2.ID, testutils.DefaultComponentOf)

		// Delete the relationship
		err := repo.DeleteRelationship(ctx, relationship.ID)
		testutils.AssertNoError(t, err, "Should delete relationship successfully")

		// Verify it's deleted
		_, err = repo.GetRelationshipByID(ctx, relationship.ID)
		testutils.AssertError(t, err, "Should not find deleted relationship")
	})

	t.Run("GetIdentificationHelpersByProductVersion", func(t *testing.T) {
		// Create a test node
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)
		version := testutils.CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)

		// Create multiple identification helpers
		metadata1 := []byte(`{"cpe": "cpe:2.3:a:test:vendor:*:*:*:*:*:*:*:*"}`)
		metadata2 := []byte(`{"purl": "pkg:generic/test-vendor"}`)

		helper1 := testutils.CreateTestIdentificationHelper(t, db, version.ID, "cpe", metadata1)
		helper2 := testutils.CreateTestIdentificationHelper(t, db, version.ID, "purl", metadata2)

		// Get helpers by product version ID
		helpers, err := repo.GetIdentificationHelpersByProductVersion(ctx, version.ID)
		testutils.AssertNoError(t, err, "Should get identification helpers by product version ID")
		testutils.AssertCount(t, 2, len(helpers), "Should return 2 helpers")

		// Verify the helpers are the ones we created
		helperIDs := make(map[string]bool)
		for _, helper := range helpers {
			helperIDs[helper.ID] = true
		}
		testutils.AssertEqual(t, true, helperIDs[helper1.ID], "Should include first helper")
		testutils.AssertEqual(t, true, helperIDs[helper2.ID], "Should include second helper")
	})

	t.Run("CreateIdentificationHelper", func(t *testing.T) {
		// Create a test node
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		metadata := []byte(`{"cpe": "cpe:2.3:a:test:vendor:*:*:*:*:*:*:*:*"}`)

		// Create identification helper
		helper := IdentificationHelper{
			ID:       uuid.New().String(),
			Category: "cpe",
			Metadata: metadata,
			NodeID:   vendor.ID,
		}

		createdHelper, err := repo.CreateIdentificationHelper(ctx, helper)
		testutils.AssertNoError(t, err, "Should create identification helper successfully")
		testutils.AssertEqual(t, helper.ID, createdHelper.ID, "Created helper should have correct ID")
		testutils.AssertEqual(t, helper.Category, createdHelper.Category, "Created helper should have correct category")
		testutils.AssertEqual(t, helper.NodeID, createdHelper.NodeID, "Created helper should have correct node ID")
		testutils.AssertEqual(t, string(metadata), string(createdHelper.Metadata), "Created helper should have correct metadata")
	})

	t.Run("DeleteIdentificationHelper", func(t *testing.T) {
		// Create a test node and helper
		vendor := testutils.CreateTestVendor(t, db, "Test Vendor", "A test vendor")
		product := testutils.CreateTestProduct(t, db, "Test Product", "A test product", vendor.ID, testutils.Software)
		version := testutils.CreateTestProductVersion(t, db, "1.0.0", "First version", product.ID, nil)
		metadata := []byte(`{"cpe": "cpe:2.3:a:test:vendor:*:*:*:*:*:*:*:*"}`)
		helper := testutils.CreateTestIdentificationHelper(t, db, version.ID, "cpe", metadata)

		// Delete the helper
		err := repo.DeleteIdentificationHelper(ctx, helper.ID)
		testutils.AssertNoError(t, err, "Should delete identification helper successfully")

		// Verify it's deleted by checking product version helpers
		helpers, err := repo.GetIdentificationHelpersByProductVersion(ctx, version.ID)
		testutils.AssertNoError(t, err, "Should get helpers even if empty")
		testutils.AssertCount(t, 0, len(helpers), "Should have no helpers after deletion")
	})
}
