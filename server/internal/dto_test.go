package internal

import (
	"database/sql"
	"testing"
	"time"
)

func TestDTOConversions(t *testing.T) {
	t.Run("NodeToProductDTO", func(t *testing.T) {
		// Test complete conversion
		node := Node{
			ID:          "test-id",
			Name:        "Test Product",
			Description: "A test product",
			Category:    "product_name",
		}

		dto := NodeToProductDTO(node)
		if dto.ID != node.ID {
			t.Errorf("Expected ID %s, got %s", node.ID, dto.ID)
		}
		if dto.Name != node.Name {
			t.Errorf("Expected Name %s, got %s", node.Name, dto.Name)
		}
		if dto.Description != node.Description {
			t.Errorf("Expected Description %s, got %s", node.Description, dto.Description)
		}

		// Test nil node handling
		nilDto := NodeToProductDTO(Node{})
		if nilDto.ID != "" {
			t.Error("Expected empty ID for empty node")
		}
	})

	t.Run("NodeToProductVersionDTO", func(t *testing.T) {
		// Test with release date
		releaseTime := time.Date(2023, 12, 1, 0, 0, 0, 0, time.UTC)
		node := Node{
			ID:          "test-version-id",
			Name:        "1.0.0",
			Description: "First version",
			Category:    "product_version",
			ReleasedAt:  sql.NullTime{Time: releaseTime, Valid: true},
		}

		dto := NodeToProductVersionDTO(node)
		if dto.ID != node.ID {
			t.Errorf("Expected ID %s, got %s", node.ID, dto.ID)
		}
		if dto.Name != node.Name {
			t.Errorf("Expected Name %s, got %s", node.Name, dto.Name)
		}
		if dto.ReleasedAt == nil {
			t.Error("Expected ReleasedAt to be set")
		}
	})

	t.Run("RelationshipToDTO", func(t *testing.T) {
		// Create test nodes
		sourceNode := &Node{
			ID:       "source-id",
			Name:     "Source Product",
			Category: "product_version",
		}
		targetNode := &Node{
			ID:       "target-id",
			Name:     "Target Product",
			Category: "product_version",
		}

		// Create relationship
		relationship := Relationship{
			ID:         "rel-id",
			Category:   "successor",
			SourceNode: sourceNode,
			TargetNode: targetNode,
		}

		dto := RelationshipToDTO(relationship)
		if dto.ID != relationship.ID {
			t.Errorf("Expected ID %s, got %s", relationship.ID, dto.ID)
		}
		if dto.Category != string(relationship.Category) {
			t.Errorf("Expected Category %s, got %s", relationship.Category, dto.Category)
		}
		if dto.Source.ID != sourceNode.ID {
			t.Errorf("Expected Source ID %s, got %s", sourceNode.ID, dto.Source.ID)
		}
		if dto.Target.ID != targetNode.ID {
			t.Errorf("Expected Target ID %s, got %s", targetNode.ID, dto.Target.ID)
		}
	})

	t.Run("IdentificationHelperToDTO", func(t *testing.T) {
		metadata := []byte(`{"cpe": "cpe:2.3:a:test:product:1.0.0:*:*:*:*:*:*:*"}`)
		helper := IdentificationHelper{
			ID:       "helper-id",
			NodeID:   "node-id",
			Category: "cpe",
			Metadata: metadata,
		}

		dto := IdentificationHelperToDTO(helper)
		if dto.ID != helper.ID {
			t.Errorf("Expected ID %s, got %s", helper.ID, dto.ID)
		}
		if dto.ProductVersionID != helper.NodeID {
			t.Errorf("Expected ProductVersionID %s, got %s", helper.NodeID, dto.ProductVersionID)
		}
		if dto.Category != string(helper.Category) {
			t.Errorf("Expected Category %s, got %s", string(helper.Category), dto.Category)
		}
		if dto.Metadata != string(metadata) {
			t.Errorf("Expected Metadata %s, got %s", string(metadata), dto.Metadata)
		}
	})
}
