package internal

import (
	"context"

	"github.com/go-fuego/fuego"
	"github.com/google/uuid"
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
	if err != nil || vendor.Category != Vendor {
		return VendorDTO{}, fuego.BadRequestError{
			Title: "Invalid vendor ID",
		}
	}

	products := make([]ProductDTO, len(vendor.Children))
	for i, product := range vendor.Children {
		products[i] = ProductDTO{
			ID:          product.ID,
			VendorID:    product.ParentID,
			Name:        product.Name,
			Description: product.Description,
			Type:        string(*product.ProductType),
		}
	}

	return VendorDTO{
		ID:          vendor.ID,
		Name:        vendor.Name,
		Description: vendor.Description,
	}, nil
}

func (s *Service) UpdateVendor(ctx context.Context, id string, update UpdateVendorDTO) (VendorDTO, error) {
	vendor, err := s.repo.GetNodeByID(ctx, id)
	if err != nil || vendor.Category != Vendor {
		return VendorDTO{}, fuego.BadRequestError{
			Title: "Invalid vendor ID",
		}
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
	if err != nil || vendor.Category != Vendor {
		return fuego.BadRequestError{
			Title: "Invalid vendor ID",
		}
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

func (s *Service) CreateProduct(ctx context.Context, product CreateProductDTO) (ProductDTO, error) {
	vendorNode, err := s.repo.GetNodeByID(ctx, product.VendorID)

	if err != nil || vendorNode.Category != Vendor {
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
	if err != nil || product.Category != ProductName {
		return ProductDTO{}, fuego.BadRequestError{
			Title: "Invalid product ID",
		}
	}

	if update.Name != nil {
		product.Name = *update.Name
	}
	if update.Description != nil {
		product.Description = *update.Description
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
	if err != nil || product.Category != ProductName {
		return fuego.BadRequestError{
			Title: "Invalid product ID",
		}
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
	nodes, err := s.repo.GetNodesByCategory(ctx, ProductName)
	if err != nil {
		return nil, err
	}

	products := make([]ProductDTO, len(nodes))
	for i, node := range nodes {
		products[i] = ProductDTO{
			ID:          node.ID,
			VendorID:    node.ParentID,
			Name:        node.Name,
			Description: node.Description,
			Type:        string(*node.ProductType),
		}
	}

	return products, nil
}

func (s *Service) ListVendorProducts(ctx context.Context, vendorID string) ([]ProductDTO, error) {
	vendor, err := s.repo.GetNodeByID(ctx, vendorID, WithChildren())
	if err != nil || vendor.Category != Vendor {
		return nil, fuego.BadRequestError{
			Title: "Invalid vendor ID",
		}
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
	product, err := s.repo.GetNodeByID(ctx, id)
	if err != nil || product.Category != ProductName {
		return ProductDTO{}, fuego.BadRequestError{
			Title: "Invalid product ID",
		}
	}

	return ProductDTO{
		ID:          product.ID,
		VendorID:    product.ParentID,
		Name:        product.Name,
		Description: product.Description,
		Type:        string(*product.ProductType),
	}, nil
}

// Product Versions

func (s *Service) CreateProductVersion(ctx context.Context, version CreateProductVersionDTO) (ProductVersionDTO, error) {
	productNode, err := s.repo.GetNodeByID(ctx, version.ProductID)

	if err != nil || productNode.Category != ProductName {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product node ID",
		}
	}

	node := Node{
		ID:       uuid.New().String(),
		Name:     version.Version,
		Category: ProductVersion,
		ParentID: &productNode.ID,
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
	if err != nil || version.Category != ProductVersion {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product version ID",
		}
	}

	if update.Version != nil {
		version.Name = *update.Version
	}

	if update.PredecessorID != nil {
		predecessor, err := s.repo.GetNodeByID(ctx, *update.PredecessorID)
		if err != nil || predecessor.Category != ProductVersion {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid predecessor ID",
			}
		}
		version.SuccessorID = &predecessor.ID
	}

	if update.ProductID != nil {
		product, err := s.repo.GetNodeByID(ctx, *update.ProductID)
		if err != nil || product.Category != ProductName {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid product ID",
			}
		}
		version.ParentID = &product.ID
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
	if err != nil || version.Category != ProductVersion {
		return fuego.BadRequestError{
			Title: "Invalid product version ID",
		}
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

	if err != nil || product.Category != ProductName {
		return nil, fuego.BadRequestError{
			Title: "Invalid product ID",
		}
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
	if err != nil || version.Category != ProductVersion {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product version ID",
		}
	}

	product, err := s.repo.GetNodeByID(ctx, *version.ParentID)

	if err != nil || product.Category != ProductName {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product ID for version",
		}
	}

	return ProductVersionDTO{
		ID:          version.ID,
		ProductID:   version.ParentID,
		Name:        version.Name,
		Description: version.Description,
	}, nil
}

// Relationships

func (s *Service) GetRelationshipsByProductVersion(ctx context.Context, versionID string) ([]RelationshipGroupDTO, error) {
	version, err := s.repo.GetNodeByID(ctx, versionID, WithRelationships(), WithChildren())

	if err != nil || version.Category != ProductVersion {
		return nil, fuego.BadRequestError{
			Title: "Invalid product version ID",
		}
	}

	groups := make(map[string][]RelationshipGroupItemDTO)

	for _, rel := range version.SourceRelationships {
		item := RelationshipGroupItemDTO{
			Product: NodeToProductDTO(*rel.TargetNode),
			VersionRelationships: []ProductionVersionRelationshipDTO{
				{
					RelationshipID: rel.ID,
					Version:        NodeToProductVersionDTO(*rel.TargetNode),
				},
			},
		}
		groups[string(rel.Category)] = append(groups[string(rel.Category)], item)
	}

	var result []RelationshipGroupDTO
	for category, items := range groups {
		result = append(result, RelationshipGroupDTO{
			Category: category,
			Products: items,
		})
	}

	return result, nil
}

func (s *Service) CreateRelationship(ctx context.Context, create CreateRelationshipDTO) (RelationshipDTO, error) {
	// Validate source node exists and is a product version
	sourceNode, err := s.repo.GetNodeByID(ctx, create.SourceNodeID)
	if err != nil || sourceNode.Category != ProductVersion {
		return RelationshipDTO{}, fuego.BadRequestError{
			Title: "Invalid source node ID - must be a product version",
		}
	}

	// Validate target node exists and is a product version
	targetNode, err := s.repo.GetNodeByID(ctx, create.TargetNodeID)
	if err != nil || targetNode.Category != ProductVersion {
		return RelationshipDTO{}, fuego.BadRequestError{
			Title: "Invalid target node ID - must be a product version",
		}
	}

	// Create the relationship
	relationship := Relationship{
		ID:           uuid.New().String(),
		Category:     RelationshipCategory(create.Category),
		SourceNodeID: create.SourceNodeID,
		SourceNode:   &sourceNode,
		TargetNodeID: create.TargetNodeID,
		TargetNode:   &targetNode,
	}

	createdRelationship, err := s.repo.CreateRelationship(ctx, relationship)
	if err != nil {
		return RelationshipDTO{}, fuego.InternalServerError{
			Title: "Failed to create relationship",
			Err:   err,
		}
	}

	return RelationshipToDTO(createdRelationship), nil
}

func (s *Service) GetRelationshipByID(ctx context.Context, id string) (RelationshipDTO, error) {
	relationship, err := s.repo.GetRelationshipByID(ctx, id)
	if err != nil {
		return RelationshipDTO{}, fuego.BadRequestError{
			Title: "Invalid relationship ID",
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

func (s *Service) UpdateRelationship(ctx context.Context, id string, update UpdateRelationshipDTO) (RelationshipDTO, error) {
	relationship, err := s.repo.GetRelationshipByID(ctx, id)

	if err != nil {
		return RelationshipDTO{}, fuego.BadRequestError{
			Title: "Invalid relationship ID",
		}
	}

	if update.Category != nil {
		relationship.Category = RelationshipCategory(*update.Category)
	}

	if update.SourceNodeID != nil {
		sourceNode, err := s.repo.GetNodeByID(ctx, *update.SourceNodeID)

		if err != nil || sourceNode.Category != ProductVersion {
			return RelationshipDTO{}, fuego.BadRequestError{
				Title: "Invalid source node ID",
			}
		}

		relationship.SourceNodeID = *update.SourceNodeID
		relationship.SourceNode = &sourceNode
	}

	if update.TargetNodeID != nil {
		targetNode, err := s.repo.GetNodeByID(ctx, *update.TargetNodeID)

		if err != nil || targetNode.Category != ProductVersion {
			return RelationshipDTO{}, fuego.BadRequestError{
				Title: "Invalid target node ID",
			}
		}

		relationship.TargetNodeID = *update.TargetNodeID
		relationship.TargetNode = &targetNode
	}

	if err := s.repo.UpdateRelationship(ctx, relationship); err != nil {
		return RelationshipDTO{}, fuego.InternalServerError{
			Title: "Failed to update relationship",
			Err:   err,
		}
	}

	return RelationshipToDTO(relationship), nil
}

func (s *Service) DeleteRelationship(ctx context.Context, id string) error {
	_, err := s.repo.GetRelationshipByID(ctx, id)
	if err != nil {
		return fuego.BadRequestError{
			Title: "Invalid relationship ID",
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

// Identification Helpers

func (s *Service) CreateIdentificationHelper(ctx context.Context, create CreateIdentificationHelperDTO) (IdentificationHelperDTO, error) {
	node, err := s.repo.GetNodeByID(ctx, create.ProductVersionID)
	if err != nil || node.Category != ProductVersion {
		return IdentificationHelperDTO{}, fuego.BadRequestError{
			Title: "Invalid product version ID",
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
		return IdentificationHelperDTO{}, fuego.BadRequestError{
			Title: "Invalid identification helper ID",
		}
	}

	return IdentificationHelperToDTO(helper), nil
}

func (s *Service) UpdateIdentificationHelper(ctx context.Context, id string, update UpdateIdentificationHelperDTO) (IdentificationHelperDTO, error) {
	helper, err := s.repo.GetIdentificationHelperByID(ctx, id)
	if err != nil {
		return IdentificationHelperDTO{}, fuego.BadRequestError{
			Title: "Invalid identification helper ID",
		}
	}

	if update.ProductVersionID != "" {
		node, err := s.repo.GetNodeByID(ctx, update.ProductVersionID)
		if err != nil || node.Category != ProductVersion {
			return IdentificationHelperDTO{}, fuego.BadRequestError{
				Title: "Invalid product version ID",
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
		return fuego.BadRequestError{
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
