package internal

import (
	"context"
	"time"

	"github.com/go-fuego/fuego"
	"github.com/google/uuid"
)

type Service struct {
	repo *repository
}

func NewService(repository *repository) *Service {
	return &Service{repo: repository}
}

func (s *Service) CreateVendor(ctx context.Context, vendor CreateVendorDTO) (VendorDTO, error) {
	branch := Branch{
		ID:          uuid.New().String(),
		Name:        vendor.Name,
		Description: vendor.Description,
		Category:    Vendor,
	}

	createdBranch, err := s.repo.CreateBranch(ctx, branch)
	if err != nil {
		return VendorDTO{}, fuego.InternalServerError{
			Title: "Failed to create vendor",
			Err:   err,
		}
	}

	return VendorDTO{
		ID:          createdBranch.ID,
		Name:        createdBranch.Name,
		Description: createdBranch.Description,
		Products:    []ProductDTO{},
	}, nil
}

func (s *Service) ListVendors(ctx context.Context) ([]VendorListItemDTO, error) {
	branches, err := s.repo.ListBranchesByCategory(ctx, Vendor)
	if err != nil {
		return nil, err
	}

	vendors := make([]VendorListItemDTO, len(branches))
	for i, branch := range branches {
		vendors[i] = VendorListItemDTO{
			ID:           branch.ID,
			Name:         branch.Name,
			Description:  branch.Description,
			ProductCount: len(branch.Children),
		}
	}

	return vendors, nil
}

func (s *Service) CreateProduct(ctx context.Context, product CreateProductDTO) (ProductDTO, error) {
	vendorBranch, err := s.repo.GetBranchByID(ctx, product.VendorBranchID)

	if err != nil || vendorBranch.Category != Vendor {
		return ProductDTO{}, fuego.BadRequestError{
			Title: "Invalid vendor branch ID",
		}
	}

	branch := Branch{
		ID:          uuid.New().String(),
		Name:        product.Name,
		Description: product.Description,
		Category:    ProductName,
		ParentID:    &vendorBranch.ID,
	}

	createdBranch, err := s.repo.CreateBranch(ctx, branch)

	if err != nil {
		return ProductDTO{}, fuego.InternalServerError{
			Title: "Failed to create product",
			Err:   err,
		}
	}

	return ProductDTO{
		ID:          createdBranch.ID,
		VendorID:    createdBranch.ParentID,
		Name:        createdBranch.Name,
		Description: createdBranch.Description,
		Versions:    []ProductVersionDTO{},
	}, nil
}

func (s *Service) ListProducts(ctx context.Context) ([]ProductDTO, error) {
	branches, err := s.repo.ListBranchesByCategory(ctx, ProductName)
	if err != nil {
		return nil, err
	}

	products := make([]ProductDTO, len(branches))
	for i, branch := range branches {
		products[i] = ProductDTO{
			ID:          branch.ID,
			VendorID:    branch.ParentID,
			Name:        branch.Name,
			Description: branch.Description,
			Versions:    []ProductVersionDTO{},
		}
	}

	return products, nil
}

func (s *Service) CreateProductVersion(ctx context.Context, version CreateProductVersionDTO) (ProductVersionDTO, error) {
	productBranch, err := s.repo.GetBranchByID(ctx, version.ProductBranchID)

	if err != nil || productBranch.Category != ProductName {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product branch ID",
		}
	}

	var releaseDate *time.Time
	if version.ReleaseDate != nil {
		parsedDate, err := time.Parse("2006-01-02", *version.ReleaseDate)
		if err != nil {
			return ProductVersionDTO{}, fuego.BadRequestError{
				Title: "Invalid release date format",
				Err:   err,
			}
		}
		releaseDate = &parsedDate
	}

	branch := Branch{
		ID:              uuid.New().String(),
		Name:            version.Version,
		IsLatestVersion: version.IsLatest,
		ReleaseDate:     releaseDate,
		Category:        ProductVersion,
		ParentID:        &productBranch.ID,
	}

	createdBranch, err := s.repo.CreateBranch(ctx, branch)

	if err != nil {
		return ProductVersionDTO{}, fuego.InternalServerError{
			Title: "Failed to create product version",
			Err:   err,
		}
	}

	return ProductVersionDTO{
		ID:          createdBranch.ID,
		ProductID:   createdBranch.ParentID,
		Name:        createdBranch.Name,
		Description: createdBranch.Description,
	}, nil
}

func (s *Service) ListProductVersions(ctx context.Context, productID string) ([]ProductVersionDTO, error) {
	product, err := s.repo.GetBranchByID(ctx, productID)

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

func (s *Service) GetVendorByID(ctx context.Context, id string) (VendorDTO, error) {
	vendor, err := s.repo.GetBranchByID(ctx, id)
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
		}
	}

	return VendorDTO{
		ID:          vendor.ID,
		Name:        vendor.Name,
		Description: vendor.Description,
		Products:    products,
	}, nil
}

func (s *Service) GetProductByID(ctx context.Context, id string) (ProductDTO, error) {
	product, err := s.repo.GetBranchByID(ctx, id)
	if err != nil || product.Category != ProductName {
		return ProductDTO{}, fuego.BadRequestError{
			Title: "Invalid product ID",
		}
	}

	versions := make([]ProductVersionDTO, len(product.Children))
	for i, version := range product.Children {
		sourceRelationships := make([]RelationshipDTO, len(version.SourceRelationships))

		for j, rel := range version.SourceRelationships {
			sourceRelationships[j] = RelationshipDTO{
				ID:               rel.ID,
				Category:         string(rel.Category),
				TargetBranchName: rel.TargetBranch.Name,
			}
		}

		versions[i] = ProductVersionDTO{
			ID:                  version.ID,
			ProductID:           version.ParentID,
			Name:                version.Name,
			Description:         version.Description,
			SourceRelationships: sourceRelationships,
		}
	}

	return ProductDTO{
		ID:          product.ID,
		VendorID:    product.ParentID,
		Name:        product.Name,
		Description: product.Description,
		Versions:    versions,
	}, nil
}

func (s *Service) GetProductVersionByID(ctx context.Context, id string) (ProductVersionDTO, error) {
	version, err := s.repo.GetBranchByID(ctx, id)
	if err != nil || version.Category != ProductVersion {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product version ID",
		}
	}

	product, err := s.repo.GetBranchByID(ctx, *version.ParentID)

	if err != nil || product.Category != ProductName {
		return ProductVersionDTO{}, fuego.BadRequestError{
			Title: "Invalid product ID for version",
		}
	}

	sourceRelationships := make([]RelationshipDTO, len(version.SourceRelationships))

	for i, rel := range version.SourceRelationships {
		sourceRelationships[i] = RelationshipDTO{
			ID:               rel.ID,
			Category:         string(rel.Category),
			TargetBranchName: rel.TargetBranch.Name,
		}
	}

	return ProductVersionDTO{
		ID:                  version.ID,
		ProductID:           version.ParentID,
		ProductName:         &product.Name,
		Name:                version.Name,
		Description:         version.Description,
		SourceRelationships: sourceRelationships,
	}, nil
}
