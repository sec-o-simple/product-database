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

	fuego.Get(vendors, "", h.ListVendors,
		option.Summary("List all vendors"),
		option.Description("Returns a list of all vendors in the system"))

	fuego.Get(vendors, "/{id}", h.GetVendor,
		option.Summary("Get vendor by ID"),
		option.Description("Returns details for a specific vendor"))

	fuego.Put(vendors, "/{id}", h.UpdateVendor,
		option.Summary("Update vendor"),
		option.Description("Updates an existing vendor's information"))

	fuego.Delete(vendors, "/{id}", h.DeleteVendor,
		option.Summary("Delete vendor"),
		option.Description("Removes a vendor from the system"))

	fuego.Post(vendors, "", h.CreateVendor,
		option.Summary("Create vendor"),
		option.Description("Creates a new vendor"))

	fuego.Get(vendors, "/{id}/products", h.ListVendorProducts,
		option.Summary("List vendor products"),
		option.Description("Returns all products associated with a vendor"))

	products := fuego.Group(api, "/products",
		option.Summary("Product operations"),
		option.Description("Operations for managing products"),
		option.Tags("products"),
	)

	fuego.Get(products, "", h.ListProducts,
		option.Summary("List all products"),
		option.Description("Returns a list of all products in the system"))

	fuego.Get(products, "/{id}", h.GetProduct,
		option.Summary("Get product by ID"),
		option.Description("Returns details for a specific product"))

	fuego.Put(products, "/{id}", h.UpdateProduct,
		option.Summary("Update product"),
		option.Description("Updates an existing product's information"))

	fuego.Delete(products, "/{id}", h.DeleteProduct,
		option.Summary("Delete product"),
		option.Description("Removes a product and its associated versions from the system"))

	fuego.Post(products, "", h.CreateProduct,
		option.Summary("Create product"),
		option.Description("Creates a new product under a vendor"))

	fuego.Get(products, "/{id}/versions", h.ListProductVersions,
		option.Summary("List product versions"),
		option.Description("Returns all versions associated with a specific product"))

	productVersions := fuego.Group(api, "/product-versions",
		option.Summary("Product version operations"),
		option.Description("Operations for managing product versions"),
		option.Tags("product-versions"),
	)

	fuego.Get(productVersions, "/{id}", h.GetProductVersion,
		option.Summary("Get product version by ID"),
		option.Description("Returns details for a specific product version"))

	fuego.Put(productVersions, "/{id}", h.UpdateProductVersion,
		option.Summary("Update product version"),
		option.Description("Updates an existing product version's information"))

	fuego.Delete(productVersions, "/{id}", h.DeleteProductVersion,
		option.Summary("Delete product version"),
		option.Description("Removes a product version and its associated data"))

	fuego.Post(productVersions, "", h.CreateProductVersion,
		option.Summary("Create product version"),
		option.Description("Creates a new version for a specific product"))

	fuego.Get(productVersions, "/{id}/relationships", h.ListRelationshipsByProductVersion,
		option.Summary("List version relationships"),
		option.Description("Returns all relationships associated with a product version"))

	fuego.Get(productVersions, "/{id}/identification-helpers", h.ListIdentificationHelpersByProductVersion,
		option.Summary("List identification helpers"),
		option.Description("Returns all identification helpers for a product version"))

	relationships := fuego.Group(api, "/relationships",
		option.Summary("Relationship operations"),
		option.Description("Operations for managing relationships"),
		option.Tags("relationships"),
	)

	fuego.Get(relationships, "/{id}", h.GetRelationship,
		option.Summary("Get relationship by ID"),
		option.Description("Returns details for a specific relationship"))

	fuego.Put(relationships, "/{id}", h.UpdateRelationship,
		option.Summary("Update relationship"),
		option.Description("Updates an existing relationship between product versions"))

	fuego.Delete(relationships, "/{id}", h.DeleteRelationship,
		option.Summary("Delete relationship"),
		option.Description("Removes a relationship between product versions"))

	fuego.Post(relationships, "", h.CreateRelationship,
		option.Summary("Create relationship"),
		option.Description("Creates a new relationship between two product versions"))

	identificationHelpers := fuego.Group(api, "/identification-helper",
		option.Summary("Identification helper operations"),
		option.Description("Operations for managing identification helpers"),
		option.Tags("identification-helpers"),
	)

	fuego.Get(identificationHelpers, "/{id}", h.GetIdentificationHelper,
		option.Summary("Get identification helper by ID"),
		option.Description("Returns details for a specific identification helper"))

	fuego.Put(identificationHelpers, "/{id}", h.UpdateIdentificationHelper,
		option.Summary("Update identification helper"),
		option.Description("Updates an existing identification helper's information"))

	fuego.Delete(identificationHelpers, "/{id}", h.DeleteIdentificationHelper,
		option.Summary("Delete identification helper"),
		option.Description("Removes an identification helper from the system"))

	fuego.Post(identificationHelpers, "", h.CreateIdentificationHelper,
		option.Summary("Create identification helper"),
		option.Description("Creates a new identification helper for a product version"))
}
