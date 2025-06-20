package internal

// Vendors
type CreateVendorDTO struct {
	Name        string `json:"name" example:"Vendor Name" validate:"required"`
	Description string `json:"description" example:"Vendor Description"`
}

type UpdateVendorDTO struct {
	Name        *string `json:"name" example:"Vendor Name"`
	Description *string `json:"description" example:"Vendor Description"`
}

type VendorDTO struct {
	ID           string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Name         string `json:"name" example:"Vendor Name" validate:"required"`
	Description  string `json:"description" example:"Vendor Description" validate:"required"`
	ProductCount int    `json:"product_count" example:"10" validate:"required"`
}

// Products
type CreateProductDTO struct {
	Name        string `json:"name" example:"Product Name" validate:"required"`
	Description string `json:"description" example:"Product Description"`
	VendorID    string `json:"vendor_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
	Type        string `json:"type" example:"software" validate:"required,oneof=software hardware firmware"`
}

type UpdateProductDTO struct {
	Name        *string `json:"name" example:"Product Name"`
	Description *string `json:"description" example:"Product Description"`
	VendorID    *string `json:"vendor_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
	Type        *string `json:"type" example:"software" validate:"oneof=software hardware firmware"`
}

type ProductDTO struct {
	ID             string              `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	VendorID       *string             `json:"vendor_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Name           string              `json:"name" example:"Product Name" validate:"required"`
	FullName       string              `json:"full_name" example:"Vendor Name - Product Name" validate:"required"`
	Description    string              `json:"description" example:"Product Description"`
	Type           string              `json:"type" example:"software" validate:"required,oneof=software hardware firmware"`
	LatestVersions []ProductVersionDTO `json:"latest_versions" validate:"dive"`
}

// Product Versions
type CreateProductVersionDTO struct {
	Version       string  `json:"version" example:"Version Name" validate:"required"`
	ProductID     string  `json:"product_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
	ReleaseDate   *string `json:"release_date" example:"2023-10-01" validate:"datetime=2006-01-02"`
	PredecessorID *string `json:"predecessor_id,omitempty" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
}

type UpdateProductVersionDTO struct {
	Version       *string `json:"version" example:"Version Name"`
	ProductID     *string `json:"product_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
	ReleaseDate   *string `json:"release_date" example:"2023-10-01" validate:"omitempty,datetime=2006-01-02"`
	PredecessorID *string `json:"predecessor_id,omitempty" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
}

type ProductVersionDTO struct {
	ID            string  `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	ProductID     *string `json:"product_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Name          string  `json:"name" example:"Version Name" validate:"required"`
	FullName      string  `json:"full_name" example:"Product Name - Version Name" validate:"required"`
	Description   string  `json:"description" example:"Version Description"`
	IsLatest      bool    `json:"is_latest" example:"true" validate:"required"`
	PredecessorID *string `json:"predecessor_id,omitempty" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
}

func NodeToProductVersionDTO(node Node) ProductVersionDTO {
	return ProductVersionDTO{
		ID:            node.ID,
		ProductID:     node.ParentID,
		Name:          node.Name,
		FullName:      node.Name,
		Description:   node.Description,
		IsLatest:      false,
		PredecessorID: nil,
	}
}

// Relationships
type CreateRelationshipDTO struct {
	Category     string `json:"category" example:"default_component_of" validate:"required"`
	SourceNodeID string `json:"source_node_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
	TargetNodeID string `json:"target_node_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
}

type UpdateRelationshipDTO struct {
	Category     *string `json:"category" example:"default_component_of"`
	SourceNodeID *string `json:"source_node_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
	TargetNodeID *string `json:"target_node_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"omitempty,uuid"`
}

type RelationshipDTO struct {
	ID       string            `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Category string            `json:"category" example:"default_component_of" validate:"required"`
	Source   ProductVersionDTO `json:"source" validate:"required"`
	Target   ProductVersionDTO `json:"target" validate:"required,dive"`
}

func RelationshipToDTO(relationship Relationship) RelationshipDTO {
	return RelationshipDTO{
		ID:       relationship.ID,
		Category: string(relationship.Category),
		Source:   NodeToProductVersionDTO(*relationship.SourceNode),
		Target:   NodeToProductVersionDTO(*relationship.TargetNode),
	}
}

type RelationshipGroupDTO struct {
	Category string                     `json:"category" example:"default_component_of" validate:"required"`
	Products []RelationshipGroupItemDTO `json:"products" validate:"required,dive"`
}

type RelationshipGroupItemDTO struct {
	Product              ProductDTO                         `json:"product" validate:"required"`
	VersionRelationships []ProductionVersionRelationshipDTO `json:"version_relationships" validate:"required,dive"`
}

type ProductionVersionRelationshipDTO struct {
	RelationshipID string            `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Version        ProductVersionDTO `json:"version" validate:"required"`
}

// Identification Helpers
type CreateIdentificationHelperDTO struct {
	ProductVersionID string `json:"product_version_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
	Category         string `json:"category" example:"hashes" validate:"required"`
	Metadata         string `json:"metadata" example:"{\"hash\":\"abc123\"}" validate:"required,json"` // JSON string
}

type UpdateIdentificationHelperDTO struct {
	ProductVersionID string  `json:"product_version_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Category         string  `json:"category" example:"hashes"`
	Metadata         *string `json:"metadata" example:"{\"key\":\"value\"}"  validate:"json"` // JSON string
}

type IdentificationHelperListItemDTO struct {
	ID               string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Category         string `json:"category" example:"hashes" validate:"required"`
	ProductVersionID string `json:"product_version_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
}

type IdentificationHelperDTO struct {
	ID               string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required"`
	Category         string `json:"category" example:"hashes" validate:"required"`
	ProductVersionID string `json:"product_version_id" example:"123e4567-e89b-12d3-a456-426614174000" validate:"required,uuid"`
	Metadata         string `json:"metadata" example:"{\"hash\":\"abc123\"}" validate:"required,json"` // JSON string
}

func IdentificationHelperToDTO(helper IdentificationHelper) IdentificationHelperDTO {
	return IdentificationHelperDTO{
		ID:               helper.ID,
		Category:         string(helper.Category),
		ProductVersionID: helper.NodeID,
		Metadata:         string(helper.Metadata),
	}
}
