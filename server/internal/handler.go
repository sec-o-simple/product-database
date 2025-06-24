package internal

import (
	"github.com/go-fuego/fuego"
)

type Handler struct {
	svc *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{svc: service}
}

// Vendors

func (h *Handler) ListVendors(c fuego.ContextNoBody) ([]VendorDTO, error) {
	vendors, err := h.svc.ListVendors(c.Request().Context())

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to fetch vendors", Err: err}
	}

	return vendors, nil
}

func (h *Handler) GetVendor(c fuego.ContextNoBody) (VendorDTO, error) {
	vendorID := c.PathParam("id")
	vendor, err := h.svc.GetVendorByID(c.Request().Context(), vendorID)

	if err != nil {
		return VendorDTO{}, fuego.NotFoundError{
			Title: "Vendor not found",
		}
	}

	return vendor, nil
}

func (h *Handler) ListVendorProducts(c fuego.ContextNoBody) ([]ProductDTO, error) {
	vendorID := c.PathParam("id")
	products, err := h.svc.ListVendorProducts(c.Request().Context(), vendorID)

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to fetch vendor products", Err: err}
	}

	return products, nil
}

func (h *Handler) UpdateVendor(c fuego.ContextWithBody[UpdateVendorDTO]) (VendorDTO, error) {
	vendorID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return VendorDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	vendor, err := h.svc.UpdateVendor(c.Request().Context(), vendorID, body)

	if err != nil {
		return VendorDTO{}, fuego.InternalServerError{Title: "Failed to update vendor", Err: err}
	}

	return vendor, nil
}

func (h *Handler) DeleteVendor(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteVendor(c.Request().Context(), c.PathParam("id"))

	return nil, err
}

func (h *Handler) CreateVendor(c fuego.ContextWithBody[CreateVendorDTO]) (VendorDTO, error) {
	body, err := c.Body()

	if err != nil {
		return VendorDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	vendor, err := h.svc.CreateVendor(c.Request().Context(), body)

	if err != nil {
		return VendorDTO{}, fuego.InternalServerError{Title: "Failed to create vendor", Err: err}
	}

	return vendor, nil
}

// Products

func (h *Handler) ListProducts(c fuego.ContextNoBody) ([]ProductDTO, error) {
	products, err := h.svc.ListProducts(c.Request().Context())

	if err != nil {
		return nil, err
	}

	return products, nil
}

func (h *Handler) GetProduct(c fuego.ContextNoBody) (ProductDTO, error) {
	productID := c.PathParam("id")
	product, err := h.svc.GetProductByID(c.Request().Context(), productID)

	if err != nil {
		return ProductDTO{}, fuego.NotFoundError{
			Title: "Product not found",
		}
	}

	return product, nil
}

func (h *Handler) ListProductVersions(c fuego.ContextNoBody) ([]ProductVersionDTO, error) {
	productID := c.PathParam("id")
	versions, err := h.svc.ListProductVersions(c.Request().Context(), productID)

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to fetch product versions", Err: err}
	}

	return versions, nil
}

func (h *Handler) UpdateProduct(c fuego.ContextWithBody[UpdateProductDTO]) (ProductDTO, error) {
	productID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return ProductDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	product, err := h.svc.UpdateProduct(c.Request().Context(), productID, body)

	if err != nil {
		return ProductDTO{}, fuego.InternalServerError{Title: "Failed to update product", Err: err}
	}

	return product, nil
}

func (h *Handler) DeleteProduct(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteProduct(c.Request().Context(), c.PathParam("id"))

	return nil, err
}

func (h *Handler) CreateProduct(c fuego.ContextWithBody[CreateProductDTO]) (ProductDTO, error) {
	body, err := c.Body()

	if err != nil {
		return ProductDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	product, err := h.svc.CreateProduct(c.Request().Context(), body)

	if err != nil {
		return ProductDTO{}, err
	}

	return product, nil
}

// Product Versions

func (h *Handler) GetProductVersion(c fuego.ContextNoBody) (ProductVersionDTO, error) {
	versionID := c.PathParam("id")
	version, err := h.svc.GetProductVersionByID(c.Request().Context(), versionID)

	if err != nil {
		return ProductVersionDTO{}, fuego.NotFoundError{
			Title: "Product version not found",
		}
	}

	return version, nil
}

func (h *Handler) ListRelationshipsByProductVersion(c fuego.ContextNoBody) ([]RelationshipGroupDTO, error) {
	productVersionID := c.PathParam("id")
	relationships, err := h.svc.GetRelationshipsByProductVersion(c.Request().Context(), productVersionID)

	if err != nil {
		return nil, fuego.InternalServerError{
			Title: "Failed to fetch relationships for product version",
			Err:   err,
		}
	}

	return relationships, nil
}

func (h *Handler) ListIdentificationHelpersByProductVersion(c fuego.ContextNoBody) ([]IdentificationHelperListItemDTO, error) {
	return nil, fuego.InternalServerError{
		Title: "Not implemented",
	}
}

func (h *Handler) UpdateProductVersion(c fuego.ContextWithBody[UpdateProductVersionDTO]) (ProductVersionDTO, error) {
	versionID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return ProductVersionDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	version, err := h.svc.UpdateProductVersion(c.Request().Context(), versionID, body)

	if err != nil {
		return ProductVersionDTO{}, fuego.InternalServerError{Title: "Failed to update product version", Err: err}
	}

	return version, nil
}

func (h *Handler) DeleteProductVersion(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteProductVersion(c.Request().Context(), c.PathParam("id"))

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to delete product version", Err: err}
	}

	return nil, nil
}

func (h *Handler) CreateProductVersion(c fuego.ContextWithBody[CreateProductVersionDTO]) (ProductVersionDTO, error) {
	body, err := c.Body()

	if err != nil {
		return ProductVersionDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	version, err := h.svc.CreateProductVersion(c.Request().Context(), body)

	if err != nil {
		return ProductVersionDTO{}, fuego.InternalServerError{Title: "Failed to create product version", Err: err}
	}

	return version, nil
}

// Relationships

func (h *Handler) GetRelationship(c fuego.ContextNoBody) (RelationshipDTO, error) {
	relationshipID := c.PathParam("id")
	relationship, err := h.svc.GetRelationshipByID(c.Request().Context(), relationshipID)

	if err != nil {
		return RelationshipDTO{}, fuego.NotFoundError{
			Title: "Relationship not found",
		}
	}

	return relationship, nil
}

func (h *Handler) UpdateRelationship(c fuego.ContextWithBody[UpdateRelationshipDTO]) (RelationshipDTO, error) {
	relationshipID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return RelationshipDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	relationship, err := h.svc.UpdateRelationship(c.Request().Context(), relationshipID, body)

	if err != nil {
		return RelationshipDTO{}, fuego.InternalServerError{Title: "Failed to update relationship", Err: err}
	}

	return relationship, nil
}

func (h *Handler) DeleteRelationship(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteRelationship(c.Request().Context(), c.PathParam("id"))

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to delete relationship", Err: err}
	}

	return nil, nil
}

func (h *Handler) CreateRelationship(c fuego.ContextWithBody[CreateRelationshipDTO]) (RelationshipDTO, error) {
	body, err := c.Body()

	if err != nil {
		return RelationshipDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	relationship, err := h.svc.CreateRelationship(c.Request().Context(), body)

	if err != nil {
		return RelationshipDTO{}, fuego.InternalServerError{Title: "Failed to create relationship", Err: err}
	}

	return relationship, nil
}

// Identification Helpers

func (h *Handler) GetIdentificationHelper(c fuego.ContextNoBody) (IdentificationHelperDTO, error) {
	helperID := c.PathParam("id")
	helper, err := h.svc.GetIdentificationHelperByID(c.Request().Context(), helperID)

	if err != nil {
		return IdentificationHelperDTO{}, fuego.NotFoundError{
			Title: "Identification helper not found",
		}
	}

	return helper, nil
}

func (h *Handler) UpdateIdentificationHelper(c fuego.ContextWithBody[UpdateIdentificationHelperDTO]) (IdentificationHelperDTO, error) {
	helperID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return IdentificationHelperDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}

	helper, err := h.svc.UpdateIdentificationHelper(c.Request().Context(), helperID, body)

	if err != nil {
		return IdentificationHelperDTO{}, fuego.InternalServerError{Title: "Failed to update identification helper", Err: err}
	}

	return helper, nil
}

func (h *Handler) DeleteIdentificationHelper(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteIdentificationHelper(c.Request().Context(), c.PathParam("id"))

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to delete identification helper", Err: err}
	}

	return nil, nil
}

func (h *Handler) CreateIdentificationHelper(c fuego.ContextWithBody[CreateIdentificationHelperDTO]) (IdentificationHelperDTO, error) {
	body, err := c.Body()
	if err != nil {
		return IdentificationHelperDTO{}, fuego.BadRequestError{Title: "Invalid request body", Err: err}
	}
	helper, err := h.svc.CreateIdentificationHelper(c.Request().Context(), body)
	if err != nil {
		return IdentificationHelperDTO{}, fuego.InternalServerError{Title: "Failed to create identification helper", Err: err}
	}
	return helper, nil
}
