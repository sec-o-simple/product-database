import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CreateEditProduct from './components/layout/product/CreateEditProduct'
import CreateRelationship from './components/layout/product/CreateRelationship'
import { default as ProductHistory } from './components/layout/product/ProductHistory'
import ProductLayout from './components/layout/product/ProductLayout'
import CreateEditProductGroup from './components/layout/productFamily/CreateEditProductFamily'
import TopBarLayout from './components/layout/TopBarLayout'
import CreateEditVendor from './components/layout/vendor/CreateEditVendor'
import VendorHistory from './components/layout/vendor/VendorHistory'
import VendorLayout from './components/layout/vendor/VendorLayout'
import CreateEditVersion from './components/layout/version/CreateEditVersion'
import VersionHistory from './components/layout/version/VersionHistory'
import VersionLayout from './components/layout/version/VersionLayout'
import Layout from './Layout'
import IdentificationOverview from './routes/IdentificationHelper/IdentificationOverview'
import Product from './routes/Product'
import ProductFamilies from './routes/ProductFamilies'
import Products from './routes/Products'
import TreeView from './routes/TreeView'
import Vendor from './routes/Vendor'
import Vendors from './routes/Vendors'
import Version from './routes/Version'

function App() {
  const location = useLocation()
  const state = location.state

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/vendors" replace />} />

          <Route element={<TopBarLayout />}>
            <Route path="vendors" index element={<Vendors />} />
            <Route path="products" index element={<Products />} />
            <Route
              path="product-families"
              index
              element={<ProductFamilies />}
            />
            <Route path="tree" index element={<TreeView />} />
          </Route>

          <Route element={<VendorLayout />}>
            <Route path="vendors">
              <Route path=":vendorId">
                <Route index element={<Vendor />} />
                <Route path="history" element={<VendorHistory />} />
              </Route>
            </Route>
          </Route>

          <Route element={<ProductLayout />}>
            <Route path="products">
              <Route path=":productId">
                <Route index element={<Product />} />
                <Route path="history" element={<ProductHistory />} />
              </Route>
            </Route>
          </Route>

          <Route element={<VersionLayout />}>
            <Route path="product-versions">
              <Route path=":versionId">
                <Route index element={<Version />} />
                <Route path="history" element={<VersionHistory />} />

                <Route path="identification-helpers">
                  <Route index element={<IdentificationOverview />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>

      {state?.backgroundLocation && (
        <Routes>
          <Route path="vendors/create" element={<CreateEditVendor />} />
          <Route path="vendors/:vendorId/edit" element={<CreateEditVendor />} />

          <Route
            path="vendors/:vendorId/products/create"
            element={<CreateEditProduct />}
          />
          <Route
            path="products/:productId/edit"
            element={<CreateEditProduct />}
          />

          <Route
            path="products/:productId/versions/create"
            element={<CreateEditVersion />}
          />
          <Route
            path="product-versions/:versionId/edit"
            element={<CreateEditVersion />}
          />

          <Route
            path="product-families/create"
            element={<CreateEditProductGroup />}
          />
          <Route
            path="product-families/:familyId/edit"
            element={<CreateEditProductGroup />}
          />

          <Route
            path="product-versions/:versionId/relationships/create"
            element={<CreateRelationship />}
          />
          <Route
            path="product-versions/:versionId/relationships/:category/edit"
            element={<CreateRelationship />}
          />
        </Routes>
      )}
    </>
  )
}

export default App
