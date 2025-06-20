package internal

import (
	"github.com/go-fuego/fuego"
	"github.com/go-fuego/fuego/option"
)

func RegisterRoutes(s *fuego.Server, svc *Service) {
	h := NewHandler(svc)
	api := fuego.Group(s, "/api/v1")

	fuego.Get(api, "/health", func(c fuego.ContextNoBody) (string, error) {
		return "OK", nil
	})

	vendors := fuego.Group(api, "/vendors",
		option.Summary("Vendor operations"),
		option.Description("Operations for managing vendors"),
		option.Tags("vendors"),
	)
	fuego.Get(vendors, "", h.ListVendors)                      // []VendorDTO
	fuego.Get(vendors, "/{id}", h.GetVendor)                   // VendorDTO
	fuego.Put(vendors, "/{id}", h.UpdateVendor)                // VendorDTO
	fuego.Delete(vendors, "/{id}", h.DeleteVendor)             // No Content
	fuego.Post(vendors, "", h.CreateVendor)                    // VendorDTO
	fuego.Get(vendors, "/{id}/products", h.ListVendorProducts) // []ProductDTO

	products := fuego.Group(api, "/products",
		option.Summary("Product operations"),
		option.Description("Operations for managing products"),
		option.Tags("products"),
	)
	fuego.Get(products, "", h.ListProducts)                      // []ProductDTO
	fuego.Get(products, "/{id}", h.GetProduct)                   // ProductDTO
	fuego.Put(products, "/{id}", h.UpdateProduct)                // ProductDTO
	fuego.Delete(products, "/{id}", h.DeleteProduct)             // No Content
	fuego.Post(products, "", h.CreateProduct)                    // ProductDTO
	fuego.Get(products, "/{id}/versions", h.ListProductVersions) // []ProductVersionDTO

	productVersions := fuego.Group(api, "/product-versions",
		option.Summary("Product version operations"),
		option.Description("Operations for managing product versions"),
		option.Tags("product-versions"),
	)
	fuego.Get(productVersions, "/{id}", h.GetProductVersion)                                                // ProductVersionDTO
	fuego.Put(productVersions, "/{id}", h.UpdateProductVersion)                                             // ProductVersionDTO
	fuego.Delete(productVersions, "/{id}", h.DeleteProductVersion)                                          // No Content
	fuego.Post(productVersions, "", h.CreateProductVersion)                                                 // ProductVersionDTO
	fuego.Get(productVersions, "/{id}/relationships", h.ListRelationshipsByProductVersion)                  // []RelationshipGroupDTO
	fuego.Get(productVersions, "/{id}/identification-helpers", h.ListIdentificationHelpersByProductVersion) // []IdentificationHelperListItemDTO

	relationships := fuego.Group(api, "/relationships",
		option.Summary("Relationship operations"),
		option.Description("Operations for managing relationships"),
		option.Tags("relationships"),
	)
	fuego.Get(relationships, "/{id}", h.GetRelationship)       // RelationshipDTO
	fuego.Put(relationships, "/{id}", h.UpdateRelationship)    // RelationshipDTO
	fuego.Delete(relationships, "/{id}", h.DeleteRelationship) // No Content
	fuego.Post(relationships, "", h.CreateRelationship)        // RelationshipDTO

	identificationHelpers := fuego.Group(api, "/identification-helper",
		option.Summary("Identification helper operations"),
		option.Description("Operations for managing identification helpers"),
		option.Tags("identification-helpers"),
	)
	fuego.Get(identificationHelpers, "/{id}", h.GetIdentificationHelper)       // IdentificationHelperDTO
	fuego.Put(identificationHelpers, "/{id}", h.UpdateIdentificationHelper)    // IdentificationHelperDTO
	fuego.Delete(identificationHelpers, "/{id}", h.DeleteIdentificationHelper) // No Content
	fuego.Post(identificationHelpers, "", h.CreateIdentificationHelper)        // IdentificationHelperDTO
}
