package internal

import "github.com/go-fuego/fuego"

type Handler struct {
	svc *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{svc: service}
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

func (h *Handler) ListVendors(c fuego.ContextNoBody) ([]VendorListItemDTO, error) {
	vendors, err := h.svc.ListVendors(c.Request().Context())

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to fetch vendors", Err: err}
	}

	return vendors, nil
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

func (h *Handler) ListProducts(c fuego.ContextNoBody) ([]ProductDTO, error) {
	products, err := h.svc.ListProducts(c.Request().Context())

	if err != nil {
		return nil, err
	}

	return products, nil
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

func (h *Handler) ListProductVersions(c fuego.ContextNoBody) ([]ProductVersionDTO, error) {
	productID := c.PathParam("id")
	versions, err := h.svc.ListProductVersions(c.Request().Context(), productID)

	if err != nil {
		return nil, fuego.InternalServerError{Title: "Failed to fetch product versions", Err: err}
	}

	return versions, nil
}

func (h *Handler) GetVendorByID(c fuego.ContextNoBody) (VendorDTO, error) {
	vendorID := c.PathParam("id")
	vendor, err := h.svc.GetVendorByID(c.Request().Context(), vendorID)

	if err != nil {
		return VendorDTO{}, fuego.NotFoundError{
			Title: "Vendor not found",
		}
	}

	return vendor, nil
}

func (h *Handler) GetProductByID(c fuego.ContextNoBody) (ProductDTO, error) {
	productID := c.PathParam("id")
	product, err := h.svc.GetProductByID(c.Request().Context(), productID)

	if err != nil {
		return ProductDTO{}, fuego.NotFoundError{
			Title: "Product not found",
		}
	}

	return product, nil
}

func (h *Handler) GetProductVersionByID(c fuego.ContextNoBody) (ProductVersionDTO, error) {
	versionID := c.PathParam("versionID")
	version, err := h.svc.GetProductVersionByID(c.Request().Context(), versionID)

	if err != nil {
		return ProductVersionDTO{}, fuego.NotFoundError{
			Title: "Product version not found",
		}
	}

	return version, nil
}
