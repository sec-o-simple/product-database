import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock all dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('../src/routes/Vendors', () => ({
  useVendorListQuery: vi.fn(),
}))

vi.mock('../src/routes/Products', () => ({
  useProductListQuery: vi.fn(),
}))

vi.mock('../src/components/DashboardTabs', () => ({
  DashboardTabs: ({ selectedKey }: { selectedKey: string }) => (
    <div data-testid="dashboard-tabs" data-selected-key={selectedKey}>
      Dashboard Tabs
    </div>
  ),
}))

vi.mock('../src/routes/Vendor', () => ({
  default: () => <div data-testid="vendor-component">Vendor Component</div>,
}))

vi.mock('../src/routes/Product', () => ({
  default: () => <div data-testid="product-component">Product Component</div>,
}))

vi.mock('../src/routes/Version', () => ({
  default: () => <div data-testid="version-component">Version Component</div>,
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => <span data-icon={icon?.iconName || 'icon'} />,
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>{children}</button>
  ),
}))

vi.mock('@heroui/react', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  Divider: ({ ...props }: any) => (
    <hr data-testid="divider" {...props} />
  ),
}))

vi.mock('@heroui/tabs', () => ({
  Tabs: ({ children, selectedKey, ...props }: any) => (
    <div data-testid="tabs" data-selected={selectedKey} {...props}>
      {children}
    </div>
  ),
  Tab: ({ title, href, ...props }: any) => (
    <a data-testid="tab" href={href} {...props}>
      {title}
    </a>
  ),
}))

vi.mock('@mui/x-tree-view', () => ({
  SimpleTreeView: ({ children }: any) => (
    <div data-testid="tree-view">{children}</div>
  ),
  TreeItem: ({ children, label }: any) => (
    <div data-testid="tree-item">
      <span>{label}</span>
      {children}
    </div>
  ),
}))

import TreeView, { HydrateFallback } from '../src/routes/TreeView'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
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

describe('TreeView Component Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    const { useVendorListQuery } = await import('../src/routes/Vendors')
    const { useProductListQuery } = await import('../src/routes/Products')
    
    vi.mocked(useVendorListQuery).mockReturnValue({
      data: [
        { id: 'vendor-1', name: 'Test Vendor 1' },
        { id: 'vendor-2', name: 'Test Vendor 2' },
      ],
      isLoading: false,
      error: null,
    } as any)
    
    vi.mocked(useProductListQuery).mockReturnValue({
      data: [
        { id: 'product-1', name: 'Test Product 1', vendorId: 'vendor-1' },
        { id: 'product-2', name: 'Test Product 2', vendorId: 'vendor-1' },
      ],
      isLoading: false,
      error: null,
    } as any)
  })

  describe('HydrateFallback', () => {
    it('should render spinner', () => {
      render(<HydrateFallback />)
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('TreeView Main Component', () => {
    it('should render with dashboard tabs and tree structure', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('dashboard-tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should render vendor items in tree', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByText('Test Vendor 1')).toBeInTheDocument()
      expect(screen.getByText('Test Vendor 2')).toBeInTheDocument()
    })

    it('should render control buttons', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByText('Clear Selection')).toBeInTheDocument()
      // Up and down buttons should be present
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(2)
    })
  })

  describe('Loading States', () => {
    it('should handle vendor loading state', async () => {
      const { useVendorListQuery } = await import('../src/routes/Vendors')
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      // The component should still render even when loading
      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should handle product loading state', async () => {
      const { useProductListQuery } = await import('../src/routes/Products')
      vi.mocked(useProductListQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      // The component should still render even when loading
      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should handle vendor loading error gracefully', async () => {
      const { useVendorListQuery } = await import('../src/routes/Vendors')
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load vendors'),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should handle empty vendor list', async () => {
      const { useVendorListQuery } = await import('../src/routes/Vendors')
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null vendor data', async () => {
      const { useVendorListQuery } = await import('../src/routes/Vendors')
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should handle products without vendor association', async () => {
      const { useProductListQuery } = await import('../src/routes/Products')
      vi.mocked(useProductListQuery).mockReturnValue({
        data: [
          { id: 'orphan-product', name: 'Orphan Product', vendorId: 'nonexistent' }
        ],
        isLoading: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should integrate with dashboard tabs', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      const dashboardTabs = screen.getByTestId('dashboard-tabs')
      expect(dashboardTabs).toBeInTheDocument()
      expect(dashboardTabs).toHaveAttribute('data-selected-key')
    })

    it('should render tree structure', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      const treeView = screen.getByTestId('tree-view')
      expect(treeView).toBeInTheDocument()
    })
  })
})
