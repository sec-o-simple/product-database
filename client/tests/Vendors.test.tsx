import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Extend Vitest's expect with jest-dom matchers
import '@testing-library/jest-dom'

// Mock data
const mockVendors = [
  {
    id: '1',
    name: 'Test Vendor 1',
    description: 'Test Description 1',
    product_count: 5,
  },
  {
    id: '2', 
    name: 'Test Vendor 2',
    description: 'Test Description 2',
    product_count: 0,
  },
]

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Chip: ({ children, ...props }: any) => (
    <span data-testid="chip" {...props}>
      {children}
    </span>
  ),
  Divider: ({ ...props }: any) => (
    <hr data-testid="divider" {...props} />
  ),
}))

// Mock HeroUI tabs
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

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ ...props }: any) => <span data-testid="font-awesome-icon" {...props} />,
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faEdit: 'faEdit',
}))

// Mock client with proper structure - using vi.fn() to allow mock changes
vi.mock('@/client', () => {
  const mockUseQuery = vi.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Test Vendor 1',
        description: 'Test Description 1',
        product_count: 5,
      },
      {
        id: '2', 
        name: 'Test Vendor 2',
        description: 'Test Description 2',
        product_count: 0,
      },
    ],
    isLoading: false,
    error: null,
  }))

  return {
    default: {
      useQuery: mockUseQuery,
    },
  }
})

// Mock components
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

// Mock utilities
vi.mock('@/utils/useRefetchQuery', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    navigate: vi.fn(),
    navigateToModal: vi.fn(),
  })),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock vendor components
vi.mock('@/components/layout/vendor/CreateEditVendor', () => ({
  CreateVendorButton: () => <button data-testid="create-vendor-button">Create Vendor</button>,
}))

vi.mock('../src/routes/Vendor', () => ({
  DeleteVendor: ({ vendor }: any) => (
    <button data-testid={`delete-vendor-${vendor.id}`}>Delete {vendor.name}</button>
  ),
}))

// Mock Products with SelectableContext
vi.mock('../src/routes/Products', () => {
  const { createContext } = require('react')
  const mockContext = createContext({
    selectable: false,
    toggleSelectable: vi.fn(),
    selected: [],
    setSelected: vi.fn(),
  })
  
  return {
    DashboardTabs: ({ selectedKey }: { selectedKey: string }) => (
      <div data-testid="dashboard-tabs" data-selected={selectedKey}>Dashboard Tabs</div>
    ),
    SelectableContext: mockContext,
  }
})

// Import component after mocks
import Vendors, { VendorItem } from '../src/routes/Vendors'
import client from '@/client'

// Get the mocked function for use in tests
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

describe('Vendors', () => {
  describe('VendorItem Component', () => {
    it('should render vendor with description and product count', () => {
      render(
        <TestWrapper>
          <VendorItem vendor={mockVendors[0]} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Vendor 1')).toBeInTheDocument()
      expect(screen.getByText('Test Description 1')).toBeInTheDocument()
      expect(screen.getByText('5 Products')).toBeInTheDocument()
    })

    it('should render vendor without product count chip when count is 0', () => {
      render(
        <TestWrapper>
          <VendorItem vendor={mockVendors[1]} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Vendor 2')).toBeInTheDocument()
      expect(screen.getByText('Test Description 2')).toBeInTheDocument()
      expect(screen.queryByText('0 Products')).not.toBeInTheDocument()
    })

    it('should render vendor with empty description', () => {
      const vendorWithoutDescription = {
        id: '3',
        name: 'Test Vendor 3',
        description: '',
        product_count: 2,
      }

      render(
        <TestWrapper>
          <VendorItem vendor={vendorWithoutDescription} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Vendor 3')).toBeInTheDocument()
      expect(screen.getByText('common.noDescription')).toBeInTheDocument()
      expect(screen.getByText('2 Products')).toBeInTheDocument()
    })

    it('should render delete button', () => {
      render(
        <TestWrapper>
          <VendorItem vendor={mockVendors[0]} />
        </TestWrapper>
      )

      expect(screen.getByTestId('delete-vendor-1')).toBeInTheDocument()
    })
  })

  describe('Vendors Main Component', () => {
    it('should render dashboard tabs with vendors selected', () => {
      render(
        <TestWrapper>
          <Vendors />
        </TestWrapper>
      )

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-selected', 'vendors')
    })

    it('should render create vendor buttons', () => {
      render(
        <TestWrapper>
          <Vendors />
        </TestWrapper>
      )

      // Should have 2 create vendor buttons (one in header, one in DataGrid)
      expect(screen.getAllByTestId('create-vendor-button')).toHaveLength(2)
    })

    it('should render vendor list when data is available', () => {
      render(
        <TestWrapper>
          <Vendors />
        </TestWrapper>
      )

      expect(screen.getByText('Test Vendor 1')).toBeInTheDocument()
      expect(screen.getByText('Test Vendor 2')).toBeInTheDocument()
    })

    it('should handle empty vendor list', () => {
      // Mock empty data for this test
      mockUseQuery.mockReturnValueOnce({
        data: [],
        isLoading: false,
        error: null,
      })

      render(
        <TestWrapper>
          <Vendors />
        </TestWrapper>
      )

      expect(screen.queryByText('Test Vendor 1')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('create-vendor-button')).toHaveLength(2)
    })

    it('should handle undefined vendor data', () => {
      // Mock undefined data for this test
      mockUseQuery.mockReturnValueOnce({
        data: undefined as any,
        isLoading: false,
        error: null,
      })

      render(
        <TestWrapper>
          <Vendors />
        </TestWrapper>
      )

      expect(screen.queryByText('Test Vendor 1')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('create-vendor-button')).toHaveLength(2)
    })
  })
})
