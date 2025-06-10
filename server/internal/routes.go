package internal

import "github.com/go-fuego/fuego"

func RegisterRoutes(s *fuego.Server, svc *Service) {
	h := NewHandler(svc)
	g := fuego.Group(s, "/api/v1")

	fuego.Post(g, "/vendors", h.CreateVendor)
	fuego.Get(g, "/vendors", h.ListVendors)
	fuego.Get(g, "/vendors/{id}", h.GetVendorByID)

	fuego.Get(g, "/products", h.ListProducts)
	fuego.Post(g, "/products", h.CreateProduct)
	fuego.Get(g, "/products/{id}", h.GetProductByID)

	fuego.Get(g, "/products/{id}/versions", h.ListProductVersions)
	fuego.Post(g, "/products/{id}/versions", h.CreateProductVersion)
	fuego.Get(g, "/products/{id}/versions/{versionID}", h.GetProductVersionByID)
}
