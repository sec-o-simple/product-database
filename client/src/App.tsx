import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CreateEditProduct from './components/layout/product/CreateEditProduct'
import CreateRelationship from './components/layout/product/CreateRelationship'
import { default as ProductHistory } from './components/layout/product/ProductHistory'
import ProductLayout from './components/layout/product/ProductLayout'
import TopBarLayout from './components/layout/TopBarLayout'
import CreateEditVendor from './components/layout/vendor/CreateEditVendor'
import VendorHistory from './components/layout/vendor/VendorHistory'
import VendorLayout from './components/layout/vendor/VendorLayout'
import CreateEditVersion from './components/layout/version/CreateEditVersion'
import VersionHistory from './components/layout/version/VersionHistory'
import VersionLayout from './components/layout/version/VersionLayout'
import Helper from './routes/IdentificationHelper/Helper'
import IdentificationOverview from './routes/IdentificationHelper/IdentificationOverview'
import Product from './routes/Product'
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
        <Route path="/" element={<Navigate to="/vendors" replace />} />

        <Route element={<TopBarLayout />}>
          <Route path="vendors">
            <Route index element={<Vendors />} />
          </Route>

          <Route path="products">
            <Route index element={<Products />} />
          </Route>

          <Route path="tree">
            <Route index element={<TreeView />} />
          </Route>
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
          <Route path="products/:productId/versions">
            <Route path=":versionId">
              <Route index element={<Version />} />
              <Route path="history" element={<VersionHistory />} />

              <Route path="identification-helper">
                <Route index element={<IdentificationOverview />} />
                <Route path=":helperId" element={<Helper />} />
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
            path="products/:productId/versions/:versionId/edit"
            element={<CreateEditVersion />}
          />

          <Route
            path="products/:productId/versions/:versionId/relationships/create"
            element={<CreateRelationship />}
          />
        </Routes>
      )}
    </>
  )
}

export default App
