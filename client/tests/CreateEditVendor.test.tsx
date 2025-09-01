import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateEditVendor, { 
  CreateVendorButton,
  useVendorMutation
} from '@/components/layout/vendor/CreateEditVendor'
import client from '@/client'
import { renderHook } from '@testing-library/react'

// Mock Input and Textarea components
vi.mock('@/components/forms/Input', () => ({
  Input: ({ label, value, ...props }: any) => (
    <input
      data-testid={`input-${label?.toLowerCase()}`}
      aria-label={label}
      value={value || ''}
      className="w-full"
      {...props}
    />
  ),
  Textarea: ({ label, value, ...props }: any) => (
    <textarea
      data-testid={`textarea-${label?.toLowerCase()}`}
      aria-label={label}
      value={value || ''}
      className="w-full"
      {...props}
    />
  ),
}))
vi.mock('@/client', () => ({
  default: {
    useMutation: vi.fn(),
  },
}))

// Mock useRouter
const mockNavigate = vi.fn()
const mockNavigateToModal = vi.fn()
const mockLocation = { state: { returnTo: '/vendors' } }

vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    navigate: mockNavigate,
    navigateToModal: mockNavigateToModal,
    location: mockLocation,
  })),
}))

// Mock react-router-dom
const mockUseParams = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => mockUseParams(),
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
      if (key === 'common.createObject') return `Create ${options?.label}`
      if (key === 'common.editObject') return `Edit ${options?.label}`
      if (key === 'vendor.label') return 'Vendor'
      if (key === 'common.cancel') return 'Cancel'
      if (key === 'common.save') return 'Save'
      if (key === 'common.create') return 'Create'
      if (key === 'form.errors') return 'Please fix the errors below'
      return key
    },
  }),
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  Button: ({ children, onPress, isLoading, ...props }: any) => (
    <button onClick={onPress} data-loading={isLoading} {...props}>
      {children}
    </button>
  ),
  Modal: ({ children, isOpen }: any) => isOpen ? <div data-testid="modal">{children}</div> : null,
  ModalBody: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-body">{children}</div>,
  ModalContent: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-content">{children}</div>,
  ModalFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-footer">{children}</div>,
  ModalHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-header">{children}</div>,
  Spinner: () => <div data-testid="loading-spinner" role="progressbar">Loading...</div>,
}))

// Mock useVendorQuery
vi.mock('@/routes/Vendor', () => ({
  useVendorQuery: vi.fn(),
}))

// Mock useErrorLocalization
vi.mock('@/utils/useErrorLocalization', () => ({
  useErrorLocalization: vi.fn(() => ({
    isFieldInvalid: () => false,
    getFieldErrorMessage: () => null,
  })),
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

describe('CreateVendorButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render create vendor button', () => {
    render(
      <TestWrapper>
        <CreateVendorButton />
      </TestWrapper>
    )

    expect(screen.getByText('Create Vendor')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toHaveTextContent('plus')
  })

  it('should navigate to create modal when clicked', () => {
    render(
      <TestWrapper>
        <CreateVendorButton />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Create Vendor'))

    expect(mockNavigateToModal).toHaveBeenCalledWith('/vendors/create')
  })
})

describe('useVendorMutation', () => {
  const mockUseMutation = vi.mocked(client.useMutation)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any)
  })

  it('should create mutation for new vendor', () => {
    const vendor = { name: 'New Vendor', description: 'New description' }
    
    renderHook(() => useVendorMutation({ vendor }), {
      wrapper: TestWrapper,
    })

    expect(mockUseMutation).toHaveBeenCalledWith('post', '/api/v1/vendors', expect.any(Object))
  })

  it('should create update mutation for existing vendor', () => {
    const vendor = { id: 'vendor1', name: 'Updated Vendor', description: 'Updated description' }
    
    renderHook(() => useVendorMutation({ vendor }), {
      wrapper: TestWrapper,
    })

    expect(mockUseMutation).toHaveBeenCalledWith('put', '/api/v1/vendors/{id}', expect.any(Object))
  })
})

describe('CreateEditVendor', () => {
  const mockUseMutation = vi.mocked(client.useMutation)
  
  const mockVendorData = {
    id: 'vendor1',
    name: 'Test Vendor',
    description: 'Test vendor description',
    product_count: 0,
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any)
    
    // Default to edit mode with vendor data
    mockUseParams.mockReturnValue({ vendorId: 'vendor1' })
    
    // Mock vendor query to return data
    const { useVendorQuery } = await import('@/routes/Vendor')
    vi.mocked(useVendorQuery).mockReturnValue({
      data: mockVendorData,
      isLoading: false,
      error: null,
    } as any)
  })

  it('should render edit vendor modal with title', async () => {
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Edit Vendor')).toBeInTheDocument()
    })
  })

  it('should render vendor form fields with data', async () => {
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Vendor')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test vendor description')).toBeInTheDocument()
    })
  })

  it('should update vendor name when input changes', async () => {
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    const nameInput = await screen.findByDisplayValue('Test Vendor')
    fireEvent.change(nameInput, { target: { value: 'Updated Vendor' } })

    expect(nameInput).toHaveValue('Updated Vendor')
  })

  it('should handle cancel button click', async () => {
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    const cancelButton = await screen.findByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/vendors',
      {
        replace: true,
        state: { shouldRefetch: true },
      }
    )
  })

  it('should show error alert when mutation has error', async () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: { message: 'Something went wrong' },
    } as any)

    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Please fix the errors below')).toBeInTheDocument()
    })
  })

  it('should show isLoading state on save button', async () => {
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    await waitFor(() => {
      const saveButton = screen.getByText('Save')
      expect(saveButton).toHaveAttribute('data-loading', 'true')
    })
  })

  it('should render create vendor modal with title', async () => {
    // Set create mode
    mockUseParams.mockReturnValue({})
    
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Create Vendor')).toBeInTheDocument()
    })
  })

  it('should show loading spinner when loading vendor data', async () => {
    // Mock loading state
    const { useVendorQuery } = await import('@/routes/Vendor')
    vi.mocked(useVendorQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should call mutateVendor when save button is clicked (edit mode)', async () => {
    const mutateMock = vi.fn()
    mockUseMutation.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    const saveButton = await screen.findByText('Save')
    fireEvent.click(saveButton)

    expect(mutateMock).toHaveBeenCalled()
  })

  it('should call mutateVendor when create button is clicked (create mode)', async () => {
    // Set create mode
    mockUseParams.mockReturnValue({})
    
    const mutateMock = vi.fn()
    mockUseMutation.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    const createButton = await screen.findByText('Create')
    fireEvent.click(createButton)

    expect(mutateMock).toHaveBeenCalled()
  })

  it('should update vendor description when textarea changes', async () => {
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    const descInput = await screen.findByDisplayValue('Test vendor description')
    fireEvent.change(descInput, { target: { value: 'Updated description' } })

    expect(descInput).toHaveValue('Updated description')
  })

  it('should close modal when onOpenChange is triggered', async () => {
    render(
      <TestWrapper>
        <CreateEditVendor />
      </TestWrapper>
    )

    // Simulate modal close by calling onOpenChange
    const cancelButton = await screen.findByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/vendors',
      {
        replace: true,
        state: { shouldRefetch: true },
      }
    )
  })
})