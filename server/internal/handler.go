package internal

import (
	"encoding/json"
	"strings"

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
		return nil, err
	}

	return vendors, nil
}

func (h *Handler) GetVendor(c fuego.ContextNoBody) (VendorDTO, error) {
	vendorID := c.PathParam("id")
	vendor, err := h.svc.GetVendorByID(c.Request().Context(), vendorID)

	if err != nil {
		return VendorDTO{}, err
	}

	return vendor, nil
}

func (h *Handler) ListVendorProducts(c fuego.ContextNoBody) ([]ProductDTO, error) {
	vendorID := c.PathParam("id")
	products, err := h.svc.ListVendorProducts(c.Request().Context(), vendorID)

	if err != nil {
		return nil, err
	}

	return products, nil
}

func (h *Handler) UpdateVendor(c fuego.ContextWithBody[UpdateVendorDTO]) (VendorDTO, error) {
	vendorID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return VendorDTO{}, err
	}

	vendor, err := h.svc.UpdateVendor(c.Request().Context(), vendorID, body)

	if err != nil {
		return VendorDTO{}, err
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
		return VendorDTO{}, err
	}

	vendor, err := h.svc.CreateVendor(c.Request().Context(), body)

	if err != nil {
		return VendorDTO{}, err
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
		return ProductDTO{}, err
	}

	return product, nil
}

func (h *Handler) ExportProductsTree(c fuego.ContextWithBody[any]) (map[string]interface{}, error) {
	idsCSV := c.Request().URL.Query().Get("ids")
	if strings.TrimSpace(idsCSV) == "" {
		return nil, nil
	}
	rawIDs := strings.Split(idsCSV, ",")

	ctx := c.Request().Context()
	var vendorNodes []interface{}

	for _, raw := range rawIDs {
		id := strings.TrimSpace(raw)
		if id == "" {
			continue
		}

		// fetch product, vendor, versions
		p, err := h.svc.GetProductByID(ctx, id)
		if err != nil {
			return nil, err
		}
		v, err := h.svc.GetVendorByID(ctx, *p.VendorID)
		if err != nil {
			return nil, err
		}
		vers, err := h.svc.ListProductVersions(ctx, id)
		if err != nil {
			return nil, err
		}

		var versionNodes []interface{}
		for _, ver := range vers {
			helpers, err := h.svc.GetIdentificationHelpersByProductVersion(ctx, ver.ID)
			if err != nil {
				return nil, err
			}

			var rawHelpers []json.RawMessage
			for _, helper := range helpers {
				rawHelpers = append(rawHelpers, json.RawMessage([]byte(helper.Metadata)))
			}

			prodMap := map[string]interface{}{
				"name":       v.Name + " " + p.Name + " " + ver.Name,
				"product_id": ver.ID,
			}

			if len(rawHelpers) > 0 {
				prodMap["product_identification_helper"] = rawHelpers
			}

			versionNodes = append(versionNodes, map[string]interface{}{
				"category": "product_version",
				"name":     ver.Name,
				"product":  prodMap,
			})
		}

		productNode := map[string]interface{}{
			"category": "product_name",
			"name":     p.Name,
			"product": map[string]interface{}{
				"name":       v.Name + " " + p.Name,
				"product_id": p.ID,
			},
		}

		if len(versionNodes) > 0 {
			productNode["branches"] = versionNodes
		}

		vendorNodes = append(vendorNodes, map[string]interface{}{
			"category": "vendor",
			"name":     v.Name,
			"branches": []interface{}{productNode},
		})
	}

	return map[string]interface{}{
		"product_tree": map[string]interface{}{
			"branches": vendorNodes,
		},
	}, nil
}

func (h *Handler) ListProductVersions(c fuego.ContextNoBody) ([]ProductVersionDTO, error) {
	productID := c.PathParam("id")
	versions, err := h.svc.ListProductVersions(c.Request().Context(), productID)

	if err != nil {
		return nil, err
	}

	return versions, nil
}

func (h *Handler) UpdateProduct(c fuego.ContextWithBody[UpdateProductDTO]) (ProductDTO, error) {
	productID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return ProductDTO{}, err
	}

	product, err := h.svc.UpdateProduct(c.Request().Context(), productID, body)

	if err != nil {
		return ProductDTO{}, err
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
		return ProductDTO{}, err
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
		return ProductVersionDTO{}, err
	}

	return version, nil
}

func (h *Handler) ListRelationshipsByProductVersion(c fuego.ContextNoBody) ([]RelationshipGroupDTO, error) {
	productVersionID := c.PathParam("id")
	relationships, err := h.svc.GetRelationshipsByProductVersion(c.Request().Context(), productVersionID)

	if err != nil {
		return nil, err
	}

	return relationships, nil
}

func (h *Handler) ListIdentificationHelpersByProductVersion(c fuego.ContextNoBody) ([]IdentificationHelperListItemDTO, error) {
	productVersionID := c.PathParam("id")
	helpers, err := h.svc.GetIdentificationHelpersByProductVersion(c.Request().Context(), productVersionID)

	if err != nil {
		return nil, err
	}

	return helpers, nil
}

func (h *Handler) UpdateProductVersion(c fuego.ContextWithBody[UpdateProductVersionDTO]) (ProductVersionDTO, error) {
	versionID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return ProductVersionDTO{}, err
	}

	version, err := h.svc.UpdateProductVersion(c.Request().Context(), versionID, body)

	if err != nil {
		return ProductVersionDTO{}, err
	}

	return version, nil
}

func (h *Handler) DeleteProductVersion(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteProductVersion(c.Request().Context(), c.PathParam("id"))

	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (h *Handler) CreateProductVersion(c fuego.ContextWithBody[CreateProductVersionDTO]) (ProductVersionDTO, error) {
	body, err := c.Body()

	if err != nil {
		return ProductVersionDTO{}, err
	}

	version, err := h.svc.CreateProductVersion(c.Request().Context(), body)

	if err != nil {
		return ProductVersionDTO{}, err
	}

	return version, nil
}

// Relationships

func (h *Handler) GetRelationship(c fuego.ContextNoBody) (RelationshipDTO, error) {
	relationshipID := c.PathParam("id")
	relationship, err := h.svc.GetRelationshipByID(c.Request().Context(), relationshipID)

	if err != nil {
		return RelationshipDTO{}, err
	}

	return relationship, nil
}

func (h *Handler) UpdateRelationship(c fuego.ContextWithBody[UpdateRelationshipDTO]) (any, error) {
	body, err := c.Body()
	if err != nil {
		return nil, err
	}

	err = h.svc.UpdateRelationship(c.Request().Context(), body)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"status": "success",
	}, nil
}

func (h *Handler) DeleteRelationshipsByVersionAndCategory(c fuego.ContextNoBody) (any, error) {
	versionID := c.PathParam("id")
	category := c.PathParam("category")

	err := h.svc.DeleteRelationshipsByVersionAndCategory(c.Request().Context(), versionID, category)

	if err != nil {
		return nil, err
	}

	return map[string]any{
		"status": "success",
	}, nil
}

func (h *Handler) CreateRelationship(c fuego.ContextWithBody[CreateRelationshipDTO]) (any, error) {
	body, err := c.Body()
	if err != nil {
		return nil, err
	}

	err = h.svc.CreateRelationship(c.Request().Context(), body)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"status": "success",
	}, nil
}

// Identification Helpers

func (h *Handler) GetIdentificationHelper(c fuego.ContextNoBody) (IdentificationHelperDTO, error) {
	helperID := c.PathParam("id")
	helper, err := h.svc.GetIdentificationHelperByID(c.Request().Context(), helperID)

	if err != nil {
		return IdentificationHelperDTO{}, err
	}

	return helper, nil
}

func (h *Handler) UpdateIdentificationHelper(c fuego.ContextWithBody[UpdateIdentificationHelperDTO]) (IdentificationHelperDTO, error) {
	helperID := c.PathParam("id")
	body, err := c.Body()

	if err != nil {
		return IdentificationHelperDTO{}, err
	}

	helper, err := h.svc.UpdateIdentificationHelper(c.Request().Context(), helperID, body)

	if err != nil {
		return IdentificationHelperDTO{}, err
	}

	return helper, nil
}

func (h *Handler) DeleteIdentificationHelper(c fuego.ContextNoBody) (any, error) {
	err := h.svc.DeleteIdentificationHelper(c.Request().Context(), c.PathParam("id"))

	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (h *Handler) CreateIdentificationHelper(c fuego.ContextWithBody[CreateIdentificationHelperDTO]) (IdentificationHelperDTO, error) {
	body, err := c.Body()
	if err != nil {
		return IdentificationHelperDTO{}, err
	}
	helper, err := h.svc.CreateIdentificationHelper(c.Request().Context(), body)
	if err != nil {
		return IdentificationHelperDTO{}, err
	}
	return helper, nil
}
