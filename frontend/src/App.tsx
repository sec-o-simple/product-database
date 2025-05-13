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
import Product from './routes/Product'
import Products from './routes/Products'
import TreeView from './routes/TreeView'
import Vendor from './routes/Vendor'
import Vendors from './routes/Vendors'
import Version from './routes/Version'

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
          </Route>
        </Route>

        <Route element={<ProductLayout />}>
          <Route path="products">
            <Route path=":productId" element={<Product />} />
          </Route>
        </Route>

        <Route element={<VersionLayout />}>
          <Route path="products/:productId/versions">
            <Route path=":versionId" element={<Version />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
