package internal

import "database/sql"

type NodeCategory string

const (
	Vendor         NodeCategory = "vendor"
	ProductFamily  NodeCategory = "product_family"
	ProductName    NodeCategory = "product_name"
	ProductVersion NodeCategory = "product_version"
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

type IdentificationHelperCategory string

type Node struct {
	ID       string `gorm:"primaryKey"`
	Category NodeCategory

	Name        string
	Description string `gorm:"type:text"`

	ParentID *string
	Parent   *Node
	Children []Node `gorm:"foreignKey:ParentID"`

	SourceRelationships []Relationship `gorm:"foreignKey:SourceNodeID"`
	TargetRelationships []Relationship `gorm:"foreignKey:TargetNodeID"`

	ProductType *ProductType `gorm:"type:product_type"`
	ReleasedAt  sql.NullTime

	SuccessorID *string
	Successor   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

type Relationship struct {
	ID       string `gorm:"primaryKey"`
	Category RelationshipCategory

	SourceNodeID string
	SourceNode   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	TargetNodeID string
	TargetNode   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

type IdentificationHelper struct {
	ID       string `gorm:"primaryKey"`
	Category IdentificationHelperCategory
	Metadata []byte `gorm:"serializer:json"`
}

func Models() []interface{} {
	return []interface{}{
		&Node{},
		&Relationship{},
	}
}
