package product

type ListParams struct {
	Page     int `query:"page"     validate:"gte=1"  example:"1"`
	PageSize int `query:"pageSize" validate:"gte=1,lte=100" example:"20"`
}

type PagedResponseDTO struct {
	Total    int64        `json:"total"     example:"357"`
	Page     int          `json:"page"      example:"1"`
	PageSize int          `json:"pageSize"  example:"20"`
	Items    []ProductDTO `json:"items"`
}

type ProductDTO struct {
	Name string `json:"name" example:"Product Name"`
}

func ToProductDTO(m Product) ProductDTO {
	return ProductDTO{
		Name: m.Name,
	}
}
