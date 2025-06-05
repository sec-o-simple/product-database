import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import ProductLayout from './components/layout/product/ProductLayout'
import TopBarLayout from './components/layout/TopBarLayout'
import VendorLayout from './components/layout/vendor/VendorLayout'
import VersionLayout from './components/layout/version/VersionLayout'
import IdentificationOverview from './routes/IdentificationHelper/IdentificationOverview'
import Product from './routes/Product'
import Products from './routes/Products'
import TreeView from './routes/TreeView'
import Vendor from './routes/Vendor'
import Vendors from './routes/Vendors'
import Version from './routes/Version'
import History from './routes/History'
import Helper from './routes/IdentificationHelper/Helper'

function App() {
  return (
    <Router>
      <Routes>
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
            <Route path=":vendorId" element={<Vendor />} />
            <Route path="history" element={<History />} />
          </Route>
        </Route>

        <Route element={<ProductLayout />}>
          <Route path="products">
            <Route path=":productId">
              <Route index element={<Product />} />
              <Route path="history" element={<History />} />
            </Route>
          </Route>
        </Route>

        <Route element={<VersionLayout />}>
          <Route path="products/:productId/versions">
            <Route path=":versionId">
              <Route index element={<Version />} />

              <Route path="identification-helper">
                <Route index element={<IdentificationOverview />} />
                <Route path=":helperId" element={<Helper />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
