package internal

import "github.com/go-fuego/fuego"

func RegisterRoutes(s *fuego.Server, svc *Service) {
	h := NewHandler(svc)
	g := fuego.Group(s, "/api/v1")

	fuego.Get(g, "/health", func(c fuego.ContextNoBody) (string, error) {
		return "OK", nil
	})

	fuego.Get(g, "/vendors", h.ListVendors)                      // []VendorDTO
	fuego.Get(g, "/vendors/{id}", h.GetVendor)                   // VendorDTO
	fuego.Get(g, "/vendors/{id}/products", h.ListVendorProducts) // []ProductDTO
	fuego.Put(g, "/vendors/{id}", h.UpdateVendor)                // VendorDTO
	fuego.Delete(g, "/vendors/{id}", h.DeleteVendor)             // No Content
	fuego.Post(g, "/vendors", h.CreateVendor)                    // VendorDTO

	fuego.Get(g, "/products", h.ListProducts)                      // []ProductDTO
	fuego.Get(g, "/products/{id}", h.GetProduct)                   // ProductDTO
	fuego.Get(g, "/products/{id}/versions", h.ListProductVersions) // []ProductVersionDTO
	fuego.Put(g, "/products/{id}", h.UpdateProduct)                // ProductDTO
	fuego.Delete(g, "/products/{id}", h.DeleteProduct)             // No Content
	fuego.Post(g, "/products", h.CreateProduct)                    // ProductDTO

	fuego.Get(g, "/product-versions/{id}", h.GetProductVersion)                                                // ProductVersionDTO
	fuego.Get(g, "/product-versions/{id}/relationships", h.ListRelationshipsByProductVersion)                  // []RelationshipGroupDTO
	fuego.Get(g, "/product-versions/{id}/identification-helpers", h.ListIdentificationHelpersByProductVersion) // []IdentificationHelperListItemDTO
	fuego.Put(g, "/product-versions/{id}", h.UpdateProductVersion)                                             // ProductVersionDTO
	fuego.Delete(g, "/product-versions/{id}", h.DeleteProductVersion)                                          // No Content
	fuego.Post(g, "/product-versions", h.CreateProductVersion)                                                 // ProductVersionDTO

	fuego.Get(g, "/relationships/{id}", h.GetRelationship)       // RelationshipDTO
	fuego.Put(g, "/relationships/{id}", h.UpdateRelationship)    // RelationshipDTO
	fuego.Delete(g, "/relationships/{id}", h.DeleteRelationship) // No Content
	fuego.Post(g, "/relationships", h.CreateRelationship)        // RelationshipDTO

	fuego.Get(g, "/identification-helper/{id}", h.GetIdentificationHelper)       // IdentificationHelperDTO
	fuego.Put(g, "/identification-helper/{id}", h.UpdateIdentificationHelper)    // IdentificationHelperDTO
	fuego.Delete(g, "/identification-helper/{id}", h.DeleteIdentificationHelper) // No Content
	fuego.Post(g, "/identification-helper", h.CreateIdentificationHelper)        // IdentificationHelperDTO
}
