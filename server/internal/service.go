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
			Type:        "software",
		}
	}

	return VendorDTO{
		ID:          vendor.ID,
		Name:        vendor.Name,
		Description: vendor.Description,
	}, nil
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
			Type:        "software",
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
