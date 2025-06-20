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

func (r *repository) UpdateNode(ctx context.Context, node Node) error {
	if err := r.db.WithContext(ctx).Save(&node).Error; err != nil {
		return err
	}
	return nil
}

func (r *repository) DeleteNode(ctx context.Context, id string) error {
	if err := r.db.WithContext(ctx).Delete(&Node{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}

func (r *repository) CreateRelationship(ctx context.Context, rel Relationship) (Relationship, error) {
	if err := r.db.WithContext(ctx).Create(&rel).Error; err != nil {
		return Relationship{}, err
	}
	return rel, nil
}

func (r *repository) GetRelationshipByID(ctx context.Context, id string) (Relationship, error) {
	var rel Relationship
	err := r.db.WithContext(ctx).Where("id = ?", id).Preload("SourceNode").Preload("TargetNode").First(&rel).Error
	if err != nil {
		return Relationship{}, err
	}
	return rel, nil
}

func (r *repository) UpdateRelationship(ctx context.Context, rel Relationship) error {
	return r.db.WithContext(ctx).Save(&rel).Error
}

func (r *repository) DeleteRelationship(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Relationship{}, "id = ?", id).Error
}

func (r *repository) CreateIdentificationHelper(ctx context.Context, helper IdentificationHelper) (IdentificationHelper, error) {
	if err := r.db.WithContext(ctx).Create(&helper).Error; err != nil {
		return IdentificationHelper{}, err
	}
	return helper, nil
}

func (r *repository) GetIdentificationHelperByID(ctx context.Context, id string) (IdentificationHelper, error) {
	var helper IdentificationHelper
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&helper).Error
	if err != nil {
		return IdentificationHelper{}, err
	}
	return helper, nil
}

func (r *repository) UpdateIdentificationHelper(ctx context.Context, helper IdentificationHelper) error {
	return r.db.WithContext(ctx).Save(&helper).Error
}

func (r *repository) DeleteIdentificationHelper(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&IdentificationHelper{}, "id = ?", id).Error
}
