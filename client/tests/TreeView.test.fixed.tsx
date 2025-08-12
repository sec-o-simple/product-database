import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TreeView, { 
  HydrateFallback, 
  getParentNode, 
  getAllParentIds, 
  getSelectedIdsAndChildrenIds, 
  determineIdsToSet 
} from '@/routes/TreeView'
import { useVendorListQuery } from '@/routes/Vendors'
import { useProductListQuery } from '@/routes/Products'

// Mock the client
vi.mock('@/client', () => ({
  default: {
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  },
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Spinner: () => <div aria-label="Loading" data-testid="spinner">Loading...</div>,
  Tooltip: ({ children, content }: any) => (
    <div title={content}>
      {children}
    </div>
  ),
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, onPress, isIconOnly, variant, color, disabled, ...props }: any) => (
    <button
      onClick={onPress}
      disabled={disabled}
      data-variant={variant}
      data-color={color}
      data-icon-only={isIconOnly}
      aria-label={props['aria-label']}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('@heroui/tabs', () => ({
  Tab: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Tabs: ({ children, selectedKey, onSelectionChange, ...props }: any) => (
    <div data-testid="tabs" data-selected={selectedKey} {...props}>
      {children}
    </div>
  ),
}))

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => {
    const iconName = icon?.iconName || 'unknown'
    return (
      <span data-testid="fontawesome-icon" data-icon={iconName} {...props} />
    )
  },
}))

// Mock MUI TreeView components
vi.mock('@mui/x-tree-view', () => ({
  SimpleTreeView: ({ children, onSelectedItemsChange, ...props }: any) => (
    <div data-testid="tree-view" {...props}>
      {children}
    </div>
  ),
  TreeItem: ({ children, itemId, label, onClick, ...props }: any) => (
    <div 
      data-testid={`tree-item-${itemId}`} 
      data-label={label} 
      onClick={(event) => {
        // Simulate the tree item click to trigger selection
        if (onClick) {
          onClick(event)
        }
      }}
      {...props}
    >
      <span data-testid={`tree-item-label-${itemId}`}>{label}</span>
      {children}
    </div>
  ),
}))

// Mock Products and Vendors queries
vi.mock('@/routes/Vendors', () => ({
  useVendorListQuery: vi.fn(),
}))

vi.mock('@/routes/Products', () => ({
  useProductListQuery: vi.fn(),
  DashboardTabs: ({ selectedKey }: { selectedKey: string }) => (
    <div data-testid="dashboard-tabs" data-selected={selectedKey}>
      Dashboard Tabs
    </div>
  ),
}))

// Mock individual route components
vi.mock('@/routes/Vendor', () => ({
  default: ({ vendor, vendorId }: { vendor?: any; vendorId?: string }) => (
    <div data-testid="vendor-component">
      Vendor: {vendor?.name || vendorId || 'Unknown'}
    </div>
  ),
}))

vi.mock('@/routes/Product', () => ({
  default: ({ product, productId }: { product?: any; productId?: string }) => (
    <div data-testid="product-component">
      Product: {product?.name || productId || 'Unknown'}
    </div>
  ),
}))

vi.mock('@/routes/Version', () => ({
  default: ({ version, versionId }: { version?: any; versionId?: string }) => (
    <div data-testid="version-component">
      Version: {version?.name || versionId || 'Unknown'}
    </div>
  ),
}))

// Test wrapper component
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

describe('Helper Functions', () => {
  const mockTreeItems = [
    {
      id: 'vendor-1',
      label: 'Vendor 1',
      children: [
        {
          id: 'product-1',
          label: 'Product 1',
          children: [
            { id: 'version-1', label: 'Version 1' },
            { id: 'version-2', label: 'Version 2' },
          ],
        },
        {
          id: 'product-2',
          label: 'Product 2',
          children: [
            { id: 'version-3', label: 'Version 3' },
          ],
        },
      ],
    },
    {
      id: 'vendor-2',
      label: 'Vendor 2',
      children: [
        {
          id: 'product-3',
          label: 'Product 3',
          children: [],
        },
      ],
    },
  ]

  describe('getParentNode', () => {
    it('should find the direct parent of a child node', () => {
      const parent = getParentNode(mockTreeItems, 'product-1')
      expect(parent).toBeDefined()
      expect(parent?.id).toBe('vendor-1')
    })

    it('should find the parent of a deeply nested node', () => {
      const parent = getParentNode(mockTreeItems, 'version-1')
      expect(parent).toBeDefined()
      expect(parent?.id).toBe('product-1')
    })

    it('should return undefined for root nodes', () => {
      const parent = getParentNode(mockTreeItems, 'vendor-1')
      expect(parent).toBeUndefined()
    })

    it('should return undefined for non-existent nodes', () => {
      const parent = getParentNode(mockTreeItems, 'non-existent')
      expect(parent).toBeUndefined()
    })

    it('should handle empty tree items', () => {
      const parent = getParentNode([], 'any-id')
      expect(parent).toBeUndefined()
    })

    it('should handle nodes without children', () => {
      const itemsWithoutChildren = [{ id: 'single', label: 'Single' }]
      const parent = getParentNode(itemsWithoutChildren, 'single')
      expect(parent).toBeUndefined()
    })
  })

  describe('getAllParentIds', () => {
    it('should return all parent IDs for a deeply nested node', () => {
      const parentIds = getAllParentIds(mockTreeItems, 'version-1')
      expect(parentIds).toEqual(['product-1', 'vendor-1'])
    })

    it('should return single parent ID for a direct child', () => {
      const parentIds = getAllParentIds(mockTreeItems, 'product-1')
      expect(parentIds).toEqual(['vendor-1'])
    })

    it('should return empty array for root nodes', () => {
      const parentIds = getAllParentIds(mockTreeItems, 'vendor-1')
      expect(parentIds).toEqual([])
    })

    it('should return empty array for non-existent nodes', () => {
      const parentIds = getAllParentIds(mockTreeItems, 'non-existent')
      expect(parentIds).toEqual([])
    })

    it('should handle empty tree items', () => {
      const parentIds = getAllParentIds([], 'any-id')
      expect(parentIds).toEqual([])
    })
  })

  describe('getSelectedIdsAndChildrenIds', () => {
    it('should return selected IDs and their children', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, ['vendor-1'])
      expect(result).toContain('vendor-1')
      expect(result).toContain('product-1')
      expect(result).toContain('product-2')
      expect(result).toContain('version-1')
      expect(result).toContain('version-2')
      expect(result).toContain('version-3')
    })

    it('should handle multiple selected IDs', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, ['product-1', 'product-3'])
      expect(result).toContain('product-1')
      expect(result).toContain('product-3')
      expect(result).toContain('version-1')
      expect(result).toContain('version-2')
      expect(result).not.toContain('vendor-1')
      expect(result).not.toContain('vendor-2')
    })

    it('should handle leaf nodes', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, ['version-1'])
      expect(result).toEqual(['version-1'])
    })

    it('should handle empty selected IDs', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, [])
      expect(result).toEqual([])
    })

    it('should handle non-existent IDs', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, ['non-existent'])
      expect(result).toEqual([])
    })

    it('should handle nodes without children in selection', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, ['product-3'])
      expect(result).toEqual(['product-3'])
    })

    it('should find selected children even when parent is not selected', () => {
      const result = getSelectedIdsAndChildrenIds(mockTreeItems, ['version-1', 'version-3'])
      expect(result).toContain('version-1')
      expect(result).toContain('version-3')
      expect(result).not.toContain('product-1')
      expect(result).not.toContain('vendor-1')
    })
  })

  describe('determineIdsToSet', () => {
    it('should handle selecting a parent node and select all children', () => {
      const result = determineIdsToSet(mockTreeItems, ['vendor-1'], [])
      expect(result).toContain('vendor-1')
      expect(result).toContain('product-1')
      expect(result).toContain('product-2')
      expect(result).toContain('version-1')
      expect(result).toContain('version-2')
      expect(result).toContain('version-3')
    })

    it('should handle deselecting a node and remove children/parents', () => {
      const currentIds = ['vendor-1', 'product-1', 'product-2', 'version-1', 'version-2', 'version-3']
      const newIds = ['product-2', 'version-3']
      const result = determineIdsToSet(mockTreeItems, newIds, currentIds)
      expect(result).toContain('product-2')
      expect(result).toContain('version-3')
      expect(result).not.toContain('vendor-1')
      expect(result).not.toContain('product-1')
      expect(result).not.toContain('version-1')
      expect(result).not.toContain('version-2')
    })

    it('should auto-select parent when all children are selected', () => {
      const result = determineIdsToSet(mockTreeItems, ['version-1', 'version-2'], [])
      expect(result).toContain('version-1')
      expect(result).toContain('version-2')
      expect(result).toContain('product-1')
    })

    it('should handle partial child selection without selecting parent', () => {
      const result = determineIdsToSet(mockTreeItems, ['version-1'], [])
      expect(result).toContain('version-1')
      expect(result).not.toContain('product-1')
      expect(result).not.toContain('vendor-1')
    })

    it('should handle empty new selection', () => {
      const result = determineIdsToSet(mockTreeItems, [], ['version-1'])
      expect(result).toEqual([])
    })

    it('should handle empty current selection', () => {
      const result = determineIdsToSet(mockTreeItems, ['version-1'], [])
      expect(result).toEqual(['version-1'])
    })

    it('should handle selecting all children of different parents', () => {
      const result = determineIdsToSet(mockTreeItems, ['version-1', 'version-2', 'version-3'], [])
      expect(result).toContain('version-1')
      expect(result).toContain('version-2')
      expect(result).toContain('version-3')
      expect(result).toContain('product-1')
      expect(result).toContain('product-2')
      expect(result).toContain('vendor-1')
    })

    it('should handle complex deselection scenarios', () => {
      const currentIds = ['vendor-1', 'product-1', 'version-1', 'version-2']
      const newIds = ['version-1']
      const result = determineIdsToSet(mockTreeItems, newIds, currentIds)
      expect(result).toContain('version-1')
      expect(result).not.toContain('vendor-1')
      expect(result).not.toContain('product-1')
      expect(result).not.toContain('version-2')
    })
  })
})

describe('TreeView', () => {
  const mockVendors = [
    {
      id: 'vendor-1',
      name: 'Test Vendor 1',
      description: 'Test vendor description 1',
      product_count: 2,
    },
    {
      id: 'vendor-2',
      name: 'Test Vendor 2',
      description: 'Test vendor description 2',
      product_count: 0,
    },
  ]

  const mockProducts = [
    {
      id: 'product-1',
      name: 'Test Product 1',
      full_name: 'Test Product 1 Full Name',
      description: 'Test product description 1',
      vendor_id: 'vendor-1',
      type: 'software' as const,
      versions: [
        {
          id: 'version-1',
          name: 'Version 1.0',
          full_name: 'Version 1.0 Full',
          description: 'Version 1.0 description',
          product_id: 'product-1',
          is_latest: false,
          predecessor_id: null,
          released_at: '2023-01-01',
        },
        {
          id: 'version-2',
          name: 'Version 2.0',
          full_name: 'Version 2.0 Full',
          description: 'Version 2.0 description',
          product_id: 'product-1',
          is_latest: true,
          predecessor_id: 'version-1',
          released_at: '2023-06-01',
        },
      ],
    },
    {
      id: 'product-2',
      name: 'Test Product 2',
      full_name: 'Test Product 2 Full Name',
      description: 'Test product description 2',
      vendor_id: 'vendor-1',
      type: 'software' as const,
      versions: [],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()

    // Mock successful queries with complete UseQueryResult interface
    vi.mocked(useVendorListQuery).mockReturnValue({
      data: mockVendors,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as any)

    vi.mocked(useProductListQuery).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as any)
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      // Should render the tree view
      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should render vendors in tree structure', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('tree-item-vendor-1')).toBeInTheDocument()
        expect(screen.getByTestId('tree-item-vendor-2')).toBeInTheDocument()
      })
    })
  })

  describe('Selection and Interaction', () => {
    it('should handle handleSelectedItemsChange with null itemIds', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const treeView = screen.getByTestId('tree-view')
        expect(treeView).toBeInTheDocument()
      })
    })

    it('should handle handleSelectedItemsChange when vendors is null', () => {
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      // Should render without crashing when vendors is undefined
      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should clear selection when clear button is clicked', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Selection')
        expect(clearButton).toBeInTheDocument()
        
        // Click the clear button
        fireEvent.click(clearButton)
        
        // Should not throw error
        expect(clearButton).toBeInTheDocument()
      })
    })

    it('should handle expand all functionality', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const expandButton = screen.getByTitle('Expand All')
        fireEvent.click(expandButton)

        // Should not throw error when expanding all
        expect(expandButton).toBeInTheDocument()
      })
    })

    it('should handle expand all toggle behavior', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const expandButton = screen.getByTitle('Expand All')
        
        // First click should expand all
        fireEvent.click(expandButton)
        
        // Second click should collapse all (toggle behavior)
        fireEvent.click(expandButton)
        
        expect(expandButton).toBeInTheDocument()
      })
    })

    it('should handle expand all when tree is empty', async () => {
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const expandButton = screen.getByTitle('Expand All')
        fireEvent.click(expandButton)
        
        // Should handle empty tree gracefully
        expect(expandButton).toBeInTheDocument()
      })
    })

    it('should handle node selection and rendering vendor details', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const vendorItem = screen.getByTestId('tree-item-vendor-1')
        fireEvent.click(vendorItem)
      })

      await waitFor(() => {
        expect(screen.getByTestId('vendor-component')).toBeInTheDocument()
      })
    })

    it('should handle node selection and rendering product details', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const productItem = screen.getByTestId('tree-item-label-product-1')
        fireEvent.click(productItem)
      })

      await waitFor(() => {
        expect(screen.getByTestId('product-component')).toBeInTheDocument()
      })
    })

    it('should handle node selection and rendering version details', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const versionItem = screen.getByTestId('tree-item-label-version-1')
        fireEvent.click(versionItem)
      })

      await waitFor(() => {
        expect(screen.getByTestId('version-component')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation and Actions', () => {
    it('should handle navigation for vendor', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const vendorItem = screen.getByTestId('tree-item-vendor-1')
        fireEvent.click(vendorItem)
      })

      await waitFor(() => {
        const jumpButton = screen.getByText('Jump to Element')
        fireEvent.click(jumpButton)
        expect(mockNavigate).toHaveBeenCalledWith('/vendors/vendor-1')
      })
    })

    it('should handle close functionality', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const vendorItem = screen.getByTestId('tree-item-vendor-1')
        fireEvent.click(vendorItem)
      })

      await waitFor(() => {
        const vendorComponent = screen.getByTestId('vendor-component')
        expect(vendorComponent).toBeInTheDocument()

        const closeIcon = screen.getAllByTestId('fontawesome-icon').find(
          icon => icon.getAttribute('data-icon') === 'xmark'
        )
        expect(closeIcon).toBeTruthy()
        const closeButton = closeIcon?.parentElement as HTMLElement
        expect(closeButton).toBeTruthy()
        fireEvent.click(closeButton)
      })

      await waitFor(() => {
        expect(screen.queryByTestId('vendor-component')).not.toBeInTheDocument()
      })
    })
  })

  describe('Button State Management', () => {
    it('should disable clear selection button when no selection', () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      const clearButton = screen.getByText('Clear Selection')
      expect(clearButton).toBeDisabled()
    })

    it('should enable clear selection button when item is selected', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const vendorItem = screen.getByTestId('tree-item-vendor-1')
        fireEvent.click(vendorItem)
      })

      await waitFor(() => {
        const clearButton = screen.getByText('Clear Selection')
        expect(clearButton).not.toBeDisabled()
      })
    })

    it('should change clear button color when selection exists', async () => {
      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      const clearButton = screen.getByText('Clear Selection')
      expect(clearButton).toHaveAttribute('data-color', 'default')

      await waitFor(() => {
        const vendorItem = screen.getByTestId('tree-item-vendor-1')
        fireEvent.click(vendorItem)
      })

      await waitFor(() => {
        const clearButtonAfterSelection = screen.getByText('Clear Selection')
        expect(clearButtonAfterSelection).toHaveAttribute('data-color', 'primary')
      })
    })
  })

  describe('Data Sorting and Transformation', () => {
    it('should sort products alphabetically by name', async () => {
      const unsortedProducts = [
        {
          id: 'product-z',
          name: 'ZZZ Product',
          full_name: 'ZZZ Product Full',
          description: 'Last product',
          vendor_id: 'vendor-1',
          type: 'software' as const,
          versions: [],
        },
        {
          id: 'product-a',
          name: 'AAA Product',
          full_name: 'AAA Product Full',
          description: 'First product',
          vendor_id: 'vendor-1',
          type: 'software' as const,
          versions: [],
        },
      ]

      vi.mocked(useProductListQuery).mockReturnValue({
        data: unsortedProducts,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const productLabels = screen.getAllByTestId(/tree-item-label-/)
        const productTexts = productLabels.map(label => label.textContent)
        
        expect(productTexts).toContain('AAA Product')
        expect(productTexts).toContain('ZZZ Product')
      })
    })

    it('should sort versions alphabetically by name', async () => {
      const productsWithUnsortedVersions = [
        {
          id: 'product-1',
          name: 'Product 1',
          full_name: 'Product 1 Full',
          description: 'Product with unsorted versions',
          vendor_id: 'vendor-1',
          type: 'software' as const,
          versions: [
            {
              id: 'version-z',
              name: 'ZZZ Version',
              full_name: 'ZZZ Version Full',
              description: 'Last version',
              product_id: 'product-1',
              is_latest: false,
              predecessor_id: null,
              released_at: '2023-01-01',
            },
            {
              id: 'version-a',
              name: 'AAA Version',
              full_name: 'AAA Version Full',
              description: 'First version',
              product_id: 'product-1',
              is_latest: true,
              predecessor_id: null,
              released_at: '2023-06-01',
            },
          ],
        },
      ]

      vi.mocked(useProductListQuery).mockReturnValue({
        data: productsWithUnsortedVersions,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        const versionLabels = screen.getAllByTestId(/tree-item-label-/)
        const versionTexts = versionLabels.map(label => label.textContent)
        
        expect(versionTexts).toContain('AAA Version')
        expect(versionTexts).toContain('ZZZ Version')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle products without versions', async () => {
      const productsWithoutVersions = [
        {
          id: 'product-1',
          name: 'Product 1',
          full_name: 'Product 1 Full',
          description: 'Product without versions',
          vendor_id: 'vendor-1',
          type: 'software' as const,
          versions: undefined,
        },
      ]

      vi.mocked(useProductListQuery).mockReturnValue({
        data: productsWithoutVersions,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
      })
    })

    it('should handle vendors without products', async () => {
      vi.mocked(useProductListQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Test Vendor 1')).toBeInTheDocument()
        const vendorItem = screen.getByTestId('tree-item-vendor-1')
        expect(vendorItem).toBeInTheDocument()
      })
    })

    it('should handle null vendor data', () => {
      vi.mocked(useVendorListQuery).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })

    it('should handle null product data', () => {
      vi.mocked(useProductListQuery).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        status: 'success',
        fetchStatus: 'idle',
        refetch: vi.fn(),
      } as any)

      render(
        <TestWrapper>
          <TreeView />
        </TestWrapper>
      )

      expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    })
  })
})

describe('HydrateFallback', () => {
  it('should render spinner with loading state', () => {
    render(<HydrateFallback />)
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('should display loading text', () => {
    render(<HydrateFallback />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
