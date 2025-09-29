package database

import (
	"database/sql"
	"log/slog"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) {
	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{{
		ID: "202509151600",
		Migrate: func(tx *gorm.DB) error {
			slog.Info("migrating database to initial version")

			// Existing database, skip first migration
			if tx.Migrator().HasTable("nodes") {
				return nil
			}

			type nodeCategory string
			type relationshipCategory string
			type productType string
			type identificationHelperCategory string

			type Relationship struct {
				ID           string `gorm:"primaryKey"`
				Category     relationshipCategory
				SourceNodeID string
				TargetNodeID string
			}

			type Node struct {
				ID       string `gorm:"primaryKey"`
				Category nodeCategory

				Name        string
				Description string `gorm:"type:text"`

				ParentID *string
				Parent   *Node  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
				Children []Node `gorm:"foreignKey:ParentID"`

				SourceRelationships []Relationship `gorm:"foreignKey:SourceNodeID"`
				TargetRelationships []Relationship `gorm:"foreignKey:TargetNodeID"`

				ProductType     productType `gorm:"type:product_type"`
				ProductFamilyID *string     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
				ReleasedAt      sql.NullTime

				SuccessorID *string
				Successor   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
			}

			type IdentificationHelper struct {
				ID       string `gorm:"primaryKey"`
				Category identificationHelperCategory
				Metadata []byte `gorm:"serializer:json"`

				NodeID string
				Node   *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
			}

			return tx.Migrator().CreateTable(&Node{}, &Relationship{}, &IdentificationHelper{})
		},
	}, {
		ID: "202509291000",
		Migrate: func(tx *gorm.DB) error {
			// temporarily disable foreign key constraints to allow cleanup
			if err := tx.Exec("PRAGMA foreign_keys = OFF").Error; err != nil {
				panic("failed to disable foreign keys: " + err.Error())
			}
			defer func() {
				if err := tx.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
					panic("failed to enable foreign keys: " + err.Error())
				}
			}()

			// Set successor to null that does not exist
			if err := tx.Exec(`
				UPDATE nodes 
				SET successor_id = NULL 
				WHERE successor_id IS NOT NULL 
				AND successor_id NOT IN (SELECT id FROM nodes)
			`).Error; err != nil {
				slog.Error("failed to clean up successor_id", "err", err)
				return err
			}

			// Set product family to null that does not exist
			if err := tx.Exec(`
				UPDATE nodes 
				SET product_family_id = NULL 
				WHERE product_family_id IS NOT NULL 
				AND product_family_id NOT IN (SELECT id FROM nodes)
			`).Error; err != nil {
				return err
			}

			// Delete nodes where parent does not exist (iteratively until no more deletions)
			for {
				result := tx.Exec(`
					DELETE FROM nodes 
					WHERE parent_id IS NOT NULL 
					AND parent_id NOT IN (SELECT id FROM nodes)
				`)
				if result.Error != nil {
					return result.Error
				}
				if result.RowsAffected == 0 {
					break
				}
			}

			// Delete relationships where source or target does not exist
			if err := tx.Exec(`
				DELETE FROM relationships 
				WHERE source_node_id NOT IN (SELECT id FROM nodes) 
				OR target_node_id NOT IN (SELECT id FROM nodes)
			`).Error; err != nil {
				return err
			}

			// Delete identification helpers where node does not exist
			if err := tx.Exec(`
				DELETE FROM identification_helpers 
				WHERE node_id NOT IN (SELECT id FROM nodes)
			`).Error; err != nil {
				return err
			}

			type Relationship struct {
				ID           string `gorm:"primaryKey"`
				SourceNodeID string `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:SourceNodeID;references:ID"`
				TargetNodeID string `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:TargetNodeID;references:ID"`
			}

			type Node struct {
				ID                  string `gorm:"primaryKey"`
				ParentID            *string
				Parent              *Node          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ParentID;references:ID"`
				Children            []Node         `gorm:"foreignKey:ParentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
				SourceRelationships []Relationship `gorm:"foreignKey:SourceNodeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
				TargetRelationships []Relationship `gorm:"foreignKey:TargetNodeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
				ProductFamilyID     *string
				ProductFamily       *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:ProductFamilyID;references:ID"`
				SuccessorID         *string
				Successor           *Node `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:SuccessorID;references:ID"`
			}

			tx.Migrator().DropConstraint(&Node{}, "fk_nodes_children")
			tx.Migrator().DropConstraint(&Node{}, "fk_nodes_product_family")
			tx.Migrator().CreateConstraint(&Node{}, "fk_nodes_children")
			tx.Migrator().CreateConstraint(&Node{}, "fk_nodes_product_family")

			tx.Migrator().DropConstraint(&Relationship{}, "fk_nodes_target_relationships")
			tx.Migrator().DropConstraint(&Relationship{}, "fk_nodes_source_relationships")
			tx.Migrator().CreateConstraint(&Node{}, "fk_nodes_target_relationships")
			tx.Migrator().CreateConstraint(&Node{}, "fk_nodes_source_relationships")

			return nil
		},
	}})

	if err := m.Migrate(); err != nil {
		slog.Error("database migration failed", "err", err)
		panic(err)
	}

	slog.Info("database schema up-to-date")
}
