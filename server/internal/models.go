package internal

import "time"

type BranchCategory string

const (
	Vendor         BranchCategory = "vendor"
	ProductName    BranchCategory = "product_name"
	ProductVersion BranchCategory = "product_version"
)

type RelationshipCategory string

const (
	DefaultComponentOf  RelationshipCategory = "default_component_of"
	ExternalComponentOf RelationshipCategory = "external_component_of"
	InstalledOn         RelationshipCategory = "installed_on"
	InstalledWith       RelationshipCategory = "installed_with"
	OptionalComponentOf RelationshipCategory = "optional_component_of"
)

type ProductType string

const (
	Software ProductType = "software"
	Hardware ProductType = "hardware"
	Firmware ProductType = "firmware"
)

type Branch struct {
	ID       string         `gorm:"primaryKey"`
	Category BranchCategory `gorm:"not null"`

	Name        string `gorm:"not null"`
	Description string `gorm:"type:text"`

	ParentID *string
	Parent   *Branch
	Children []Branch `gorm:"foreignKey:ParentID"`

	SourceRelationships []Relationship `gorm:"foreignKey:SourceBranchID"`
	TargetRelationships []Relationship `gorm:"foreignKey:TargetBranchID"`

	// Only relevant for versions at the moment
	ProductType     *ProductType `gorm:"type:product_type"`
	ReleaseDate     *time.Time
	IsLatestVersion bool `gorm:"default:false;not null"`
}

type Relationship struct {
	ID       string               `gorm:"primaryKey"`
	Category RelationshipCategory `gorm:"not null"`

	SourceBranchID *string `gorm:"not null"`
	SourceBranch   *Branch `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	TargetBranchID *string `gorm:"not null"`
	TargetBranch   *Branch `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func Models() []interface{} {
	return []interface{}{
		&Branch{},
		&Relationship{},
	}
}
