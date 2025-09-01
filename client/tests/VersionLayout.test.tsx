import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VersionLayout from '@/components/layout/version/VersionLayout'

// Mock the modules
vi.mock('@/routes/Version', () => ({
  DeleteVersion: ({ version }: { version: any }) => (
    <button data-testid="delete-version-button">Delete {version.name}</button>
  ),
  useVersionQuery: vi.fn(),
}))

vi.mock('@/routes/Product', () => ({
  useProductQuery: vi.fn(),
}))

vi.mock('@/utils/useRefetchQuery', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(),
}))

vi.mock('@/client', () => ({
  default: {
    useQuery: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
    useLocation: vi.fn(),
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn().mockImplementation((key: string, options?: any) => {
      if (key === 'product.label') return 'Product'
      if (key === 'version.label') return 'Version'
      if (key === 'form.fields.description') return 'Description'
      if (key === 'relationship.label') return `Relationship${options?.count ? `s (${options.count})` : ''}`
      if (key === 'identificationHelper.label') return `Identification Helper${options?.count ? `s (${options.count})` : ''}`
      if (key === 'common.edit') return 'Edit'
      if (key === 'goHome') return 'Go Home'
      if (key === 'goBack') return 'Go Back'
      if (key === 'common.createObject') return 'Create'
      if (key === 'common.emptyState.title') return 'Empty State'
      if (key === 'common.emptyState.description') return 'No items found'
      return key
    }),
  }),
}))

import { useVersionQuery } from '@/routes/Version'
import { useProductQuery } from '@/routes/Product'
import useRouter from '@/utils/useRouter'
import useRefetchQuery from '@/utils/useRefetchQuery'
import client from '@/client'
import { useParams, useLocation } from 'react-router-dom'

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )
  }
}

const mockVersion = {
  id: 'version-1',
  name: 'v1.0.0',
  description: 'Version 1.0.0',
  product_id: 'product-1',
}

const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  description: 'Test Description',
  vendor_id: 'vendor-1',
}

const mockRelationships = [
  {
    products: [
      {
        version_relationships: [
          { id: 'rel-1', type: 'DEPENDS_ON' },
          { id: 'rel-2', type: 'INCLUDES' },
        ],
      },
    ],
  },
]

const mockIdentificationHelpers = [
  { id: 'helper-1', type: 'PURL' },
  { id: 'helper-2', type: 'CPE' },
]

describe('VersionLayout', () => {
  const mockNavigateToModal = vi.fn()
  const mockNavigate = vi.fn()
  const mockUseRefetchQuery = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    const mockLocation = {
      pathname: '/product-versions/version-1',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    }

    vi.mocked(useRouter).mockReturnValue({
      location: mockLocation,
      navigate: mockNavigate,
      navigateToModal: mockNavigateToModal,
      goBack: vi.fn(),
      state: { backgroundLocation: undefined },
      params: { versionId: 'version-1' },
    })

    vi.mocked(useParams).mockReturnValue({ versionId: 'version-1' })
    vi.mocked(useLocation).mockReturnValue(mockLocation)

    vi.mocked(useVersionQuery).mockReturnValue({
      data: mockVersion,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(client.useQuery).mockImplementation((_method, path: any) => {
      if (typeof path === 'string' && path.includes('/relationships')) {
        return {
          data: mockRelationships,
          isLoading: false,
          error: null,
        }
      }
      if (typeof path === 'string' && path.includes('/identification-helpers')) {
        return {
          data: mockIdentificationHelpers,
          isLoading: false,
          error: null,
        }
      }
      return { data: null, isLoading: false, error: null }
    })

    vi.mocked(useRefetchQuery).mockImplementation(mockUseRefetchQuery)
  })

  it('should render version layout with basic structure', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // Check for key elements in the layout
    expect(screen.getByText('Product: Test Product')).toBeInTheDocument()
    expect(screen.getByText('Version: v1.0.0')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('should display version information correctly', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // The product and version should be displayed in the top bar
    expect(screen.getByText('Product: Test Product')).toBeInTheDocument()
    expect(screen.getByText('Version: v1.0.0')).toBeInTheDocument()
  })

  it('should display relationships count correctly', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // Check for relationships count display
    expect(screen.getByText('Relationships (2)')).toBeInTheDocument()
  })

  it('should display identification helpers count correctly', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    expect(screen.getByText('Identification Helpers (2)')).toBeInTheDocument()
  })

  it('should handle navigation to relationships', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    const relationshipsButton = screen.getByText('Relationships (2)').closest('button')
    expect(relationshipsButton).toBeInTheDocument()

    fireEvent.click(relationshipsButton!)
    expect(mockNavigate).toHaveBeenCalledWith('/product-versions/version-1')
  })

  it('should handle navigation to identification helpers', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    const helpersButton = screen.getByText('Identification Helpers (2)').closest('button')
    expect(helpersButton).toBeInTheDocument()

    fireEvent.click(helpersButton!)
    expect(mockNavigate).toHaveBeenCalledWith('/product-versions/version-1/identification-helpers')
  })

  it('should handle edit button click', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(mockNavigateToModal).toHaveBeenCalledWith(
      '/product-versions/version-1/edit',
      '/product-versions/version-1',
    )
  })

  it('should display delete version button', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    expect(screen.getByTestId('delete-version-button')).toBeInTheDocument()
    expect(screen.getByText('Delete v1.0.0')).toBeInTheDocument()
  })

  it('should show empty state when version is not found', () => {
    vi.mocked(useVersionQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    expect(screen.getByText('Empty State')).toBeInTheDocument()
  })

  it('should show empty state when product is not found', () => {
    vi.mocked(useProductQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    expect(screen.getByText('Empty State')).toBeInTheDocument()
  })

  it('should navigate away when version not found after loading', () => {
    vi.mocked(useVersionQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useProductQuery).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      error: null,
    } as any)

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    expect(mockNavigate).toHaveBeenCalledWith('/', {
      state: {
        shouldRefetch: true,
        message: 'Version not found.',
        type: 'error',
      },
    })
  })

  it('should handle missing description in version', () => {
    const versionWithoutDescription = { ...mockVersion, description: null }
    vi.mocked(useVersionQuery).mockReturnValue({
      data: versionWithoutDescription,
      isLoading: false,
      error: null,
    } as any)

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // The component should still render without crashing
    expect(screen.getByText('Product: Test Product')).toBeInTheDocument()
    expect(screen.getByText('Version: v1.0.0')).toBeInTheDocument()
  })

  it('should handle zero relationships correctly', () => {
    vi.mocked(client.useQuery).mockImplementation((_method, path: any) => {
      if (typeof path === 'string' && path.includes('/relationships')) {
        return {
          data: [],
          isLoading: false,
          error: null,
        }
      }
      if (typeof path === 'string' && path.includes('/identification-helpers')) {
        return {
          data: mockIdentificationHelpers,
          isLoading: false,
          error: null,
        }
      }
      return { data: null, isLoading: false, error: null }
    })

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // The component should render without errors even with zero relationships
    expect(screen.getByText('Product: Test Product')).toBeInTheDocument()
    expect(screen.getByText('Version: v1.0.0')).toBeInTheDocument()
  })

  it('should handle zero identification helpers correctly', () => {
    vi.mocked(client.useQuery).mockImplementation((_method, path: any) => {
      if (typeof path === 'string' && path.includes('/relationships')) {
        return {
          data: mockRelationships,
          isLoading: false,
          error: null,
        }
      }
      if (typeof path === 'string' && path.includes('/identification-helpers')) {
        return {
          data: [],
          isLoading: false,
          error: null,
        }
      }
      return { data: null, isLoading: false, error: null }
    })

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // The component should render without errors even with zero identification helpers
    expect(screen.getByText('Product: Test Product')).toBeInTheDocument()
    expect(screen.getByText('Version: v1.0.0')).toBeInTheDocument()
  })

  it('should not show AddRelationshipButton when not on relationships page', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/product-versions/version-1/identification-helpers',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    })

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    // The Create button should not be visible when not on relationships page
    expect(screen.queryByText('Create')).not.toBeInTheDocument()
  })

  it('should apply correct styling when on identification helpers page', () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/product-versions/version-1/identification-helpers',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    })

    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    const helpersButton = screen.getByText('Identification Helpers (2)').closest('button')
    expect(helpersButton).toHaveClass('bg-primary')
  })

  it('should use refetch queries for relationships and identification helpers', () => {
    const TestWrapper = createTestWrapper()
    render(
      <TestWrapper>
        <VersionLayout />
      </TestWrapper>,
    )

    expect(mockUseRefetchQuery).toHaveBeenCalledTimes(2) // Once for each query
  })
})
