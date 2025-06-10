package internal

import (
	"context"

	"gorm.io/gorm"
)

type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository {
	return &repository{db: db}
}

func (r *repository) CreateBranch(ctx context.Context, branch Branch) (Branch, error) {
	if err := r.db.WithContext(ctx).Create(&branch).Error; err != nil {
		return Branch{}, err
	}
	return branch, nil
}

func (r *repository) ListBranchesByCategory(ctx context.Context, category BranchCategory) ([]Branch, error) {
	var branches []Branch
	err := r.db.WithContext(ctx).Where("category = ?", category).Find(&branches).Error
	if err != nil {
		return nil, err
	}
	return branches, nil
}

func (r *repository) GetBranchByID(ctx context.Context, id string) (Branch, error) {
	var branch Branch
	err := r.db.WithContext(ctx).Where("id = ?", id).Preload("Children").First(&branch).Error
	if err != nil {
		return Branch{}, err
	}
	return branch, nil
}

func (r *repository) GetProductWithVersions(ctx context.Context, id string) (Branch, error) {
	var branch Branch
	err := r.db.WithContext(ctx).Where("id = ?", id).Preload("Children").Preload("Children.SourceRelationships").Preload("Children.TargetRelationships").First(&branch).Error
	if err != nil {
		return Branch{}, err
	}
	return branch, nil
}
