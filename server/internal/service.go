package internal

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/go-fuego/fuego"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	repo *repository
}

func NewService(repository *repository) *Service {
	return &Service{repo: repository}
}

// Vendor

func (s *Service) CreateVendor(ctx context.Context, vendor CreateVendorDTO) (VendorDTO, error) {
	node := Node{
		ID:          uuid.New().String(),
		Name:        vendor.Name,
		Description: vendor.Description,
		Category:    Vendor,
	}

	createdNode, err := s.repo.CreateNode(ctx, node)

	if err != nil {
		return VendorDTO{}, fuego.InternalServerError{
			Title: "Failed to create vendor",
			Err:   err,
		}
	}

	return VendorDTO{
		ID:           createdNode.ID,
		Name:         createdNode.Name,
		Description:  createdNode.Description,
		ProductCount: 0,
	}, nil
}

func (s *Service) ListVendors(ctx context.Context) ([]VendorDTO, error) {
	nodes, err := s.repo.GetNodesByCategory(ctx, Vendor)
	if err != nil {
		return nil, err
	}

	vendors := make([]VendorDTO, len(nodes))
	for i, node := range nodes {
		vendors[i] = VendorDTO{
			ID:           node.ID,
			Name:         node.Name,
			Description:  node.Description,
			ProductCount: len(node.Children),
		}
	}

	return vendors, nil
}

func (s *Service) GetVendorByID(ctx context.Context, id string) (VendorDTO, error) {
	vendor, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Vendor not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return VendorDTO{}, notFoundError
		} else {
			return VendorDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch vendor",
				Err:   err,
			}
		}
	}

	if vendor.Category != Vendor {
		return VendorDTO{}, notFoundError
	}

	products := make([]ProductDTO, len(vendor.Children))
	for i, product := range vendor.Children {
		products[i] = NodeToProductDTO(product)
	}

	return VendorDTO{
		ID:          vendor.ID,
		Name:        vendor.Name,
		Description: vendor.Description,
	}, nil
}

func (s *Service) UpdateVendor(ctx context.Context, id string, update UpdateVendorDTO) (VendorDTO, error) {
	vendor, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Vendor not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return VendorDTO{}, notFoundError
		} else {
			return VendorDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch vendor",
				Err:   err,
			}
		}
	}

	if vendor.Category != Vendor {
		return VendorDTO{}, notFoundError
	}

	// Update only non-null fields
	if update.Name != nil {
		vendor.Name = *update.Name
	}
	if update.Description != nil {
		vendor.Description = *update.Description
	}

	// Save the updated vendor
	if err := s.repo.UpdateNode(ctx, vendor); err != nil {
		return VendorDTO{}, fuego.InternalServerError{
			Title: "Failed to update vendor",
			Err:   err,
		}
	}

	return VendorDTO{
		ID:          vendor.ID,
		Name:        vendor.Name,
		Description: vendor.Description,
	}, nil
}

func (s *Service) DeleteVendor(ctx context.Context, id string) error {
	vendor, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Vendor not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return notFoundError
		} else {
			return fuego.InternalServerError{
				Title: "Failed to fetch vendor",
				Err:   err,
			}
		}
	}

	if vendor.Category != Vendor {
		return notFoundError
	}

	if err := s.repo.DeleteNode(ctx, vendor.ID); err != nil {
		return fuego.InternalServerError{
			Title: "Failed to delete vendor",
			Err:   err,
		}
	}

	return nil
}

// Products

func (s *Service) ExportCSAFProductTree(ctx context.Context, productIDs []string) (map[string]interface{}, error) {
	vendorMap := make(map[string]map[string]interface{})

	for _, id := range productIDs {
		p, err := s.GetProductByID(ctx, id)
		if err != nil {
			return nil, err
		}

		if p.VendorID == nil {
			return nil, fuego.NotFoundError{
				Title: "Vendor not found",
				Err:   nil,
			}
		}

		v, err := s.GetVendorByID(ctx, *p.VendorID)
		if err != nil {
			return nil, err
		}

		vers, err := s.ListProductVersions(ctx, p.ID)
		if err != nil {
			return nil, err
		}

		var versionNodes []interface{}
		for _, ver := range vers {
			helpers, err := s.GetIdentificationHelpersByProductVersion(ctx, ver.ID)
			if err != nil {
				return nil, err
			}
			var rawHelpers []json.RawMessage
			for _, helper := range helpers {
				rawHelpers = append(rawHelpers, json.RawMessage(helper.Metadata))
			}

			prodMap := map[string]interface{}{
				"name":       v.Name + " " + p.Name + " " + ver.Name,
				"product_id": ver.ID,
			}
			if len(rawHelpers) > 0 {
				prodMap["product_identification_helper"] = rawHelpers
			}

			versionNodes = append(versionNodes, map[string]interface{}{
				"category": "product_version",
				"name":     ver.Name,
				"product":  prodMap,
			})
		}

		productNode := map[string]interface{}{
			"category": "product_name",
			"name":     p.Name,
			"product": map[string]interface{}{
				"name":       v.Name + " " + p.Name,
				"product_id": p.ID,
			},
		}
		if len(versionNodes) > 0 {
			productNode["branches"] = versionNodes
		}

		if vn, exists := vendorMap[v.Name]; exists {
			vn["branches"] = append(vn["branches"].([]interface{}), productNode)
		} else {
			vendorMap[v.Name] = map[string]interface{}{
				"category": "vendor",
				"name":     v.Name,
				"branches": []interface{}{productNode},
			}
		}
	}

	var vendorNodes []interface{}
	for _, vn := range vendorMap {
		vendorNodes = append(vendorNodes, vn)
	}

	return map[string]interface{}{
		"product_tree": map[string]interface{}{
			"branches": vendorNodes,
		},
	}, nil
}

func (s *Service) CreateProduct(ctx context.Context, product CreateProductDTO) (ProductDTO, error) {
	vendorNode, err := s.repo.GetNodeByID(ctx, product.VendorID)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ProductDTO{}, fuego.BadRequestError{
				Title: "Invalid vendor node ID",
			}
		} else {
			return ProductDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch vendor node",
				Err:   err,
			}
		}
	}

	if vendorNode.Category != Vendor {
		return ProductDTO{}, fuego.BadRequestError{
			Title: "Invalid vendor node ID",
		}
	}

	node := Node{
		ID:          uuid.New().String(),
		Name:        product.Name,
		Description: product.Description,
		Category:    ProductName,
		ParentID:    &vendorNode.ID,
		ProductType: ProductType(product.Type),
	}

	createdNode, err := s.repo.CreateNode(ctx, node)

	if err != nil {
		return ProductDTO{}, fuego.InternalServerError{
			Title: "Failed to create product",
			Err:   err,
		}
	}

	return ProductDTO{
		ID:          createdNode.ID,
		VendorID:    createdNode.ParentID,
		Name:        createdNode.Name,
		Description: createdNode.Description,
	}, nil
}

func (s *Service) UpdateProduct(ctx context.Context, id string, update UpdateProductDTO) (ProductDTO, error) {
	product, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Product not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ProductDTO{}, notFoundError
		} else {
			return ProductDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch product",
				Err:   err,
			}
		}
	}

	if product.Category != ProductName {
		return ProductDTO{}, notFoundError
	}

	if update.Name != nil {
		product.Name = *update.Name
	}
	if update.Description != nil {
		product.Description = *update.Description
	}
	if update.Type != nil {
		product.ProductType = ProductType(*update.Type)
	}

	if err := s.repo.UpdateNode(ctx, product); err != nil {
		return ProductDTO{}, fuego.InternalServerError{
			Title: "Failed to update product",
			Err:   err,
		}
	}

	return ProductDTO{
		ID:          product.ID,
		VendorID:    product.ParentID,
		Name:        product.Name,
		Description: product.Description,
	}, nil
}

func (s *Service) DeleteProduct(ctx context.Context, id string) error {
	product, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Product not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return notFoundError
		} else {
			return fuego.InternalServerError{
				Title: "Failed to fetch product",
				Err:   err,
			}
		}
	}

	if product.Category != ProductName {
		return notFoundError
	}

	if err := s.repo.DeleteNode(ctx, product.ID); err != nil {
		return fuego.InternalServerError{
			Title: "Failed to delete product",
			Err:   err,
		}
	}

	return nil
}

func (s *Service) ListProducts(ctx context.Context) ([]ProductDTO, error) {
	nodes, err := s.repo.GetNodesByCategory(ctx, ProductName, WithParent())
	if err != nil {
		return nil, err
	}

	println(nodes[0].Parent)

	products := make([]ProductDTO, len(nodes))
	for i, node := range nodes {
		products[i] = NodeToProductDTO(node)
	}

	return products, nil
}

func (s *Service) ListVendorProducts(ctx context.Context, vendorID string) ([]ProductDTO, error) {
	vendor, err := s.repo.GetNodeByID(ctx, vendorID, WithChildren())
	notFoundError := fuego.NotFoundError{
		Title: "Vendor not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, notFoundError
		} else {
			return nil, fuego.InternalServerError{
				Title: "Failed to fetch vendor",
				Err:   err,
			}
		}
	}

	if vendor.Category != Vendor {
		return nil, notFoundError
	}

	products := make([]ProductDTO, len(vendor.Children))
	for i, product := range vendor.Children {
		products[i] = ProductDTO{
			ID:          product.ID,
			VendorID:    product.ParentID,
			Name:        product.Name,
			Description: product.Description,
		}
	}
	return products, nil
}

func (s *Service) GetProductByID(ctx context.Context, id string) (ProductDTO, error) {
	product, err := s.repo.GetNodeByID(ctx, id, WithParent())
	notFoundError := fuego.NotFoundError{
		Title: "Product not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ProductDTO{}, notFoundError
		} else {
			return ProductDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch product",
				Err:   err,
			}
		}
	}

	if product.Category != ProductName {
		return ProductDTO{}, notFoundError
	}

	return NodeToProductDTO(product), nil
}

// Product Versions

func (s *Service) CreateProductVersion(ctx context.Context, version CreateProductVersionDTO) (ProductVersionDTO, error) {
	productNode, err := s.repo.GetNodeByID(ctx, version.ProductID)

	if err != nil || productNode.Category != ProductName {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product node ID",
			Err:   err,
			Errors: []fuego.ErrorItem{
				{
					Name:   "CreateProductVersionDTO.ProductID",
					Reason: "Product ID must be a valid product ID",
				},
			},
		}
	}

	// Parse the release date string into time.Time
	var releasedAt sql.NullTime
	if version.ReleaseDate != nil {
		parsedTime, err := time.Parse("2006-01-02", *version.ReleaseDate)
		if err != nil {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid release date format",
				Err:   err,
				Errors: []fuego.ErrorItem{
					{
						Name:   "CreateProductVersionDTO.ReleaseDate",
						Reason: "Release date must be in YYYY-MM-DD format",
					},
				},
			}
		}
		releasedAt = sql.NullTime{
			Time:  parsedTime,
			Valid: true,
		}
	}

	node := Node{
		ID:         uuid.New().String(),
		Name:       version.Version,
		Category:   ProductVersion,
		ParentID:   &productNode.ID,
		ReleasedAt: releasedAt,
	}

	createdNode, err := s.repo.CreateNode(ctx, node)

	if err != nil {
		return ProductVersionDTO{}, fuego.InternalServerError{
			Title: "Failed to create product version",
			Err:   err,
		}
	}

	return ProductVersionDTO{
		ID:          createdNode.ID,
		ProductID:   createdNode.ParentID,
		Name:        createdNode.Name,
		Description: createdNode.Description,
	}, nil
}

func (s *Service) UpdateProductVersion(ctx context.Context, id string, update UpdateProductVersionDTO) (ProductVersionDTO, error) {
	version, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Product version not found",
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ProductVersionDTO{}, notFoundError
		} else {
			return ProductVersionDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch product version",
				Err:   err,
			}
		}
	}

	if version.Category != ProductVersion {
		return ProductVersionDTO{}, notFoundError
	}

	if update.Version != nil {
		version.Name = *update.Version
	}

	if update.PredecessorID != nil {
		predecessor, err := s.repo.GetNodeByID(ctx, *update.PredecessorID)
		if err != nil || predecessor.Category != ProductVersion {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid predecessor ID",
				Err:   err,
				Errors: []fuego.ErrorItem{
					{
						Name:   "UpdateProductVersionDTO.PredecessorID",
						Reason: "Predecessor ID must be a valid product version ID",
					},
				},
			}
		}
		version.SuccessorID = &predecessor.ID
	}

	if update.ProductID != nil {
		product, err := s.repo.GetNodeByID(ctx, *update.ProductID)
		if err != nil || product.Category != ProductName {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid product ID",
				Err:   err,
				Errors: []fuego.ErrorItem{
					{
						Name:   "UpdateProductVersionDTO.ProductID",
						Reason: "Product ID must be a valid product ID",
					},
				},
			}
		}
		version.ParentID = &product.ID
	}

	if update.ReleaseDate != nil {
		parsedTime, err := time.Parse("2006-01-02", *update.ReleaseDate)
		if err != nil {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid release date format",
				Err:   err,
				Errors: []fuego.ErrorItem{
					{
						Name:   "UpdateProductVersionDTO.ReleaseDate",
						Reason: "Release date must be in YYYY-MM-DD format",
					},
				},
			}
		}
		version.ReleasedAt = sql.NullTime{
			Time:  parsedTime,
			Valid: true,
		}
	}

	if err := s.repo.UpdateNode(ctx, version); err != nil {
		return ProductVersionDTO{}, fuego.InternalServerError{
			Title: "Failed to update product version",
			Err:   err,
		}
	}

	return ProductVersionDTO{
		ID:          version.ID,
		ProductID:   version.ParentID,
		Name:        version.Name,
		Description: version.Description,
	}, nil
}

func (s *Service) DeleteProductVersion(ctx context.Context, id string) error {
	version, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Product version not found",
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return notFoundError
		} else {
			return fuego.InternalServerError{
				Title: "Failed to fetch product version",
				Err:   err,
			}
		}
	}

	if version.Category != ProductVersion {
		return notFoundError
	}

	if err := s.repo.DeleteNode(ctx, version.ID); err != nil {
		return fuego.InternalServerError{
			Title: "Failed to delete product version",
			Err:   err,
		}
	}

	return nil
}

func (s *Service) ListProductVersions(ctx context.Context, productID string) ([]ProductVersionDTO, error) {
	product, err := s.repo.GetNodeByID(ctx, productID, WithChildren())
	notFoundError := fuego.NotFoundError{
		Title: "Product not found",
		Err:   nil,
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, notFoundError
		} else {
			return nil, fuego.InternalServerError{
				Title: "Failed to fetch product",
				Err:   err,
			}
		}
	}

	if product.Category != ProductName {
		return nil, notFoundError
	}

	versions := make([]ProductVersionDTO, len(product.Children))
	for i, version := range product.Children {
		if version.Category != ProductVersion {
			continue
		}
		versions[i] = ProductVersionDTO{
			ID:          version.ID,
			ProductID:   version.ParentID,
			Name:        version.Name,
			Description: version.Description,
		}
	}

	return versions, nil
}

func (s *Service) GetProductVersionByID(ctx context.Context, id string) (ProductVersionDTO, error) {
	version, err := s.repo.GetNodeByID(ctx, id)
	notFoundError := fuego.NotFoundError{
		Title: "Product version not found",
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ProductVersionDTO{}, notFoundError
		} else {
			return ProductVersionDTO{}, fuego.InternalServerError{
				Title: "Failed to fetch product version",
				Err:   err,
			}
		}
	}

	if version.Category != ProductVersion {
		return ProductVersionDTO{}, notFoundError
	}

	product, err := s.repo.GetNodeByID(ctx, *version.ParentID)

	if err != nil || product.Category != ProductName {
		return ProductVersionDTO{}, fuego.InternalServerError{
			Title: "Invalid product ID for version",
		}
	}

	return NodeToProductVersionDTO(version), nil
}

// Relationships

func (s *Service) GetRelationshipsByProductVersion(ctx context.Context, versionID string) ([]RelationshipGroupDTO, error) {
	version, err := s.repo.GetNodeByID(ctx, versionID, WithRelationships(), WithChildren())
	notFoundError := fuego.NotFoundError{
		Title: "Product version not found",
	}

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, notFoundError
		} else {
			return nil, fuego.InternalServerError{
				Title: "Failed to fetch product version",
				Err:   err,
			}
		}
	}

	if version.Category != ProductVersion {
		return nil, notFoundError
	}

	// Group by category first, then by product within each category
	categoryGroups := make(map[string]map[string]*RelationshipGroupItemDTO)

	for _, rel := range version.SourceRelationships {
		// We need to make sure the target node and its parent exist
		if rel.TargetNode == nil || rel.TargetNode.Parent == nil {
			continue
		}

		category := string(rel.Category)
		productID := rel.TargetNode.Parent.ID

		// Initialize category map if it doesn't exist
		if categoryGroups[category] == nil {
			categoryGroups[category] = make(map[string]*RelationshipGroupItemDTO)
		}

		// Get or create the product group item
		if categoryGroups[category][productID] == nil {
			categoryGroups[category][productID] = &RelationshipGroupItemDTO{
				Product:              NodeToProductDTO(*rel.TargetNode.Parent),
				VersionRelationships: []ProductionVersionRelationshipDTO{},
			}
		}

		// Add the version relationship to the existing product group
		versionRelationship := ProductionVersionRelationshipDTO{
			RelationshipID: rel.ID,
			Version:        NodeToProductVersionDTO(*rel.TargetNode),
		}
		categoryGroups[category][productID].VersionRelationships = append(
			categoryGroups[category][productID].VersionRelationships,
			versionRelationship,
		)
	}

	// Convert the nested maps to the final result structure
	var result []RelationshipGroupDTO
	for category, productGroups := range categoryGroups {
		var products []RelationshipGroupItemDTO
		for _, productGroup := range productGroups {
			products = append(products, *productGroup)
		}

		result = append(result, RelationshipGroupDTO{
			Category: category,
			Products: products,
		})
	}

	return result, nil
}

func (s *Service) CreateRelationship(ctx context.Context, create CreateRelationshipDTO) error {
	// Validate all source nodes exist and are product versions
	sourceNodes := make([]Node, len(create.SourceNodeIDs))
	for i, sourceNodeID := range create.SourceNodeIDs {
		sourceNode, err := s.repo.GetNodeByID(ctx, sourceNodeID)
		if err != nil || sourceNode.Category != ProductVersion {
			return fuego.BadRequestError{
				Title: "Invalid source node ID - must be a product version",
				Errors: []fuego.ErrorItem{
					{
						Name:   "CreateRelationshipDTO.SourceNodeIDs",
						Reason: fmt.Sprintf("Source node ID %s must be a valid product version ID", sourceNodeID),
					},
				},
			}
		}
		sourceNodes[i] = sourceNode
	}

	// Validate all target nodes exist and are product versions
	targetNodes := make([]Node, len(create.TargetNodeIDs))
	for i, targetNodeID := range create.TargetNodeIDs {
		targetNode, err := s.repo.GetNodeByID(ctx, targetNodeID)
		if err != nil || targetNode.Category != ProductVersion {
			return fuego.BadRequestError{
				Title: "Invalid target node ID - must be a product version",
				Errors: []fuego.ErrorItem{
					{
						Name:   "CreateRelationshipDTO.TargetNodeIDs",
						Reason: fmt.Sprintf("Target node ID %s must be a valid product version ID", targetNodeID),
					},
				},
			}
		}
		targetNodes[i] = targetNode
	}

	// Create relationships for each source-target combination
	for _, sourceNode := range sourceNodes {
		for _, targetNode := range targetNodes {
			relationship := Relationship{
				ID:           uuid.New().String(),
				Category:     RelationshipCategory(create.Category),
				SourceNodeID: sourceNode.ID,
				SourceNode:   &sourceNode,
				TargetNodeID: targetNode.ID,
				TargetNode:   &targetNode,
			}

			_, err := s.repo.CreateRelationship(ctx, relationship)
			if err != nil {
				return fuego.InternalServerError{
					Title: "Failed to create relationship",
					Err:   err,
				}
			}
		}
	}

	return nil
}

func (s *Service) GetRelationshipByID(ctx context.Context, id string) (RelationshipDTO, error) {
	relationship, err := s.repo.GetRelationshipByID(ctx, id)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return RelationshipDTO{}, fuego.NotFoundError{
				Title: "Relationship not found",
			}
		}
		return RelationshipDTO{}, fuego.InternalServerError{
			Title: "Failed to fetch relationship",
			Err:   err,
		}
	}

	sourceNode := relationship.SourceNode
	targetNode := relationship.TargetNode

	if sourceNode == nil || targetNode == nil {
		return RelationshipDTO{}, fuego.InternalServerError{
			Title: "Relationship source or target node not found",
		}
	}

	return RelationshipToDTO(relationship), nil
}

func (s *Service) UpdateRelationship(ctx context.Context, update UpdateRelationshipDTO) error {
	// Validate source node exists and is a product version
	sourceNode, err := s.repo.GetNodeByID(ctx, update.SourceNodeID)
	if err != nil || sourceNode.Category != ProductVersion {
		return fuego.BadRequestError{
			Title: "Invalid source node ID",
			Errors: []fuego.ErrorItem{
				{
					Name:   "UpdateRelationshipDTO.SourceNodeID",
					Reason: "Source node ID must be a valid product version ID",
				},
			},
		}
	}

	// Validate all target nodes exist and are product versions
	targetNodes := make([]Node, len(update.TargetNodeIDs))
	for i, targetNodeID := range update.TargetNodeIDs {
		targetNode, err := s.repo.GetNodeByID(ctx, targetNodeID)
		if err != nil || targetNode.Category != ProductVersion {
			return fuego.BadRequestError{
				Title: "Invalid target node ID - must be a product version",
				Errors: []fuego.ErrorItem{
					{
						Name:   "UpdateRelationshipDTO.TargetNodeIDs",
						Reason: fmt.Sprintf("Target node ID %s must be a valid product version ID", targetNodeID),
					},
				},
			}
		}
		targetNodes[i] = targetNode
	}

	// Get existing relationships for the source node and old category
	existingRelationships, err := s.repo.GetRelationshipsBySourceAndCategory(ctx, update.SourceNodeID, update.PreviousCategory)
	if err != nil {
		return fuego.InternalServerError{
			Title: "Failed to fetch existing relationships",
			Err:   err,
		}
	}

	// Delete relationships where target is not in the new target list
	targetNodeIDSet := make(map[string]bool)
	for _, targetNodeID := range update.TargetNodeIDs {
		targetNodeIDSet[targetNodeID] = true
	}

	for _, existingRel := range existingRelationships {
		if !targetNodeIDSet[existingRel.TargetNodeID] {
			if err := s.repo.DeleteRelationship(ctx, existingRel.ID); err != nil {
				return fuego.InternalServerError{
					Title: "Failed to delete existing relationship",
					Err:   err,
				}
			}
		}
	}

	// Update category for existing relationships that should remain
	if update.Category != update.PreviousCategory {
		for _, existingRel := range existingRelationships {
			if targetNodeIDSet[existingRel.TargetNodeID] {
				existingRel.Category = RelationshipCategory(update.Category)
				if err := s.repo.UpdateRelationship(ctx, existingRel); err != nil {
					return fuego.InternalServerError{
						Title: "Failed to update relationship category",
						Err:   err,
					}
				}
			}
		}
	}

	// Create new relationships for targets that don't exist yet
	existingTargetIDSet := make(map[string]bool)
	for _, existingRel := range existingRelationships {
		existingTargetIDSet[existingRel.TargetNodeID] = true
	}

	for _, targetNode := range targetNodes {
		if !existingTargetIDSet[targetNode.ID] {
			relationship := Relationship{
				ID:           uuid.New().String(),
				Category:     RelationshipCategory(update.Category),
				SourceNodeID: update.SourceNodeID,
				SourceNode:   &sourceNode,
				TargetNodeID: targetNode.ID,
				TargetNode:   &targetNode,
			}

			_, err := s.repo.CreateRelationship(ctx, relationship)
			if err != nil {
				return fuego.InternalServerError{
					Title: "Failed to create new relationship",
					Err:   err,
				}
			}
		}
	}

	return nil
}

func (s *Service) DeleteRelationship(ctx context.Context, id string) error {
	_, err := s.repo.GetRelationshipByID(ctx, id)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fuego.NotFoundError{
				Title: "Relationship not found",
			}
		}
		return fuego.InternalServerError{
			Title: "Failed to fetch relationship",
			Err:   err,
		}
	}

	if err := s.repo.DeleteRelationship(ctx, id); err != nil {
		return fuego.InternalServerError{
			Title: "Failed to delete relationship",
			Err:   err,
		}
	}

	return nil
}

func (s *Service) DeleteRelationshipsByVersionAndCategory(ctx context.Context, versionID, category string) error {
	// Verify the version exists
	node, err := s.repo.GetNodeByID(ctx, versionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fuego.NotFoundError{
				Title: "Product version not found",
			}
		}
		return fuego.InternalServerError{
			Title: "Failed to fetch product version",
			Err:   err,
		}
	}

	// Verify it's a product version
	if node.Category != ProductVersion {
		return fuego.NotFoundError{
			Title: "Product version not found",
		}
	}

	// Delete relationships by source node and category
	if err := s.repo.DeleteRelationshipsBySourceAndCategory(ctx, versionID, category); err != nil {
		return fuego.InternalServerError{
			Title: "Failed to delete relationships",
			Err:   err,
		}
	}

	return nil
}

// Identification Helpers

func (s *Service) CreateIdentificationHelper(ctx context.Context, create CreateIdentificationHelperDTO) (IdentificationHelperDTO, error) {
	node, err := s.repo.GetNodeByID(ctx, create.ProductVersionID)
	if err != nil || node.Category != ProductVersion {
		return IdentificationHelperDTO{}, fuego.BadRequestError{
			Title: "Invalid product version ID",
			Errors: []fuego.ErrorItem{
				{
					Name:   "CreateIdentificationHelperDTO.ProductVersionID",
					Reason: "Product version ID must be a valid product version ID",
				},
			},
		}
	}

	helper := IdentificationHelper{
		ID:       uuid.New().String(),
		Category: IdentificationHelperCategory(create.Category),
		Metadata: []byte(create.Metadata),
		NodeID:   create.ProductVersionID,
		Node:     &node,
	}

	createdHelper, err := s.repo.CreateIdentificationHelper(ctx, helper)
	if err != nil {
		return IdentificationHelperDTO{}, fuego.InternalServerError{
			Title: "Failed to create identification helper",
			Err:   err,
		}
	}

	return IdentificationHelperToDTO(createdHelper), nil
}

func (s *Service) GetIdentificationHelperByID(ctx context.Context, id string) (IdentificationHelperDTO, error) {
	helper, err := s.repo.GetIdentificationHelperByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return IdentificationHelperDTO{}, fuego.NotFoundError{
				Title: "Identification helper not found",
			}
		}
		return IdentificationHelperDTO{}, fuego.InternalServerError{
			Title: "Failed to fetch identification helper",
			Err:   err,
		}
	}

	return IdentificationHelperToDTO(helper), nil
}

func (s *Service) GetIdentificationHelpersByProductVersion(ctx context.Context, productVersionID string) ([]IdentificationHelperListItemDTO, error) {
	helpers, err := s.repo.GetIdentificationHelpersByProductVersion(ctx, productVersionID)
	if err != nil {
		return nil, fuego.InternalServerError{
			Title: "Failed to get identification helpers",
			Err:   err,
		}
	}

	result := make([]IdentificationHelperListItemDTO, len(helpers))
	for i, helper := range helpers {
		result[i] = IdentificationHelperListItemDTO{
			ID:               helper.ID,
			Category:         string(helper.Category),
			ProductVersionID: helper.NodeID,
			Metadata:         string(helper.Metadata),
		}
	}

	return result, nil
}

func (s *Service) UpdateIdentificationHelper(ctx context.Context, id string, update UpdateIdentificationHelperDTO) (IdentificationHelperDTO, error) {
	helper, err := s.repo.GetIdentificationHelperByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return IdentificationHelperDTO{}, fuego.NotFoundError{
				Title: "Identification helper not found",
			}
		}
		return IdentificationHelperDTO{}, fuego.InternalServerError{
			Title: "Failed to fetch identification helper",
			Err:   err,
		}
	}

	if update.ProductVersionID != "" {
		node, err := s.repo.GetNodeByID(ctx, update.ProductVersionID)
		if err != nil || node.Category != ProductVersion {
			return IdentificationHelperDTO{}, fuego.BadRequestError{
				Title: "Invalid product version ID",
				Errors: []fuego.ErrorItem{
					{
						Name:   "UpdateIdentificationHelperDTO.ProductVersionID",
						Reason: "Product version ID must be a valid product version ID",
					},
				},
			}
		}
		helper.NodeID = update.ProductVersionID
		helper.Node = &node
	}

	if update.Category != "" {
		helper.Category = IdentificationHelperCategory(update.Category)
	}

	if update.Metadata != nil {
		helper.Metadata = []byte(*update.Metadata)
	}

	if err := s.repo.UpdateIdentificationHelper(ctx, helper); err != nil {
		return IdentificationHelperDTO{}, fuego.InternalServerError{
			Title: "Failed to update identification helper",
			Err:   err,
		}
	}

	return IdentificationHelperToDTO(helper), nil
}

func (s *Service) DeleteIdentificationHelper(ctx context.Context, id string) error {
	_, err := s.repo.GetIdentificationHelperByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fuego.NotFoundError{
				Title: "Identification helper not found",
			}
		}
		return fuego.InternalServerError{
			Title: "Invalid identification helper ID",
		}
	}

	if err := s.repo.DeleteIdentificationHelper(ctx, id); err != nil {
		return fuego.InternalServerError{
			Title: "Failed to delete identification helper",
			Err:   err,
		}
	}

	return nil
}
