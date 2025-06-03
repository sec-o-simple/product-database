package product

import "github.com/go-fuego/fuego"

type Handler struct {
	svc *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{svc: service}
}

func (h *Handler) List(c fuego.ContextNoBody) (*PagedResponseDTO, error) {

	items, total, err := h.svc.List(c.Request().Context(), 1, 20)
	if err != nil {
		return &PagedResponseDTO{}, err
	}

	dtos := make([]ProductDTO, len(items))
	for i, m := range items {
		dtos[i] = ToProductDTO(m)
	}

	return &PagedResponseDTO{
		Total:    total,
		Page:     1,
		PageSize: 20,
		Items:    dtos,
	}, nil
}
