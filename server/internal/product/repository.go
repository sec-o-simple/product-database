package product

import (
	"context"

	"gorm.io/gorm"
)

type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) *repository {
	return &repository{db: db}
}

func (r *repository) List(ctx context.Context, page, size int) (items []Product, total int64, err error) {
	q := r.db.WithContext(ctx).Model(&Product{})

	err = q.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * size
	err = q.Limit(size).Offset(offset).Order("id DESC").Find(&items).Error

	return
}
