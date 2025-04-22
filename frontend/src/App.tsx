import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import TopBarLayout from './components/layout/TopBarLayout'
import Vendors from './routes/Vendors'
import Products from './routes/Products'
import Product from './routes/Product'
import Vendor from './routes/Vendor'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/vendors" replace />} />

        <Route element={<TopBarLayout />}>
          <Route path="vendors">
            <Route index element={<Vendors />} />
            <Route path=":id" element={<Vendor />} />
          </Route>

          <Route path="products">
            <Route index element={<Products />} />
            <Route path=":id" element={<Product />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
