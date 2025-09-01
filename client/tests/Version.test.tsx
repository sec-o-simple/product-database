import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  useVersionQuery, 
  DeleteVersion, 
  DeleteRelationshipGroup 
} from '@/routes/Version'
import client from '@/client'

// Mock the client module
vi.mock('@/client', () => ({
  default: {
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  },
}))

// Mock useRouter
const mockNavigate = vi.fn()
const mockNavigateToModal = vi.fn()
const mockParams = { versionId: '1', productId: 'prod1' }

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    params: mockParams,
    navigate: mockNavigate,
    navigateToModal: mockNavigateToModal,
  })),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ versionId: '1' }),
  }
})

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => <span data-testid="icon">{icon.iconName}</span>,
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'vendor.label' && options?.count === 2) return 'Vendors'
      if (key === 'product.label' && options?.count === 2) return 'Products'
      if (key === 'version.label' && options?.count === 2) return 'Versions'
      if (key === 'relationship.label' && options?.count === 2) return 'Relationships'
      if (key === 'common.delete') return 'Delete'
      if (key === 'common.confirmDeleteTitle') return 'Confirm Delete'
      if (key === 'common.confirmDeleteText') return `Are you sure you want to delete ${options?.resource}?`
      if (key === 'relationship.confirmDeleteResource') return `${options?.category} (${options?.totalVersions} versions)`
      if (key.startsWith('relationship.category.')) return key.split('.').pop()
      return key
    },
  }),
}))

// Mock useRefetchQuery
vi.mock('@/utils/useRefetchQuery', () => ({
  default: vi.fn(),
}))

const mockVersion = {
  id: '1',
  name: 'Version 1.0',
  product_id: 'prod1',
}

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

describe('useVersionQuery', () => {
  const mockUseQuery = vi.mocked(client.useQuery)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue({
      data: mockVersion,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)
  })

  it('should call useQuery with correct parameters', () => {
    useVersionQuery('1')

    expect(mockUseQuery).toHaveBeenCalledWith(
      'get',
      '/api/v1/product-versions/{id}',
      {
        params: {
          path: {
            id: '1',
          },
        },
      },
      {
        enabled: true,
      },
    )
  })

  it('should handle undefined versionId', () => {
    useVersionQuery(undefined)

    expect(mockUseQuery).toHaveBeenCalledWith(
      'get',
      '/api/v1/product-versions/{id}',
      {
        params: {
          path: {
            id: '',
          },
        },
      },
      {
        enabled: false,
      },
    )
  })
})

describe('DeleteVersion', () => {
  const mockUseMutation = vi.mocked(client.useMutation)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      data: null,
      error: null,
    } as any)
  })

  it('should render as regular button by default', () => {
    render(
      <TestWrapper>
        <DeleteVersion version={mockVersion} />
      </TestWrapper>
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toHaveTextContent('trash')
  })

  it('should render as icon button when isIconButton is true', () => {
    render(
      <TestWrapper>
        <DeleteVersion version={mockVersion} isIconButton={true} />
      </TestWrapper>
    )

    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    expect(screen.getByTestId('icon')).toHaveTextContent('trash')
  })

  it('should call mutation when ConfirmButton is used', async () => {
    render(
      <TestWrapper>
        <DeleteVersion version={mockVersion} returnTo="/custom-path" />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(mockUseMutation).toHaveBeenCalledWith('delete', '/api/v1/product-versions/{id}')
  })
})

describe('DeleteRelationshipGroup', () => {
  const mockUseMutation = vi.mocked(client.useMutation)
  const mockOnDelete = vi.fn()

  const mockGroup = {
    category: 'default_component_of',
    products: [
      {
        version_relationships: [
          { id: 'rel1' },
          { id: 'rel2' },
        ]
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      data: null,
      error: null,
    } as any)
  })

  it('should render delete button', () => {
    render(
      <TestWrapper>
        <DeleteRelationshipGroup 
          version={mockVersion} 
          group={mockGroup} 
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId('icon')).toHaveTextContent('trash')
  })

  it('should show loading state when mutation is pending', () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isSuccess: false,
      isError: false,
      data: null,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <DeleteRelationshipGroup 
          version={mockVersion} 
          group={mockGroup} 
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  it('should call correct mutation endpoint', () => {
    render(
      <TestWrapper>
        <DeleteRelationshipGroup 
          version={mockVersion} 
          group={mockGroup} 
          onDelete={mockOnDelete}
        />
      </TestWrapper>
    )

    expect(mockUseMutation).toHaveBeenCalledWith(
      'delete',
      '/api/v1/product-versions/{id}/relationships/{category}',
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
  })
})
