import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductFamilies, { 
  ProductFamilyChains, 
  ProductFamilyItem, 
  useProductFamilyListQuery, 
  useProductFamilyQuery,
  ProductFamily 
} from '@/routes/ProductFamilies'
import client from '@/client'

// Mock the client module
vi.mock('@/client', () => ({
  default: {
    useQuery: vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
    })),
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

// Mock useRefetchQuery
vi.mock('@/utils/useRefetchQuery', () => ({
  default: vi.fn(),
}))

// Mock DashboardTabs
vi.mock('@/components/DashboardTabs', () => ({
  DashboardTabs: ({ selectedKey }: { selectedKey: string }) => (
    <div data-testid="dashboard-tabs">
      <div data-testid="selected-key">{selectedKey}</div>
    </div>
  ),
}))

// Mock DataGrid
vi.mock('@/components/forms/DataGrid', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="data-grid">{children}</div>
  ),
}))

// Mock ListItem
vi.mock('@/components/forms/ListItem', () => ({
  default: ({ title, actions, onClick }: any) => (
    <div data-testid="list-item" onClick={onClick}>
      <div data-testid="list-item-title">{title}</div>
      <div data-testid="list-item-actions">{actions}</div>
    </div>
  ),
}))

// Mock IconButton
vi.mock('@/components/forms/IconButton', () => ({
  default: ({ icon, onPress }: any) => (
    <button data-testid="icon-button" onClick={onPress}>
      <span data-testid="icon">{icon?.iconName || 'edit'}</span>
    </button>
  ),
}))

// Mock CreateProductGroupButton
vi.mock('@/components/layout/productFamily/CreateEditProductFamily', () => ({
  CreateProductGroupButton: () => (
    <button data-testid="create-product-group-button">
      Create Product Group
    </button>
  ),
}))

// Mock FontAwesome icons
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <span data-testid="font-awesome-icon">
      {icon?.iconName || 'icon'}
    </span>
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

const mockProductFamilies: ProductFamily[] = [
  {
    id: '1',
    name: 'Root Family',
    parent_id: undefined,
    path: ['Root Family'],
  },
  {
    id: '2',
    name: 'Child Family',
    parent_id: '1',
    path: ['Root Family', 'Child Family'],
  },
  {
    id: '3',
    name: 'Another Root',
    parent_id: undefined,
    path: ['Another Root'],
  },
  {
    id: '4',
    name: 'Grandchild Family',
    parent_id: '2',
    path: ['Root Family', 'Child Family', 'Grandchild Family'],
  },
]

describe('ProductFamilyChains', () => {
  it('should render family chain for root item', () => {
    const item = mockProductFamilies[0]
    render(<ProductFamilyChains item={item} />)
    
    expect(screen.getByText('Root Family')).toBeInTheDocument()
    expect(screen.getByText('Root Family')).toHaveClass('font-bold')
  })

  it('should render family chain for nested item', () => {
    const item = mockProductFamilies[1]
    render(<ProductFamilyChains item={item} />)
    
    expect(screen.getByText('Root Family /')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toHaveClass('font-bold')
  })

  it('should render family chain for deeply nested item', () => {
    const item = mockProductFamilies[3]
    render(<ProductFamilyChains item={item} />)
    
    expect(screen.getByText('Root Family /')).toBeInTheDocument()
    expect(screen.getByText('Child Family /')).toBeInTheDocument()
    expect(screen.getByText('Grandchild Family')).toBeInTheDocument()
    expect(screen.getByText('Grandchild Family')).toHaveClass('font-bold')
  })
})

describe('ProductFamilyItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render product family item', () => {
    const productFamily = mockProductFamilies[0]
    render(
      <TestWrapper>
        <ProductFamilyItem productFamily={productFamily} />
      </TestWrapper>
    )

    expect(screen.getByTestId('list-item')).toBeInTheDocument()
    expect(screen.getByText('Root Family')).toBeInTheDocument()
    expect(screen.getByTestId('icon-button')).toBeInTheDocument()
  })

  it('should navigate to edit modal when clicking list item', () => {
    const productFamily = mockProductFamilies[0]
    render(
      <TestWrapper>
        <ProductFamilyItem productFamily={productFamily} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('list-item'))

    expect(mockNavigateToModal).toHaveBeenCalledWith(
      '/product-families/1/edit',
      '/product-families/1'
    )
  })

  it('should navigate to edit modal when clicking edit button', () => {
    const productFamily = mockProductFamilies[0]
    render(
      <TestWrapper>
        <ProductFamilyItem productFamily={productFamily} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByTestId('icon-button'))

    expect(mockNavigateToModal).toHaveBeenCalledWith(
      '/product-families/1/edit',
      '/product-families/1'
    )
  })

  it('should render nested product family item with proper chain', () => {
    const productFamily = mockProductFamilies[1]
    render(
      <TestWrapper>
        <ProductFamilyItem productFamily={productFamily} />
      </TestWrapper>
    )

    expect(screen.getByText('Root Family /')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toBeInTheDocument()
  })
})

describe('useProductFamilyListQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when no data', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      const { data } = useProductFamilyListQuery()
      return <div data-testid="result">{JSON.stringify(data)}</div>
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('result')).toHaveTextContent('[]')
  })

  it('should sort families hierarchically', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: mockProductFamilies,
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      const { data } = useProductFamilyListQuery()
      return (
        <div data-testid="result">
          {data.map(f => <div key={f.id} data-testid={`family-${f.id}`}>{f.name}</div>)}
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Should be sorted alphabetically at each level, with children after parents
    const familyElements = screen.getAllByTestId(/family-/)
    const familyOrder = familyElements.map(el => el.textContent)
    
    // Expected order: Another Root, Root Family, Child Family, Grandchild Family
    expect(familyOrder).toEqual([
      'Another Root',
      'Root Family', 
      'Child Family',
      'Grandchild Family'
    ])
  })

  it('should pass through other query properties', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: new Error('Test error'),
    } as any)

    const TestComponent = () => {
      const { isLoading, error } = useProductFamilyListQuery()
      return (
        <div>
          <div data-testid="loading">{isLoading.toString()}</div>
          <div data-testid="error">{error?.toString()}</div>
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('error')).toHaveTextContent('Test error')
  })
})

describe('useProductFamilyQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call useQuery with correct parameters', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: mockProductFamilies[0],
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      useProductFamilyQuery('test-id')
      return <div>test</div>
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'get',
      '/api/v1/product-families/{id}',
      {
        params: {
          path: {
            id: 'test-id',
          },
        },
      },
      {
        enabled: true,
      }
    )
  })

  it('should be disabled when id is empty', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      useProductFamilyQuery('')
      return <div>test</div>
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(mockUseQuery).toHaveBeenCalledWith(
      'get',
      '/api/v1/product-families/{id}',
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

describe('ProductFamilies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render empty state when no product families', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductFamilies />
      </TestWrapper>
    )

    expect(screen.getByTestId('dashboard-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('selected-key')).toHaveTextContent('productFamilies')
    expect(screen.getByTestId('create-product-group-button')).toBeInTheDocument()
    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
  })

  it('should render product families list', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: mockProductFamilies,
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductFamilies />
      </TestWrapper>
    )

    expect(screen.getByTestId('dashboard-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    
    // Should render all product families
    expect(screen.getByText('Root Family')).toBeInTheDocument()
    expect(screen.getByText('Child Family')).toBeInTheDocument()
    expect(screen.getByText('Another Root')).toBeInTheDocument()
    expect(screen.getByText('Grandchild Family')).toBeInTheDocument()
    
    // Should render all as list items
    expect(screen.getAllByTestId('list-item')).toHaveLength(4)
  })

  it('should render create product group button', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductFamilies />
      </TestWrapper>
    )

    const createButton = screen.getByTestId('create-product-group-button')
    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveTextContent('Create Product Group')
  })

  it('should handle null/undefined data gracefully', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <ProductFamilies />
      </TestWrapper>
    )

    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('list-item')).not.toBeInTheDocument()
  })
})

describe('sortProductFamiliesTree', () => {
  it('should handle empty array', () => {
    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      const { data } = useProductFamilyListQuery()
      return <div data-testid="count">{data.length}</div>
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('should sort single level families alphabetically', () => {
    const families = [
      { id: '2', name: 'Zebra', parent_id: undefined, path: ['Zebra'] },
      { id: '1', name: 'Alpha', parent_id: undefined, path: ['Alpha'] },
    ]

    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: families,
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      const { data } = useProductFamilyListQuery()
      return (
        <div>
          {data.map((f, i) => (
            <div key={f.id} data-testid={`family-${i}`}>{f.name}</div>
          ))}
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('family-0')).toHaveTextContent('Alpha')
    expect(screen.getByTestId('family-1')).toHaveTextContent('Zebra')
  })

  it('should handle complex tree structure', () => {
    const complexFamilies = [
      { id: '1', name: 'Root B', parent_id: undefined, path: ['Root B'] },
      { id: '2', name: 'Root A', parent_id: undefined, path: ['Root A'] },
      { id: '3', name: 'Child B of A', parent_id: '2', path: ['Root A', 'Child B of A'] },
      { id: '4', name: 'Child A of A', parent_id: '2', path: ['Root A', 'Child A of A'] },
      { id: '5', name: 'Grandchild of B', parent_id: '3', path: ['Root A', 'Child B of A', 'Grandchild of B'] },
    ]

    const mockUseQuery = vi.mocked(client.useQuery)
    mockUseQuery.mockReturnValue({
      data: complexFamilies,
      isLoading: false,
      error: null,
    } as any)

    const TestComponent = () => {
      const { data } = useProductFamilyListQuery()
      return (
        <div>
          {data.map((f, i) => (
            <div key={f.id} data-testid={`family-${i}`}>{f.name}</div>
          ))}
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Expected order: Root A, Child A of A, Child B of A, Grandchild of B, Root B
    expect(screen.getByTestId('family-0')).toHaveTextContent('Root A')
    expect(screen.getByTestId('family-1')).toHaveTextContent('Child A of A')
    expect(screen.getByTestId('family-2')).toHaveTextContent('Child B of A')
    expect(screen.getByTestId('family-3')).toHaveTextContent('Grandchild of B')
    expect(screen.getByTestId('family-4')).toHaveTextContent('Root B')
  })
})
