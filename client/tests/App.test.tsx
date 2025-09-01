import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'

// Mock all route components
vi.mock('../src/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}))

vi.mock('../src/components/layout/TopBarLayout', () => ({
  default: () => <div data-testid="topbar-layout">TopBarLayout</div>,
}))

vi.mock('../src/components/layout/vendor/VendorLayout', () => ({
  default: () => <div data-testid="vendor-layout">VendorLayout</div>,
}))

vi.mock('../src/components/layout/product/ProductLayout', () => ({
  default: () => <div data-testid="product-layout">ProductLayout</div>,
}))

vi.mock('../src/components/layout/version/VersionLayout', () => ({
  default: () => <div data-testid="version-layout">VersionLayout</div>,
}))

vi.mock('../src/routes/Vendors', () => ({
  default: () => <div data-testid="vendors-page">Vendors Page</div>,
}))

vi.mock('../src/routes/Products', () => ({
  default: () => <div data-testid="products-page">Products Page</div>,
}))

vi.mock('../src/routes/TreeView', () => ({
  default: () => <div data-testid="tree-view-page">TreeView Page</div>,
}))

vi.mock('../src/routes/Vendor', () => ({
  default: () => <div data-testid="vendor-page">Vendor Page</div>,
}))

vi.mock('../src/routes/Product', () => ({
  default: () => <div data-testid="product-page">Product Page</div>,
}))

vi.mock('../src/routes/Version', () => ({
  default: () => <div data-testid="version-page">Version Page</div>,
}))

vi.mock('../src/components/layout/vendor/CreateEditVendor', () => ({
  default: () => <div data-testid="create-edit-vendor">CreateEditVendor</div>,
}))

vi.mock('../src/components/layout/product/CreateEditProduct', () => ({
  default: () => <div data-testid="create-edit-product">CreateEditProduct</div>,
}))

vi.mock('../src/components/layout/version/CreateEditVersion', () => ({
  default: () => <div data-testid="create-edit-version">CreateEditVersion</div>,
}))

vi.mock('../src/components/layout/product/CreateRelationship', () => ({
  default: () => (
    <div data-testid="create-relationship">CreateRelationship</div>
  ),
}))

vi.mock('../src/components/layout/vendor/VendorHistory', () => ({
  default: () => <div data-testid="vendor-history">VendorHistory</div>,
}))

vi.mock('../src/components/layout/product/ProductHistory', () => ({
  default: () => <div data-testid="product-history">ProductHistory</div>,
}))

vi.mock('../src/components/layout/version/VersionHistory', () => ({
  default: () => <div data-testid="version-history">VersionHistory</div>,
}))

vi.mock('../src/routes/IdentificationHelper/IdentificationOverview', () => ({
  default: () => (
    <div data-testid="identification-overview">IdentificationOverview</div>
  ),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render layout component', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render app without crashing on vendors route', () => {
    render(
      <MemoryRouter initialEntries={['/vendors']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render app without crashing on products route', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render app without crashing on tree route', () => {
    render(
      <MemoryRouter initialEntries={['/tree']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should handle background location for modal routes', () => {
    const backgroundLocation = {
      pathname: '/vendors',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    }
    const locationState = { backgroundLocation }

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/vendors/create', state: locationState }]}
      >
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('create-edit-vendor')).toBeInTheDocument()
  })

  it('should render app without crashing on vendor detail route', () => {
    render(
      <MemoryRouter initialEntries={['/vendors/123']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render app without crashing on product detail route', () => {
    render(
      <MemoryRouter initialEntries={['/products/456']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render app without crashing on version detail route', () => {
    render(
      <MemoryRouter initialEntries={['/product-versions/789']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should render modal routes when background location exists', () => {
    const backgroundLocation = {
      pathname: '/vendors',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    }
    const locationState = { backgroundLocation }

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/vendors', state: null },
          { pathname: '/vendors/123/edit', state: locationState },
        ]}
        initialIndex={1}
      >
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('create-edit-vendor')).toBeInTheDocument()
  })
})
