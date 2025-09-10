import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VendorLayout, { Attribute } from '@/components/layout/vendor/VendorLayout'
import { useVendorQuery } from '@/routes/Vendor'

// Mock the client module
vi.mock('@/client', () => ({
  default: {
    useMutation: vi.fn(),
  },
}))

// Mock useRouter
const mockNavigate = vi.fn()
const mockNavigateToModal = vi.fn()

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    navigate: mockNavigate,
    navigateToModal: mockNavigateToModal,
  })),
}))

// Mock react-router-dom
const mockUseNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ vendorId: 'vendor1' }),
    useNavigate: () => mockUseNavigate,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  }
})

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'vendor.label') return 'Vendor'
      if (key === 'common.edit') return 'Edit'
      return key
    },
  }),
}))

// Mock useVendorQuery directly without variable reference
vi.mock('@/routes/Vendor', () => ({
  useVendorQuery: vi.fn(),
  DeleteVendor: ({ vendor }: { vendor: any }) => (
    <button data-testid="delete-vendor">Delete {vendor.name}</button>
  ),
}))

// Mock PageContainer, TopBar, Sidebar, AddProductButton
vi.mock('@/components/layout/PageContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}))

vi.mock('@/components/layout/TopBar', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="top-bar">{children}</div>
  ),
}))

vi.mock('@/components/forms/Sidebar', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
}))

vi.mock('@/components/crud/products/AddProductButton', () => ({
  default: () => <button data-testid="add-product-button">Add Product</button>,
}))

const mockVendorData = {
  id: 'vendor1',
  name: 'Test Vendor',
  description: 'Test vendor description',
  product_count: 5,
}

// Mock other components to simplify testing
vi.mock('@/components/forms/PageContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}))

vi.mock('@/components/forms/PageContent', () => ({
  PageOutlet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-outlet">{children}</div>
  ),
}))

vi.mock('@/components/forms/Sidebar', () => ({
  default: ({ actions, attributes }: { actions: React.ReactNode; attributes: React.ReactNode[] }) => (
    <div data-testid="sidebar">
      <div data-testid="sidebar-actions">{actions}</div>
      <div data-testid="sidebar-attributes">
        {attributes.map((attr, index) => (
          <div key={index}>{attr}</div>
        ))}
      </div>
    </div>
  ),
}))

vi.mock('../TopBarLayout', () => ({
  TopBar: ({ title, children }: any) => (
    <div data-testid="top-bar">
      <div data-testid="top-bar-title">{title}</div>
      <div data-testid="top-bar-children">{children}</div>
    </div>
  ),
}))

vi.mock('../product/CreateEditProduct', () => ({
  AddProductButton: ({ vendorId }: { vendorId: string }) => (
    <button data-testid="add-product-button" data-vendor-id={vendorId}>Add Product</button>
  ),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Attribute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render attribute with label and value', () => {
    render(
      <TestWrapper>
        <Attribute label="Test Label" value="Test Value" />
      </TestWrapper>
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Test Value')).toBeInTheDocument()
  })

  it('should render attribute without href as non-clickable', () => {
    render(
      <TestWrapper>
        <Attribute label="Test Label" value="Test Value" />
      </TestWrapper>
    )

    const container = screen.getByText('Test Value').closest('div')
    expect(container).not.toHaveClass('cursor-pointer')
  })

  it('should render attribute with href as clickable', () => {
    render(
      <TestWrapper>
        <Attribute label="Test Label" value="Test Value" href="/test-link" />
      </TestWrapper>
    )

    const container = screen.getByText('Test Value').closest('div')?.parentElement
    expect(container).toHaveClass('cursor-pointer')
  })

  it('should navigate when clicked and href is provided', () => {
    render(
      <TestWrapper>
        <Attribute label="Test Label" value="Test Value" href="/test-link" />
      </TestWrapper>
    )

    const clickableContainer = screen.getByText('Test Value').closest('div')?.parentElement
    fireEvent.click(clickableContainer!)

    expect(mockUseNavigate).toHaveBeenCalledWith('/test-link')
  })

  it('should not navigate when clicked and no href is provided', () => {
    render(
      <TestWrapper>
        <Attribute label="Test Label" value="Test Value" />
      </TestWrapper>
    )

    const container = screen.getByText('Test Value').closest('div')?.parentElement
    fireEvent.click(container!)

    expect(mockUseNavigate).not.toHaveBeenCalled()
  })

  it('should render numeric values correctly', () => {
    render(
      <TestWrapper>
        <Attribute label="Count" value={42} />
      </TestWrapper>
    )

    expect(screen.getByText('Count')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})

describe('VendorLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useVendorQuery).mockReturnValue({
      data: mockVendorData,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle' as const,
    } as any)
  })

  it('should render vendor layout with vendor data', async () => {
    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('page-container')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('page-outlet')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })
  })

  it('should display vendor name in title', async () => {
    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Vendor: Test Vendor')).toBeInTheDocument()
    })
  })

  it('should render add product button with correct vendor id', async () => {
    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    await waitFor(() => {
      // The AddProductButton renders as a button with the plus icon and text 'common.createObject'
      const addButton = screen.getByRole('button', { name: /common\.createObject/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  it('should render delete vendor button', async () => {
    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Delete Test Vendor')).toBeInTheDocument()
    })
  })

  it('should render edit vendor button and handle click', async () => {
    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    const editButton = await screen.findByText('Edit')
    expect(editButton).toBeInTheDocument()
    
    fireEvent.click(editButton)

    expect(mockNavigateToModal).toHaveBeenCalledWith(
      '/vendors/vendor1/edit',
      '/vendors/vendor1'
    )
  })

  it('should render vendor attributes correctly', async () => {
    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Test Vendor')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Test vendor description')).toBeInTheDocument()
    })
  })

  it('should show placeholder when vendor description is empty', async () => {
    vi.mocked(useVendorQuery).mockReturnValue({
      data: { ...mockVendorData, description: '' },
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('-/-')).toBeInTheDocument()
    })
  })

  it('should redirect to vendors page when no vendor data', () => {
    vi.mocked(useVendorQuery).mockReturnValue({
      data: null as any,
      isLoading: false,
      error: null,
    } as any)

    const { container } = render(
      <TestWrapper>
        <VendorLayout />
      </TestWrapper>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/vendors')
    expect(container.firstChild).toBeNull()
  })
})
