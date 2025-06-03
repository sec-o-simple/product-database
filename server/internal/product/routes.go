package product

import "github.com/go-fuego/fuego"

func RegisterRoutes(s *fuego.Server, svc *Service) {
	h := NewHandler(svc)
	g := fuego.Group(s, "/products")

	fuego.Get(g, "/", h.List)
}
