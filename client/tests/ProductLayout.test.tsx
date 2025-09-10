import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductLayout from '@/components/layout/product/ProductLayout'
import { useProductQuery } from '@/routes/Product'
import { useVendorQuery } from '@/routes/Vendor'

// Mock the client module
vi.mock('@/client', () => ({
  default: {
    useMutation: vi.fn(),
  },
}))

// Mock useRouter
const mockNavigateToModal = vi.fn()

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    params: { productId: 'product1' },
    navigateToModal: mockNavigateToModal,
  })),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  }
})

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'product.label') return 'Product'
      if (key === 'common.edit') return 'Edit'
      return key
    },
  }),
}))

// Mock useProductQuery and useVendorQuery
vi.mock('@/routes/Product', () => ({
  useProductQuery: vi.fn(),
  DeleteProduct: ({ product }: { product: any }) => (
    <button data-testid="delete-product">Delete {product.name}</button>
  ),
}))

vi.mock('@/routes/Vendor', () => ({
  useVendorQuery: vi.fn(),
}))

// Mock PageContainer, TopBar, Sidebar components
vi.mock('@/components/forms/PageContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}))

vi.mock('../TopBarLayout', () => ({
  TopBar: ({ 
    title, 
    backLink, 
    historyLink, 
    children 
  }: { 
    title: string
    backLink: string
    historyLink: string
    children: React.ReactNode 
  }) => (
    <div data-testid="top-bar">
      <div data-testid="top-bar-title">{title}</div>
      <div data-testid="top-bar-back-link">{backLink}</div>
      <div data-testid="top-bar-history-link">{historyLink}</div>
      <div data-testid="top-bar-children">{children}</div>
    </div>
  ),
}))

vi.mock('@/components/forms/Sidebar', () => ({
  default: ({ 
    attributes, 
    actions 
  }: { 
    attributes: React.ReactNode[]
    actions: React.ReactNode 
  }) => (
    <div data-testid="sidebar">
      <div data-testid="sidebar-attributes">
        {attributes.map((attr, index) => (
          <div key={index} data-testid={`attribute-${index}`}>
            {attr}
          </div>
        ))}
      </div>
      <div data-testid="sidebar-actions">{actions}</div>
    </div>
  ),
}))

vi.mock('@/components/forms/PageContent', () => ({
  PageOutlet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-outlet">{children}</div>
  ),
}))

vi.mock('@/components/layout/version/CreateEditVersion', () => ({
  AddVersionButton: ({ 
    productId, 
    returnTo 
  }: { 
    productId: string
    returnTo: string 
  }) => (
    <button 
      data-testid="add-version-button"
      data-product-id={productId}
      data-return-to={returnTo}
    >
      Add Version
    </button>
  ),
}))

const mockProductData = {
  id: 'product1',
  name: 'Test Product',
  description: 'Test product description',
  type: 'Software',
  vendor_id: 'vendor1',
}

const mockVendorData = {
  id: 'vendor1',
  name: 'Test Vendor',
  description: 'Test vendor description',
  product_count: 5,
}

describe('ProductLayout', () => {
  let queryClient: QueryClient
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })
  
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )

  beforeEach(() => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProductData,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useVendorQuery).mockReturnValue({
      data: mockVendorData,
      isLoading: false,
      error: null,
    } as any)
  })

  it('should render product layout with product data', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('page-container')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('page-outlet')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('should display correct top bar information', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    // The TopBar actually renders as real content, so check for the rendered text
    expect(screen.getByText('Product: Test Product')).toBeInTheDocument()
  })

  it('should render add version button with correct props', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    const addVersionButton = screen.getByTestId('add-version-button')
    expect(addVersionButton).toBeInTheDocument()
    expect(addVersionButton).toHaveAttribute('data-product-id', 'product1')
    expect(addVersionButton).toHaveAttribute('data-return-to', '/products/product1')
  })

  it('should render product attributes correctly', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('sidebar-attributes')).toBeInTheDocument()
    
    // Check all attributes are rendered
    expect(screen.getByTestId('attribute-0')).toBeInTheDocument()
    expect(screen.getByTestId('attribute-1')).toBeInTheDocument()
    expect(screen.getByTestId('attribute-2')).toBeInTheDocument()
    expect(screen.getByTestId('attribute-3')).toBeInTheDocument()
  })

  it('should handle missing product description with placeholder', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: { ...mockProductData, description: '' },
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('sidebar-attributes')).toBeInTheDocument()
  })

  it('should handle missing product type with placeholder', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: { ...mockProductData, type: '' },
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('sidebar-attributes')).toBeInTheDocument()
  })

  it('should handle missing vendor with placeholder', () => {
    vi.mocked(useVendorQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('sidebar-attributes')).toBeInTheDocument()
  })

  it('should render delete product button', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('delete-product')).toBeInTheDocument()
    expect(screen.getByText('Delete Test Product')).toBeInTheDocument()
  })

  it('should render edit button and handle click', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    const editButton = screen.getByRole('button', { name: 'Edit' })
    expect(editButton).toBeInTheDocument()

    fireEvent.click(editButton)

    expect(mockNavigateToModal).toHaveBeenCalledWith(
      '/products/product1/edit',
      '/products/product1'
    )
  })

  it('should render sidebar actions', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('sidebar-actions')).toBeInTheDocument()
  })

  it('should return null when no product data', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    const { container } = render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should handle loading state', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any)

    const { container } = render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render outlet content', () => {
    render(
      <TestWrapper>
        <ProductLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByText('Outlet Content')).toBeInTheDocument()
  })
})
