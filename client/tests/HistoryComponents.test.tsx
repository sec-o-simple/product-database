import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the useParams hook
const mockUseParams = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => mockUseParams(),
  }
})

// Mock the client
vi.mock('@/client', () => ({
  default: {
    useQuery: vi.fn(),
  },
}))

// Mock the Product and Vendor queries
vi.mock('../src/routes/Product', () => ({
  useProductQuery: vi.fn(),
}))

vi.mock('../src/routes/Vendor', () => ({
  useVendorQuery: vi.fn(),
}))

// Mock the History component
vi.mock('../src/components/layout/History', () => ({
  default: ({ updates }: { updates: any[] }) => (
    <div data-testid="history-component">History with {updates.length} updates</div>
  ),
}))

// Mock Breadcrumbs component
vi.mock('../src/components/forms/Breadcrumbs', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <nav data-testid="breadcrumbs">{children}</nav>
  ),
}))

// Mock BreadcrumbItem from HeroUI
vi.mock('@heroui/react', () => ({
  BreadcrumbItem: ({ children, href, isDisabled }: any) => (
    <span data-testid="breadcrumb-item" data-href={href} data-disabled={isDisabled}>
      {children}
    </span>
  ),
}))

// Import components after mocks
import ProductHistory from '../src/components/layout/product/ProductHistory'
import VendorHistory from '../src/components/layout/vendor/VendorHistory'
import VersionHistory from '../src/components/layout/version/VersionHistory'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ProductHistory', () => {
  it('should render with product and vendor data', async () => {
    const { useProductQuery } = await import('../src/routes/Product')
    const { useVendorQuery } = await import('../src/routes/Vendor')
    
    const mockedUseProductQuery = vi.mocked(useProductQuery)
    const mockedUseVendorQuery = vi.mocked(useVendorQuery)
    
    mockUseParams.mockReturnValue({ productId: 'product-1' })
    mockedUseProductQuery.mockReturnValue({
      data: { 
        id: 'product-1', 
        name: 'Test Product', 
        full_name: 'Test Product Full', 
        vendor_id: 'vendor-1',
        type: 'software' as const
      },
    } as any)
    mockedUseVendorQuery.mockReturnValue({
      data: { 
        id: 'vendor-1', 
        name: 'Test Vendor',
        description: 'Test vendor description',
        product_count: 1
      },
    } as any)

    render(
      <TestWrapper>
        <ProductHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('history-component')).toBeInTheDocument()
    
    // Check breadcrumb items
    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
    expect(breadcrumbItems).toHaveLength(5)
    expect(breadcrumbItems[0]).toHaveTextContent('Vendors')
    expect(breadcrumbItems[1]).toHaveTextContent('Test Vendor')
    expect(breadcrumbItems[2]).toHaveTextContent('Products')
    expect(breadcrumbItems[3]).toHaveTextContent('Test Product')
    expect(breadcrumbItems[4]).toHaveTextContent('History')
  })

  it('should render without product data', async () => {
    const { useProductQuery } = await import('../src/routes/Product')
    const { useVendorQuery } = await import('../src/routes/Vendor')
    
    const mockedUseProductQuery = vi.mocked(useProductQuery)
    const mockedUseVendorQuery = vi.mocked(useVendorQuery)
    
    mockUseParams.mockReturnValue({ productId: 'product-1' })
    mockedUseProductQuery.mockReturnValue({ data: undefined } as any)
    mockedUseVendorQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <ProductHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('history-component')).toBeInTheDocument()
    
    // Check that empty vendor/product names are handled
    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
    expect(breadcrumbItems[1]).toHaveTextContent('') // empty vendor name
    expect(breadcrumbItems[3]).toHaveTextContent('') // empty product name
  })

  it('should render without productId param', async () => {
    const { useProductQuery } = await import('../src/routes/Product')
    const { useVendorQuery } = await import('../src/routes/Vendor')
    
    const mockedUseProductQuery = vi.mocked(useProductQuery)
    const mockedUseVendorQuery = vi.mocked(useVendorQuery)
    
    mockUseParams.mockReturnValue({})
    mockedUseProductQuery.mockReturnValue({ data: undefined } as any)
    mockedUseVendorQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <ProductHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('history-component')).toBeInTheDocument()
  })

  it('should pass empty updates array to History component', async () => {
    const { useProductQuery } = await import('../src/routes/Product')
    const { useVendorQuery } = await import('../src/routes/Vendor')
    
    const mockedUseProductQuery = vi.mocked(useProductQuery)
    const mockedUseVendorQuery = vi.mocked(useVendorQuery)
    
    mockUseParams.mockReturnValue({ productId: 'product-1' })
    mockedUseProductQuery.mockReturnValue({ data: undefined } as any)
    mockedUseVendorQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <ProductHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('history-component')).toHaveTextContent('History with 0 updates')
  })

  it('should have correct breadcrumb hrefs', async () => {
    const { useProductQuery } = await import('../src/routes/Product')
    const { useVendorQuery } = await import('../src/routes/Vendor')
    
    const mockedUseProductQuery = vi.mocked(useProductQuery)
    const mockedUseVendorQuery = vi.mocked(useVendorQuery)
    
    mockUseParams.mockReturnValue({ productId: 'product-1' })
    mockedUseProductQuery.mockReturnValue({
      data: { 
        id: 'product-1', 
        name: 'Test Product', 
        full_name: 'Test Product Full', 
        vendor_id: 'vendor-1',
        type: 'software' as const
      },
    } as any)
    mockedUseVendorQuery.mockReturnValue({
      data: { 
        id: 'vendor-1', 
        name: 'Test Vendor',
        description: 'Test vendor description',
        product_count: 1
      },
    } as any)

    render(
      <TestWrapper>
        <ProductHistory />
      </TestWrapper>
    )

    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
    expect(breadcrumbItems[0]).toHaveAttribute('data-href', '/vendors')
    expect(breadcrumbItems[1]).toHaveAttribute('data-href', '/vendors/vendor-1')
    expect(breadcrumbItems[2]).toHaveAttribute('data-disabled', 'true')
    expect(breadcrumbItems[3]).toHaveAttribute('data-href', '/products/product-1')
    expect(breadcrumbItems[4]).not.toHaveAttribute('data-href')
  })
})

describe('VendorHistory', () => {
  it('should render with vendor data', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({ vendorId: 'vendor-1' })
    mockUseQuery.mockReturnValue({
      data: { 
        id: 'vendor-1', 
        name: 'Test Vendor',
        description: 'Test vendor description',
        product_count: 1
      },
    } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('history-component')).toBeInTheDocument()
    
    // Check breadcrumb items
    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
    expect(breadcrumbItems).toHaveLength(3)
    expect(breadcrumbItems[0]).toHaveTextContent('Vendors')
    expect(breadcrumbItems[1]).toHaveTextContent('Test Vendor')
    expect(breadcrumbItems[2]).toHaveTextContent('History')
  })

  it('should render without vendor data', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({ vendorId: 'vendor-1' })
    mockUseQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('history-component')).toBeInTheDocument()
    
    // Check that empty vendor name is handled
    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
    expect(breadcrumbItems[1]).toHaveTextContent('')
  })

  it('should render without vendorId param', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({})
    mockUseQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('history-component')).toBeInTheDocument()
  })

  it('should pass empty updates array to History component', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({ vendorId: 'vendor-1' })
    mockUseQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('history-component')).toHaveTextContent('History with 0 updates')
  })

  it('should make correct API call', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({ vendorId: 'vendor-1' })
    mockUseQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    expect(mockUseQuery).toHaveBeenCalledWith('get', '/api/v1/vendors/{id}', {
      params: {
        path: {
          id: 'vendor-1',
        },
      },
    })
  })

  it('should handle empty vendorId in API call', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({})
    mockUseQuery.mockReturnValue({ data: undefined } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    expect(mockUseQuery).toHaveBeenCalledWith('get', '/api/v1/vendors/{id}', {
      params: {
        path: {
          id: '',
        },
      },
    })
  })

  it('should have correct breadcrumb hrefs', async () => {
    const client = await import('@/client')
    const mockUseQuery = vi.mocked(client.default.useQuery)
    
    mockUseParams.mockReturnValue({ vendorId: 'vendor-1' })
    mockUseQuery.mockReturnValue({
      data: { 
        id: 'vendor-1', 
        name: 'Test Vendor',
        description: 'Test vendor description',
        product_count: 1
      },
    } as any)

    render(
      <TestWrapper>
        <VendorHistory />
      </TestWrapper>
    )

    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item')
    expect(breadcrumbItems[0]).toHaveAttribute('data-href', '/vendors')
    expect(breadcrumbItems[1]).toHaveAttribute('data-href', '/vendors/vendor-1')
    expect(breadcrumbItems[2]).not.toHaveAttribute('data-href')
  })
})

describe('VersionHistory', () => {
  it('should render basic layout', () => {
    render(
      <TestWrapper>
        <VersionHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('history-component')).toBeInTheDocument()
    
    // Check that it renders a div with the expected classes
    const container = screen.getByTestId('history-component').parentElement
    expect(container).toHaveClass('flex', 'w-full', 'grow', 'flex-col', 'gap-4', 'p-2')
  })

  it('should pass empty updates array to History component', () => {
    render(
      <TestWrapper>
        <VersionHistory />
      </TestWrapper>
    )

    expect(screen.getByTestId('history-component')).toHaveTextContent('History with 0 updates')
  })

  it('should not render breadcrumbs (commented out)', () => {
    render(
      <TestWrapper>
        <VersionHistory />
      </TestWrapper>
    )

    // Breadcrumbs should not be present as they are commented out
    expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
  })

  it('should have correct container structure', () => {
    render(
      <TestWrapper>
        <VersionHistory />
      </TestWrapper>
    )

    const historyComponent = screen.getByTestId('history-component')
    const container = historyComponent.parentElement
    
    expect(container).toBeInTheDocument()
    expect(container?.tagName).toBe('DIV')
    expect(historyComponent).toBeInTheDocument()
  })
})
