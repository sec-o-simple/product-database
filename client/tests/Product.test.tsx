import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Extend Vitest's expect with jest-dom matchers
import '@testing-library/jest-dom'

// Mock client with proper structure
vi.mock('@/client', () => {
  const mockUseQuery = vi.fn((_, endpoint) => {
    // Handle different endpoints
    if (endpoint === '/api/v1/products/{id}') {
      return {
        data: {
          id: 'test-product-id',
          name: 'Test Product',
          description: 'Test Description',
          vendor_id: 'test-vendor-id',
        },
        isLoading: false,
        error: null,
      }
    }
    
    if (endpoint === '/api/v1/products/{id}/versions') {
      return {
        data: [
          {
            id: 'test-version-1',
            name: 'Version 1.0.0',
            description: 'Test version description',
            release_date: '2024-01-01',
            is_latest: true,
          },
          {
            id: 'test-version-2',
            name: 'Version 1.1.0',
            description: 'Another test version',
            release_date: '2024-02-01',
            is_latest: false,
          },
        ],
        isLoading: false,
        error: null,
      }
    }

    // Default return for other queries
    return {
      data: null,
      isLoading: false,
      error: null,
    }
  })

  const mockUseMutation = vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }))

  return {
    default: {
      useQuery: mockUseQuery,
      useMutation: mockUseMutation,
    },
  }
})

// Mock utilities
vi.mock('@/utils/useRefetchQuery', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    navigate: vi.fn(),
    navigateToModal: vi.fn(),
    params: { productId: 'test-product-id' },
  })),
}))

// Mock other routes
vi.mock('@/routes/Vendor', () => ({
  useVendorQuery: vi.fn(() => ({
    data: {
      id: 'test-vendor-id',
      name: 'Test Vendor',
    },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/routes/Version', () => ({
  DeleteVersion: ({ version }: any) => (
    <button data-testid={`delete-version-${version.id}`}>
      Delete Version {version.name}
    </button>
  ),
}))

// Mock components
vi.mock('@/components/forms/Breadcrumbs', () => ({
  default: ({ children }: any) => <nav data-testid="breadcrumbs">{children}</nav>,
}))

vi.mock('@/components/forms/ConfirmButton', () => ({
  default: ({ children, onConfirm }: any) => (
    <button data-testid="confirm-button" onClick={onConfirm}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/forms/DataGrid', () => ({
  default: ({ children, addButton }: any) => (
    <div data-testid="data-grid">
      {addButton}
      <div>{children}</div>
    </div>
  ),
}))

vi.mock('@/components/forms/ListItem', () => ({
  default: ({ title, description, chips, onClick, actions }: any) => (
    <div data-testid="list-item" onClick={onClick}>
      <div data-testid="list-item-title">{title}</div>
      <div data-testid="list-item-description">{description}</div>
      {chips && <div data-testid="list-item-chips">{chips}</div>}
      {actions && <div data-testid="list-item-actions">{actions}</div>}
    </div>
  ),
}))

vi.mock('@/components/forms/IconButton', () => ({
  default: ({ onPress, ...props }: any) => (
    <button data-testid="icon-button" onClick={onPress} {...props}>
      Icon
    </button>
  ),
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  BreadcrumbItem: ({ children, href, isDisabled }: any) => (
    <span data-testid="breadcrumb-item" data-href={href} data-disabled={isDisabled}>
      {children}
    </span>
  ),
  Chip: ({ children, variant }: any) => (
    <span data-testid="chip" data-variant={variant}>
      {children}
    </span>
  ),
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => <span data-testid="font-awesome-icon" data-icon={icon.iconName} />,
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faEdit: { iconName: 'edit' },
  faTrash: { iconName: 'trash' },
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      if (key === 'vendor.label') return options?.count === 2 ? 'Vendors' : 'Vendor'
      if (key === 'product.label') return options?.count === 2 ? 'Products' : 'Product'
      if (key === 'version.label') return options?.count === 2 || (options?.count || 0) !== 1 ? 'Versions' : 'Version'
      if (key === 'common.noDescription') return 'No description available'
      if (key === 'common.delete') return 'Delete'
      return key
    },
  }),
}))

// Mock useParams hook separately
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    useParams: vi.fn(() => ({ productId: 'test-product-id' })),
  }
})

// Mock version components
vi.mock('@/components/layout/version/CreateEditVersion', () => ({
  AddVersionButton: () => <button data-testid="add-version-button">Add Version</button>,
}))

// Import component after mocks
import Product, { 
  useProductQuery, 
  useVersionListQuery, 
  DeleteProduct, 
  VersionItem 
} from '@/routes/Product'
import client from '@/client'

// Get the mocked functions for use in tests
const mockUseQuery = vi.mocked(client.useQuery)

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
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

describe('Product', () => {
  describe('useProductQuery', () => {
    it('should call useQuery with correct parameters when productId is provided', () => {
      useProductQuery('test-product-id')

      expect(mockUseQuery).toHaveBeenCalledWith(
        'get',
        '/api/v1/products/{id}',
        {
          params: {
            path: {
              id: 'test-product-id',
            },
          },
        },
        {
          enabled: true,
        }
      )
    })

    it('should disable query when productId is empty', () => {
      useProductQuery('')

      expect(mockUseQuery).toHaveBeenCalledWith(
        'get',
        '/api/v1/products/{id}',
        {
          params: {
            path: {
              id: '',
            },
          },
        },
        {
          enabled: false,
        }
      )
    })
  })

  describe('useVersionListQuery', () => {
    it('should call useQuery with correct parameters when productId is provided', () => {
      useVersionListQuery('test-product-id')

      expect(mockUseQuery).toHaveBeenCalledWith(
        'get',
        '/api/v1/products/{id}/versions',
        {
          params: {
            path: {
              id: 'test-product-id',
            },
          },
        },
        {
          enabled: true,
        }
      )
    })
  })

  describe('DeleteProduct', () => {
    const mockProduct = {
      id: 'test-product-id',
      name: 'Test Product',
      description: 'Test Description',
      vendor_id: 'test-vendor-id',
    }

    it('should render delete button', () => {
      render(
        <TestWrapper>
          <DeleteProduct product={mockProduct} />
        </TestWrapper>
      )

      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('VersionItem', () => {
    const mockVersion = {
      id: 'test-version-id',
      name: 'Version 1.0.0',
      description: 'Test version description',
      release_date: '2024-01-01',
      is_latest: true,
    }

    it('should render version item with name', () => {
      render(
        <TestWrapper>
          <VersionItem version={mockVersion} />
        </TestWrapper>
      )

      expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
    })
  })

  describe('Product Main Component', () => {
    it('should render data grid', () => {
      render(
        <TestWrapper>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    })
  })
})
