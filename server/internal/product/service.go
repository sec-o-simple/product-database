package product

import "context"

type Service struct {
	repo *repository
}

func NewService(repository *repository) *Service {
	return &Service{repo: repository}
}

func (s *Service) List(ctx context.Context, page, size int) ([]Product, int64, error) {
	return s.repo.List(ctx, page, size)
}
