package internal

import (
	"context"

	"gorm.io/gorm"
)

type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository {
	return &repository{db: db}
}

type LoadOptions struct {
	LoadChildren bool
}

type LoadOption func(*LoadOptions)

func WithChildren() LoadOption {
	return func(o *LoadOptions) {
		o.LoadChildren = true
	}
}

func (r *repository) CreateNode(ctx context.Context, node Node) (Node, error) {
	if err := r.db.WithContext(ctx).Create(&node).Error; err != nil {
		return Node{}, err
	}
	return node, nil
}

func (r *repository) GetNodesByCategory(ctx context.Context, category NodeCategory) ([]Node, error) {
	var nodes []Node
	err := r.db.WithContext(ctx).Where("category = ?", category).Find(&nodes).Error
	if err != nil {
		return nil, err
	}
	return nodes, nil
}

func (r *repository) GetNodeByID(ctx context.Context, id string, opts ...LoadOption) (Node, error) {
	options := &LoadOptions{}
	for _, opt := range opts {
		opt(options)
	}

	query := r.db.WithContext(ctx).Where("id = ?", id)

	if options.LoadChildren {
		query = query.Preload("Children")
	}

	var node Node
	err := query.First(&node).Error
	if err != nil {
		return Node{}, err
	}

	return node, nil
}

func (r *repository) GetProductWithVersions(ctx context.Context, id string) (Node, error) {
	var node Node
	err := r.db.WithContext(ctx).Where("id = ?", id).Preload("Children").Preload("Children.SourceRelationships").Preload("Children.TargetRelationships").First(&node).Error
	if err != nil {
		return Node{}, err
	}
	return node, nil
}
