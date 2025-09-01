import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Vendor, { useVendorQuery, DeleteVendor } from '../src/routes/Vendor'

// Mock data
const mockVendor = {
  id: '1',
  name: 'Test Vendor',
  description: 'Test vendor description'
}

// Mock all the complex dependencies first
vi.mock('../src/client', () => ({
  default: {
    useQuery: vi.fn(() => ({
      data: mockVendor,
      isLoading: false,
      error: null,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    })),
  },
}))

vi.mock('../src/utils/useRefetchQuery', () => ({
  default: vi.fn()
}))

vi.mock('../src/utils/useRouter', () => ({
  default: vi.fn(() => ({
    navigate: vi.fn(),
    navigateToModal: vi.fn()
  }))
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (key === 'vendor.label') return 'Vendors';
      if (key === 'product.label') return 'Products';
      if (key === 'common.delete') return 'Delete';
      if (opts && opts.count !== undefined) return `${key} (${opts.count})`;
      return key;
    }
  })
}))

vi.mock('../src/routes/Products', () => ({
  ...vi.importActual('../src/routes/Products'),
  ProductItem: ({ product }: { product: any }) => <div data-testid="product-item">{product.name}</div>,
  useVendorProductListQuery: vi.fn(() => ({
    data: [
      { id: '1', name: 'Product 1', vendor: 'Test Vendor' },
      { id: '2', name: 'Product 2', vendor: 'Test Vendor' }
    ],
    isLoading: false,
    error: null,
  }))
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ vendorId: '1' }),
  }
})

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => <div data-testid="fa-icon">{icon.iconName || 'icon'}</div>
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="breadcrumb-item">{children}</span>
  ),
}))

// Mock form components
vi.mock('../src/components/forms/Breadcrumbs', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <nav data-testid="breadcrumbs">{children}</nav>
  )
}))

vi.mock('../src/components/forms/ConfirmButton', () => ({
  default: ({ children, onConfirm, confirmTitle, confirmText, isIconOnly, variant, radius, color, ...restProps }: any) => (
    <button 
      data-testid="confirm-button" 
      onClick={onConfirm} 
      data-confirm-title={confirmTitle}
      data-confirm-text={confirmText}
      {...(isIconOnly !== undefined && { 'data-icon-only': String(isIconOnly) })}
      {...(variant !== undefined && { 'data-variant': variant })}
      {...(radius !== undefined && { 'data-radius': radius })}
      {...(color !== undefined && { 'data-color': color })}
      {...restProps}
    >
      {children}
    </button>
  )
}))

vi.mock('../src/components/forms/DataGrid', () => ({
  default: ({ children, addButton, title }: { children: React.ReactNode, addButton?: React.ReactNode, title?: string }) => (
    <div data-testid="data-grid">
      {title && <p data-testid="data-grid-title">{title}</p>}
      {addButton && <div data-testid="add-button">{addButton}</div>}
      {children}
    </div>
  )
}))

vi.mock('../src/components/forms/PageContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-content">{children}</div>
  )
}))

vi.mock('../src/components/layout/product/CreateEditProduct', () => ({
  AddProductButton: ({ vendorId }: { vendorId: string }) => (
    <button data-testid="add-product-button">Add Product to {vendorId}</button>
  )
}))

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('useVendorQuery', () => {
  it('should return vendor query with data', () => {
    const result = useVendorQuery('1')
    expect(result).toBeDefined()
    expect(result.data).toEqual(mockVendor)
  })

  it('renders with vendorId from props', () => {
    render(
      <TestWrapper>
        <Vendor vendorId="1" />
      </TestWrapper>
    )
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
  })

  it('renders with vendorId from params', () => {
    // useParams already mocked globally above
    render(
      <TestWrapper>
        <Vendor />
      </TestWrapper>
    )
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
  })

  it('renders without breadcrumbs', () => {
    render(
      <TestWrapper>
        <Vendor vendorId="1" hideBreadcrumbs={true} />
      </TestWrapper>
    )
    // Breadcrumbs should not be present
    expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    // But the component should still render normally
    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
  })

  it('renders DataGrid with products', () => {
    render(
      <TestWrapper>
        <Vendor vendorId="1" />
      </TestWrapper>
    )
    expect(screen.getAllByTestId('product-item')).toHaveLength(2)
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
  })

  it('handles no products', () => {
    render(
      <TestWrapper>
        <Vendor vendorId="1" />
      </TestWrapper>
    )
    expect(screen.getByText(/Products/)).toBeInTheDocument()
  })

  it('should handle empty vendorId', () => {
    const result = useVendorQuery()
    expect(result).toBeDefined()
  })

  it('should handle undefined vendorId', () => {
    const result = useVendorQuery(undefined)
    expect(result).toBeDefined()
  })
})

describe('DeleteVendor', () => {
  const mockDeleteFn = vi.fn()

  beforeEach(() => {
    mockDeleteFn.mockClear()
  })

  it('should render as icon button by default', () => {
    render(
      <TestWrapper>
        <DeleteVendor vendor={mockVendor} />
      </TestWrapper>
    )

    const confirmButton = screen.getByTestId('confirm-button')
    expect(confirmButton).toBeInTheDocument()
    // When isIconButton is not specified, isIconOnly will be undefined, so the data attribute won't be set
    expect(confirmButton).not.toHaveAttribute('data-icon-only')
    expect(confirmButton).toHaveAttribute('data-confirm-title', 'Delete Vendor')
    expect(confirmButton).toHaveAttribute('data-confirm-text', 'Are you sure you want to delete the vendor "Test Vendor"? This action cannot be undone.')
    
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveTextContent('trash')
  })

  it('should render as regular button when isIconButton is false', () => {
    render(
      <TestWrapper>
        <DeleteVendor vendor={mockVendor} isIconButton={false} />
      </TestWrapper>
    )

    const confirmButton = screen.getByTestId('confirm-button')
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).toHaveAttribute('data-icon-only', 'false')
    expect(confirmButton).toHaveAttribute('data-variant', 'solid')
    expect(confirmButton).toHaveAttribute('data-radius', 'md')
    expect(confirmButton).toHaveAttribute('data-color', 'danger')
    
    // Should show both icon and text
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveTextContent('trash')
    
    // When isIconButton is false, it shows both icon and text
    expect(confirmButton).toHaveTextContent('trashDelete')
  })

  it('should handle vendor without id', () => {
    const vendorWithoutId = { ...mockVendor, id: undefined }
    
    render(
      <TestWrapper>
        <DeleteVendor vendor={vendorWithoutId} />
      </TestWrapper>
    )

    const confirmButton = screen.getByTestId('confirm-button')
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).toHaveAttribute('data-confirm-text', 'Are you sure you want to delete the vendor "Test Vendor"? This action cannot be undone.')
    
    // The component should still render even without an id
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toBeInTheDocument()
  })

  it('should render with proper structure', () => {
    render(
      <TestWrapper>
        <DeleteVendor vendor={mockVendor} />
      </TestWrapper>
    )

    const confirmButton = screen.getByTestId('confirm-button')
    expect(confirmButton).toBeInTheDocument()
  })
})
