package internal

type CreateVendorDTO struct {
	Name        string `json:"name" example:"Vendor Name" validate:"required"`
	Description string `json:"description" example:"Vendor Description"`
}

type CreateProductDTO struct {
	Name           string `json:"name" example:"Product Name" validate:"required"`
	Description    string `json:"description" example:"Product Description"`
	VendorBranchID string `json:"vendor_branch_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
}

type CreateProductVersionDTO struct {
	Version         string  `json:"version" example:"Version Name" validate:"required"`
	ProductBranchID string  `json:"product_branch_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
	ReleaseDate     *string `json:"release_date" example:"2023-10-01" validate:"datetime=2006-01-02"`
	IsLatest        bool    `json:"is_latest" example:"true" validate:"boolean"`
}

type ProductDTO struct {
	ID          string              `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	VendorID    *string             `json:"vendor_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Name        string              `json:"name" example:"Product Name" validate:"required"`
	Description string              `json:"description" example:"Product Description"`
	Versions    []ProductVersionDTO `json:"versions" validate:"required"`
}

type ProductVersionDTO struct {
	ID                  string            `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	ProductID           *string           `json:"product_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	ProductName         *string           `json:"product_name" example:"Product Name"`
	Name                string            `json:"name" example:"Version Name" validate:"required"`
	Description         string            `json:"description" example:"Version Description"`
	SourceRelationships []RelationshipDTO `json:"source_relationships" validate:"dive"`
}

type RelationshipDTO struct {
	ID               string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Category         string `json:"category" example:"default_component_of" validate:"required"`
	TargetBranchID   string `json:"target_branch_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	TargetBranchName string `json:"target_branch_name" example:"Target Branch Name" validate:"required"`
}

type VendorDTO struct {
	ID          string       `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Name        string       `json:"name" example:"Vendor Name" validate:"required"`
	Description string       `json:"description" example:"Vendor Description"`
	Products    []ProductDTO `json:"products" validate:"required"`
}

type VendorListItemDTO struct {
	ID           string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Name         string `json:"name" example:"Vendor Name" validate:"required"`
	Description  string `json:"description" example:"Vendor Description" validate:"required"`
	ProductCount int    `json:"product_count" example:"10" validate:"required"`
}
