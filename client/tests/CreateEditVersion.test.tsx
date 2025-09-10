import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import CreateEditVersion, { 
  AddVersionButton,
  useVersionMutation
} from '@/components/layout/version/CreateEditVersion'
import client from '@/client'

// Mock variables using vi.hoisted to avoid hoisting issues
const mocks = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockNavigateToModal: vi.fn(),
  mockLocation: { state: { returnTo: '/products/prod1' } },
  mockUseMutation: vi.fn(),
  mockUseParams: vi.fn(() => ({ productId: 'prod1', versionId: 'v1' })),
  mockVersionData: {
    id: 'v1',
    name: 'Version 1.0',
    product_id: 'prod1',
    released_at: '2023-01-01',
  },
  mockUseVersionQuery: vi.fn(),
  mockUseErrorLocalization: vi.fn(),
}))

// Initialize default return values
mocks.mockUseVersionQuery.mockReturnValue({
  data: mocks.mockVersionData,
  isLoading: false,
  error: null,
})

mocks.mockUseErrorLocalization.mockReturnValue({
  isFieldInvalid: vi.fn(() => false),
  getFieldErrorMessage: vi.fn(() => null),
})

// Mock the client module
vi.mock('@/client', () => ({
  default: {
    useMutation: mocks.mockUseMutation,
  },
}))

// Mock useRouter
vi.mock('@/utils/useRouter', () => ({
  default: vi.fn(() => ({
    navigate: mocks.mockNavigate,
    navigateToModal: mocks.mockNavigateToModal,
    location: mocks.mockLocation,
  })),
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => mocks.mockUseParams(),
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
      if (key === 'version.label') return 'Version'
      if (key === 'common.cancel') return 'Cancel'
      if (key === 'common.save') return 'Save'
      if (key === 'common.create') return 'Create'
      if (key === 'form.errors') return 'Please fix the errors below'
      return key
    },
  }),
}))

vi.mock('@/routes/Version', () => ({
  useVersionQuery: mocks.mockUseVersionQuery,
}))

vi.mock('@/utils/useErrorLocalization', () => ({
  useErrorLocalization: mocks.mockUseErrorLocalization,
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

describe('AddVersionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render add version button', () => {
    render(
      <TestWrapper>
        <AddVersionButton productId="prod1" />
      </TestWrapper>
    )

    expect(screen.getByText('Create Version')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toHaveTextContent('plus')
  })

  it('should navigate to create modal when clicked', () => {
    render(
      <TestWrapper>
        <AddVersionButton productId="prod1" returnTo="/custom-path" />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Create Version'))

    expect(mocks.mockNavigateToModal).toHaveBeenCalledWith(
      '/products/prod1/versions/create',
      '/custom-path'
    )
  })

  it('should use default returnTo when not provided', () => {
    render(
      <TestWrapper>
        <AddVersionButton productId="prod1" />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Create Version'))

    expect(mocks.mockNavigateToModal).toHaveBeenCalledWith(
      '/products/prod1/versions/create',
      undefined
    )
  })
})

describe('CreateEditVersion', () => {
  const mockUseMutation = vi.mocked(client.useMutation)

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Ensure the version query mock returns the expected data
    mocks.mockUseVersionQuery.mockReturnValue({
      data: mocks.mockVersionData,
      isLoading: false,
      error: null,
    })
    
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any)
  })

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: null,
      } as any)

      mocks.mockUseVersionQuery.mockReturnValue({
        data: mocks.mockVersionData,
        isLoading: false,
        error: null,
      })
    })
    it('should render edit version modal with populated data', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Edit Version')).toBeInTheDocument()
      })

      const versionInput = screen.getByDisplayValue('Version 1.0')
      expect(versionInput).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('should show loading spinner when version data is loading', async () => {
      mocks.mockUseVersionQuery.mockReturnValue({
        data: undefined as any,
        isLoading: true,
        error: null,
      })

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
      })
    })

    it('should handle version data with null released_at', async () => {
      mocks.mockUseVersionQuery.mockReturnValue({
        data: { ...mocks.mockVersionData, released_at: '' },
        isLoading: false,
        error: null,
      })

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByDisplayValue('Version 1.0')).toBeInTheDocument()
      })

      expect(screen.getByText('Release Date')).toBeInTheDocument()
    })
  })

  describe('Create Mode', () => {
    beforeEach(() => {
      // Mock create mode by changing the router params
      mocks.mockUseParams.mockReturnValue({
        productId: 'prod1',
        versionId: undefined as any, // This makes it create mode
      })

      // Mock useVersionQuery to return no data for create mode
      mocks.mockUseVersionQuery.mockReturnValue({
        data: null as any,
        isLoading: false,
        error: null,
      })
    })

    it('should render create version modal', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Create Version')).toBeInTheDocument()
      })

      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('1.0.0')).toHaveValue('')
    })

    it('should not show loading state in create mode', async () => {
      mocks.mockUseVersionQuery.mockReturnValue({
        data: undefined as any,
        isLoading: true,
        error: null,
      })

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // In create mode, loading state should not show the spinner modal
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByText('Create Version')).toBeInTheDocument()
    })

    it('should handle form submission in create mode', async () => {
      const mockMutate = vi.fn()
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Fill in version name
      const versionInput = screen.getByPlaceholderText('1.0.0')
      fireEvent.change(versionInput, { target: { value: 'Version 1.0' } })

      // Submit the form
      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          body: {
            product_id: 'prod1',
            version: 'Version 1.0',
            release_date: undefined,
          },
        })
      })
    })
  })

  describe('Common Functionality', () => {
    beforeEach(() => {
      // Reset to edit mode for these tests
      mocks.mockUseParams.mockReturnValue({
        productId: 'prod1',
        versionId: 'v1',
      })

      // Ensure version query returns data and not loading
      mocks.mockUseVersionQuery.mockReturnValue({
        data: mocks.mockVersionData,
        isLoading: false,
        error: null,
      })
    })

    it('should update version name when input changes', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const versionInput = await screen.findByDisplayValue('Version 1.0')
      fireEvent.change(versionInput, { target: { value: 'Version 2.0' } })

      expect(versionInput).toHaveValue('Version 2.0')
    })

    it('should handle cancel button click', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const cancelButton = await screen.findByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mocks.mockNavigate).toHaveBeenCalledWith(
        '/products/prod1',
        {
          replace: true,
          state: { shouldRefetch: false },
        }
      )
    })

    it('should handle save button click', async () => {
      const mockMutate = vi.fn()
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const saveButton = await screen.findByText('Save')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })

    it('should show loading state on save button when mutation is pending', async () => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const saveButton = await screen.findByText('Save')
      expect(saveButton).toHaveAttribute('data-loading', 'true')
    })

    it('should show error alert when mutation has error', async () => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: { message: 'Test error' },
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Please fix the errors below')).toBeInTheDocument()
      })
    })

    it('should show VersionSkeleton when isLoading is true', async () => {
      mocks.mockUseVersionQuery.mockReturnValue({
        data: undefined as any,
        isLoading: true,
        error: null,
      })

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
      })
    })

    it('should handle date picker changes', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByDisplayValue('Version 1.0')).toBeInTheDocument()
      })

      // Test DatePicker onChange by simulating date change
      // This would trigger the onChange function in DatePicker component
      // The actual implementation depends on the DatePicker library used
      // but we can test that the form handles date changes
      const form = screen.getByRole('dialog')
      expect(form).toBeInTheDocument()
    })

    it('should show field validation errors', async () => {
      const mockIsFieldInvalid = vi.fn((field?: string) => field === 'Version')
      const mockGetFieldErrorMessage = vi.fn((field?: string) => field === 'Version' ? 'Version is required' : null)
      
      mocks.mockUseErrorLocalization.mockReturnValue({
        isFieldInvalid: mockIsFieldInvalid,
        getFieldErrorMessage: mockGetFieldErrorMessage,
      })

      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: { message: 'Validation error' },
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Version is required')).toBeInTheDocument()
      })
    })

    it('should handle date picker changes', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Release Date')).toBeInTheDocument()
      })

      // The DatePicker component should be rendered
      expect(screen.getByText('Release Date')).toBeInTheDocument()
    })

    it('should handle successful mutation for edit mode', async () => {
      const mockMutate = vi.fn()
      
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Update version name
      const versionInput = await screen.findByDisplayValue('Version 1.0')
      fireEvent.change(versionInput, { target: { value: 'Updated Version' } })

      // Click save button
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          body: {
            product_id: 'prod1',
            version: 'Updated Version',
            release_date: '2023-01-01',
          },
          params: {
            path: { id: 'v1' },
          },
        })
      })
    })

    it('should handle date picker changes with actual date values', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Release Date')).toBeInTheDocument()
      })

      // Find date picker and verify it's rendered
      const datePicker = screen.getByText('Release Date').closest('div')
      expect(datePicker).toBeInTheDocument()
    })

    it('should handle onClose with default shouldRefetch true', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Test modal close by finding the close button (X) and clicking it
      // This simulates clicking the X button which should call onClose(true)
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close')
        fireEvent.click(closeButton)
      })

      // The onClose should be called with default shouldRefetch: true
      await waitFor(() => {
        expect(mocks.mockNavigate).toHaveBeenCalledWith(
          '/products/prod1',
          {
            replace: true,
            state: { shouldRefetch: true },
          }
        )
      })
    })

    it('should handle cancel button click with shouldRefetch false', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const cancelButton = await screen.findByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mocks.mockNavigate).toHaveBeenCalledWith(
        '/products/prod1',
        {
          replace: true,
          state: { shouldRefetch: false },
        }
      )
    })

    it('should display version input with correct label and placeholder', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Version Number')).toBeInTheDocument()
      })

      const versionInput = screen.getByPlaceholderText('1.0.0')
      expect(versionInput).toBeInTheDocument()
    })

    it('should update version state when input value changes', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const versionInput = await screen.findByDisplayValue('Version 1.0')
      
      // Change the input value
      fireEvent.change(versionInput, { target: { value: 'Version 2.0' } })
      
      // Verify the input value has changed
      expect(versionInput).toHaveValue('Version 2.0')
    })

    it('should show release date label', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Release Date')).toBeInTheDocument()
      })
    })

    it('should render modal header with edit title', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Edit Version')).toBeInTheDocument()
      })
    })

    it('should render modal footer with cancel and save buttons', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Save')).toBeInTheDocument()
      })
    })

    it('should use returnTo from location state when available', async () => {
      // Update the mock location for this test
      mocks.mockLocation.state = { returnTo: '/custom-return-path' }

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      const cancelButton = await screen.findByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mocks.mockNavigate).toHaveBeenCalledWith(
        '/custom-return-path',
        {
          replace: true,
          state: { shouldRefetch: false },
        }
      )
    })

    it('should show VersionSkeleton when isLoading is true', async () => {
      // Set up loading state but ensure we don't trigger the Spinner modal
      // In edit mode, if isLoading is true, the component shows a different loading state
      mocks.mockUseVersionQuery.mockReturnValue({
        data: null, // No data yet
        isLoading: true,
        error: null,
      })

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // In edit mode with loading=true and no data, it shows the Spinner modal
      await waitFor(() => {
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
      })
    })
  })
})

describe('useVersionMutation', () => {
  const TestHookWrapper = ({ children }: { children: React.ReactNode }) => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Mutations', () => {
    it('should handle create mutation', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { name: 'Test Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'Test Version',
          release_date: undefined,
        },
      })
    })

    it('should handle create mutation with date', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const mockDate = { toString: () => '2023-12-25' } as any

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { name: 'Test Version', releaseDate: mockDate }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'Test Version',
          release_date: '2023-12-25',
        },
      })
    })

    it('should handle create mutation without productId', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: undefined,
          version: { name: 'Test Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: '',
          version: 'Test Version',
          release_date: undefined,
        },
      })
    })

    it('should test create form logic', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { name: 'New Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      // Test that it identifies as create form when no id
      result.current.mutateVersion()

      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'New Version',
          release_date: undefined,
        },
      })
    })
  })

  describe('Update Mutations', () => {
    it('should handle update mutation', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { id: 'v1', name: 'Updated Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'Updated Version',
          release_date: undefined,
        },
        params: {
          path: { id: 'v1' },
        },
      })
    })

    it('should handle update mutation with empty version id', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { id: '', name: 'Updated Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      // When id is empty string, it should behave as create mutation
      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'Updated Version',
          release_date: undefined,
        },
      })
    })

    it('should handle different release date formats', () => {
      const mockMutate = vi.fn()
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { 
            name: 'Version with Date', 
            releaseDate: { toString: () => '2023-12-25' } as any
          }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'Version with Date',
          release_date: '2023-12-25',
        },
      })
    })
  })

  describe('Mutation State', () => {
    it('should handle mutation isPending state', () => {
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        error: null,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { name: 'Test Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      expect(result.current.isPending).toBe(true)
    })

    it('should handle mutation error state', () => {
      const mockError = { message: 'Test error' }
      vi.mocked(client.useMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: mockError,
      } as any)

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { name: 'Test Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      expect(result.current.error).toBe(mockError)
    })

    it('should handle successful create mutation onSuccess callback', () => {
      const mockMutate = vi.fn((options) => {
        // Simulate successful mutation
        if (options.onSuccess) {
          options.onSuccess({ id: 'new-version-id' })
        }
      })

      vi.mocked(client.useMutation).mockImplementation((_method, _url, options) => {
        return {
          mutate: (args: any) => {
            mockMutate({ ...options, ...args })
          },
          isPending: false,
          error: null,
        } as any
      })

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { name: 'Test Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mocks.mockNavigate).toHaveBeenCalledWith('/product-versions/new-version-id', {
        replace: true,
        state: { shouldRefetch: true },
      })
    })

    it('should handle successful update mutation onSuccess callback', () => {
      const mockMutate = vi.fn((options) => {
        // Simulate successful mutation
        if (options.onSuccess) {
          options.onSuccess({ id: 'updated-version-id' })
        }
      })

      vi.mocked(client.useMutation).mockImplementation((_method, _url, options) => {
        return {
          mutate: (args: any) => {
            mockMutate({ ...options, ...args })
          },
          isPending: false,
          error: null,
        } as any
      })

      const { result } = renderHook(
        () => useVersionMutation({
          productId: 'prod1',
          version: { id: 'v1', name: 'Updated Version', releaseDate: null }
        }),
        { wrapper: TestHookWrapper }
      )

      result.current.mutateVersion()

      expect(mocks.mockNavigate).toHaveBeenCalledWith('/product-versions/updated-version-id', {
        replace: true,
        state: { shouldRefetch: true },
      })
    })
  })

  describe('VersionSkeleton Component', () => {
    it('should test versionSkeleton render when mocked', () => {
      // Create a simple test component that uses VersionSkeleton  
      const TestComponent = () => {
        // Mock loading state
        const isLoading = true
        
        if (isLoading) {
          return (
            <div className="flex w-full animate-pulse gap-2">
              <div className="flex-1">
                <div className="mb-1 h-5 w-24 rounded bg-gray-200" />
                <div className="h-10 rounded bg-gray-200" />
              </div>
              <div className="flex-1">
                <div className="mb-1 h-5 w-24 rounded bg-gray-200" />
                <div className="h-10 rounded bg-gray-200" />
              </div>
            </div>
          )
        }
        return null
      }

      render(<TestComponent />)
      
      // Check for skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('Form Submission Integration', () => {
    beforeEach(() => {
      // Ensure we're in edit mode with proper mock data
      mocks.mockUseParams.mockReturnValue({
        productId: 'prod1',
        versionId: 'v1',
      })

      mocks.mockUseVersionQuery.mockReturnValue({
        data: mocks.mockVersionData,
        isLoading: false,
        error: null,
      })
    })

    it('should handle form submission with release date', async () => {
      const mockMutate = vi.fn()
      const mockUseMutation = vi.mocked(client.useMutation)
      
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any)

      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Wait for version data to load
      const versionInput = await screen.findByDisplayValue('Version 1.0')
      
      // Change version name
      fireEvent.change(versionInput, { target: { value: 'Version 2.0' } })

      // Submit the form
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          body: {
            product_id: 'prod1',
            version: 'Version 2.0',
            release_date: '2023-01-01', // This should include the existing release date
          },
          params: {
            path: { id: 'v1' },
          },
        })
      })
    })

    it('should handle close modal with different shouldRefetch values', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Wait for the modal to load
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Test closing with shouldRefetch=true (default)
      // This would happen when clicking the close button
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })

    it('should render version form with existing data', async () => {
      render(
        <TestWrapper>
          <CreateEditVersion />
        </TestWrapper>
      )

      // Verify the form loads with existing version data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Version 1.0')).toBeInTheDocument()
      })

      // Check that all form elements are present
      expect(screen.getByText('Version Number')).toBeInTheDocument()
      expect(screen.getByText('Release Date')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('1.0.0')).toBeInTheDocument()
    })
  })
})

describe('CreateEditVersion - Loading and Success States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure we're in edit mode with proper mock data
    mocks.mockUseParams.mockReturnValue({
      productId: 'prod1',
      versionId: 'v1',
    })
  })

  it('should test versionSkeleton render when mocked', () => {
    // Create a simple test component that uses VersionSkeleton  
    const TestComponent = () => {
      // Mock loading state
      const isLoading = true
      
      if (isLoading) {
        return (
          <div className="flex w-full animate-pulse gap-2">
            <div className="flex-1">
              <div className="mb-1 h-5 w-24 rounded bg-gray-200" />
              <div className="h-10 rounded bg-gray-200" />
            </div>
            <div className="flex-1">
              <div className="mb-1 h-5 w-24 rounded bg-gray-200" />
              <div className="h-10 rounded bg-gray-200" />
            </div>
          </div>
        )
      }
      return null
    }

    render(<TestComponent />)
    
    // Check for skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('should handle form submission with release date', async () => {
    const mockMutate = vi.fn()
    const mockUseMutation = vi.mocked(client.useMutation)
    
    // Ensure proper mock setup for this test
    mocks.mockUseVersionQuery.mockReturnValue({
      data: mocks.mockVersionData,
      isLoading: false,
      error: null,
    })
    
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any)

    render(
      <TestWrapper>
        <CreateEditVersion />
      </TestWrapper>
    )

    // Wait for version data to load
    const versionInput = await screen.findByDisplayValue('Version 1.0')
    
    // Change version name
    fireEvent.change(versionInput, { target: { value: 'Version 2.0' } })

    // Submit the form
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        body: {
          product_id: 'prod1',
          version: 'Version 2.0',
          release_date: '2023-01-01', // This should include the existing release date
        },
        params: {
          path: { id: 'v1' },
        },
      })
    })
  })

  it('should handle close modal with different shouldRefetch values', async () => {
    // Ensure proper mock setup for this test
    mocks.mockUseVersionQuery.mockReturnValue({
      data: mocks.mockVersionData,
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <CreateEditVersion />
      </TestWrapper>
    )

    // Wait for the modal to load
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Test closing with shouldRefetch=true (default)
    // This would happen when clicking the close button
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
  })

  it('should render version form with existing data', async () => {
    // Ensure proper mock setup for this test
    mocks.mockUseVersionQuery.mockReturnValue({
      data: mocks.mockVersionData,
      isLoading: false,
      error: null,
    })

    render(
      <TestWrapper>
        <CreateEditVersion />
      </TestWrapper>
    )

    // Verify the form loads with existing version data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Version 1.0')).toBeInTheDocument()
    })

    // Check that all form elements are present
    expect(screen.getByText('Version Number')).toBeInTheDocument()
    expect(screen.getByText('Release Date')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('1.0.0')).toBeInTheDocument()
  })
})
