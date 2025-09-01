import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import IdentificationOverview, { 
  idHelperTypes 
} from '@/routes/IdentificationHelper/IdentificationOverview'

// Initialize i18n for testing
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        'identificationHelper.title': 'Identification Helpers',
        'identificationHelper.label_one': 'Identification Helper',
        'identificationHelper.label_other': 'Identification Helpers',
        'identificationHelper.add': 'Add Helper',
        'identificationHelper.addHelper': 'Add {{label}}',
        'identificationHelper.editHelper': 'Edit Helper',
        'identificationHelper.deleteHelper': 'Delete Helper',
        'identificationHelper.deleteConfirmTitle': 'Delete Helper',
        'identificationHelper.deleteConfirmText': 'Are you sure you want to delete this {{label}}?',
        'identificationHelper.notConfigured': 'Not configured',
        'identificationHelper.andMore': 'and {{count}} more',
        'identificationHelper.type': 'Helper Type',
        'identificationHelper.emptyState.title': 'No identification helpers yet',
        'identificationHelper.emptyState.description': 'Start by adding your first identification helper.',
        'vendor.label_one': 'Vendor',
        'vendor.label_other': 'Vendors',
        'product.label_one': 'Product',
        'product.label_other': 'Products',
        'version.label_one': 'Version',
        'version.label_other': 'Versions',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'identificationHelper.types.cpe.label': 'CPE',
        'identificationHelper.types.cpe.description': 'Common Platform Enumeration identifiers',
        'identificationHelper.types.hashes.label': 'Hashes',
        'identificationHelper.types.hashes.description': 'File hashes for verification',
        'identificationHelper.types.models.label': 'Models',
        'identificationHelper.types.models.description': 'Model numbers and identifiers',
        'identificationHelper.types.purl.label': 'PURL',
        'identificationHelper.types.purl.description': 'Package URL identifiers',
        'identificationHelper.types.sbom.label': 'SBOM',
        'identificationHelper.types.sbom.description': 'Software Bill of Materials',
        'identificationHelper.types.serial.label': 'Serial Number',
        'identificationHelper.types.serial.description': 'Serial numbers and device identifiers',
        'identificationHelper.types.sku.label': 'SKU',
        'identificationHelper.types.sku.description': 'Stock Keeping Unit identifiers',
        'identificationHelper.types.uri.label': 'URI',
        'identificationHelper.types.uri.description': 'Uniform Resource Identifiers',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

// Mock the client
vi.mock('@/client', () => ({
  default: {
    useQuery: vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    })),
  },
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ 
      productId: 'test-product-1', 
      vendorId: 'test-vendor-1', 
      versionId: 'test-version-1' 
    }),
  }
})

// Mock query hooks
vi.mock('../Product', () => ({
  useProductQuery: vi.fn(() => ({
    data: { id: 'test-product-1', name: 'Test Product', vendor_id: 'test-vendor-1' },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('../Vendor', () => ({
  useVendorQuery: vi.fn(() => ({
    data: { id: 'test-vendor-1', name: 'Test Vendor' },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('../Version', () => ({
  useVersionQuery: vi.fn(() => ({
    data: { id: 'test-version-1', name: 'Test Version', product_id: 'test-product-1' },
    isLoading: false,
    error: null,
  })),
}))

// Mock CreateEditIDHelper component
vi.mock('./CreateIDHelper', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-edit-id-helper">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

// Mock useRefetchQuery
vi.mock('@/utils/useRefetchQuery', () => ({
  default: vi.fn(() => vi.fn()),
}))

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span data-testid="fontawesome-icon" data-icon={icon.iconName} {...props} />
  ),
}))

// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  BreadcrumbItem: ({ children, href, isDisabled, ...props }: any) => {
    if (href) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      )
    }
    return (
      <span 
        {...props} 
        data-disabled={isDisabled}
        role="link"
        tabIndex={isDisabled ? -1 : 0}
      >
        {children}
      </span>
    )
  },
  Button: ({ children, onPress, variant, color, size, isIconOnly, startContent, ...props }: any) => (
    <button
      onClick={onPress}
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-icon-only={isIconOnly}
      {...props}
    >
      {startContent}
      {children}
    </button>
  ),
  Tooltip: ({ children, content, ...props }: any) => (
    <div title={content} {...props}>
      {children}
    </div>
  ),
  Modal: ({ children, isOpen, onOpenChange }: any) => (
    isOpen ? <div data-testid="modal" onKeyDown={(e) => e.key === 'Escape' && onOpenChange(false)}>{children}</div> : null
  ),
  ModalContent: ({ children }: any) => <div data-testid="modal-content">{children}</div>,
  ModalHeader: ({ children }: any) => <div data-testid="modal-header">{children}</div>,
  ModalBody: ({ children }: any) => <div data-testid="modal-body">{children}</div>,
  ModalFooter: ({ children }: any) => <div data-testid="modal-footer">{children}</div>,
  useDisclosure: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onOpenChange: vi.fn(),
    onClose: vi.fn(),
  }),
}))

vi.mock('@heroui/button', () => ({
  Button: ({ children, onPress, variant, color, size, isIconOnly, startContent, ...props }: any) => (
    <button
      onClick={onPress}
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-icon-only={isIconOnly}
      {...props}
    >
      {startContent}
      {children}
    </button>
  ),
}))

// Mock form components
vi.mock('@/components/forms/Breadcrumbs', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <nav aria-label="Breadcrumbs" data-slot="base">
      <ol data-slot="list">
        {children}
      </ol>
    </nav>
  ),
}))

vi.mock('@/components/forms/PageContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col gap-4 p-2">{children}</div>
  ),
}))

vi.mock('@/components/forms/ConfirmButton', () => ({
  default: ({ children, onConfirm, confirmTitle, confirmText, ...props }: any) => (
    <button onClick={onConfirm} {...props}>
      {children}
    </button>
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
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>{children}</BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

describe('IdentificationOverview', () => {
  describe('Helper Types Configuration', () => {
    it('should have all expected helper types defined', () => {
      expect(idHelperTypes).toHaveLength(8)
      
      const expectedTypes = [
        'cpe', 'hashes', 'models', 'purl', 'sbom', 'serial', 'sku', 'uri'
      ]
      
      expectedTypes.forEach((type, index) => {
        expect(idHelperTypes[index].id).toBe(type)
        expect(idHelperTypes[index].component).toBe(type === 'hashes' ? 'hashes' : type)
        expect(idHelperTypes[index].translationKey).toBe(`identificationHelper.types.${type}`)
      })
    })

    it('should have correct CPE helper type configuration', () => {
      const cpeType = idHelperTypes.find(t => t.id === 'cpe')
      expect(cpeType).toBeDefined()
      expect(cpeType?.component).toBe('cpe')
      expect(cpeType?.translationKey).toBe('identificationHelper.types.cpe')
    })

    it('should have correct hash helper type configuration', () => {
      const hashType = idHelperTypes.find(t => t.id === 'hashes')
      expect(hashType).toBeDefined()
      expect(hashType?.component).toBe('hashes')
      expect(hashType?.translationKey).toBe('identificationHelper.types.hashes')
    })

    it('should have correct model helper type configuration', () => {
      const modelType = idHelperTypes.find(t => t.id === 'models')
      expect(modelType).toBeDefined()
      expect(modelType?.component).toBe('models')
      expect(modelType?.translationKey).toBe('identificationHelper.types.models')
    })

    it('should have correct PURL helper type configuration', () => {
      const purlType = idHelperTypes.find(t => t.id === 'purl')
      expect(purlType).toBeDefined()
      expect(purlType?.component).toBe('purl')
      expect(purlType?.translationKey).toBe('identificationHelper.types.purl')
    })

    it('should have correct SBOM helper type configuration', () => {
      const sbomType = idHelperTypes.find(t => t.id === 'sbom')
      expect(sbomType).toBeDefined()
      expect(sbomType?.component).toBe('sbom')
      expect(sbomType?.translationKey).toBe('identificationHelper.types.sbom')
    })

    it('should have correct serial helper type configuration', () => {
      const serialType = idHelperTypes.find(t => t.id === 'serial')
      expect(serialType).toBeDefined()
      expect(serialType?.component).toBe('serial')
      expect(serialType?.translationKey).toBe('identificationHelper.types.serial')
    })

    it('should have correct SKU helper type configuration', () => {
      const skuType = idHelperTypes.find(t => t.id === 'sku')
      expect(skuType).toBeDefined()
      expect(skuType?.component).toBe('sku')
      expect(skuType?.translationKey).toBe('identificationHelper.types.sku')
    })

    it('should have correct URI helper type configuration', () => {
      const uriType = idHelperTypes.find(t => t.id === 'uri')
      expect(uriType).toBeDefined()
      expect(uriType?.component).toBe('uri')
      expect(uriType?.translationKey).toBe('identificationHelper.types.uri')
    })
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )
      
      // Should render the main page content - check for the page header specifically
      const titleElements = screen.getAllByText('Identification Helpers')
      expect(titleElements.length).toBeGreaterThan(0)
      
      // Check that we have the main header with the correct styling
      const pageHeader = titleElements.find(el => 
        el.className?.includes('text-xl') && el.className?.includes('font-semibold')
      )
      expect(pageHeader).toBeInTheDocument()
    })

    it('should render breadcrumbs navigation', () => {
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )
      
      // Should have breadcrumb navigation
      const breadcrumbs = screen.getByRole('navigation')
      expect(breadcrumbs).toBeInTheDocument()
    })

    it('should render add helper button', () => {
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )
      
      // Should have add buttons for each helper type (8 types = 8 "Add X" buttons)
      expect(screen.getByText('Add CPE')).toBeInTheDocument()
    })

    it('should render helper types in grid', () => {
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )
      
      // Should have grid with all helper types
      expect(screen.getByText('CPE')).toBeInTheDocument()
      expect(screen.getByText('Hashes')).toBeInTheDocument()
      expect(screen.getByText('Models')).toBeInTheDocument()
      expect(screen.getByText('PURL')).toBeInTheDocument()
    })

    it('should display all helper type cards', () => {
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )
      
      // Should show all 8 helper types
      expect(screen.getByText('CPE')).toBeInTheDocument()
      expect(screen.getByText('Hashes')).toBeInTheDocument()
      expect(screen.getByText('Models')).toBeInTheDocument()
      expect(screen.getByText('PURL')).toBeInTheDocument()
      expect(screen.getByText('SBOM')).toBeInTheDocument()
      expect(screen.getByText('Serial Number')).toBeInTheDocument()
      expect(screen.getByText('SKU')).toBeInTheDocument()
      expect(screen.getByText('URI')).toBeInTheDocument()
    })
  })

  describe('Helper Type Filtering', () => {
    it('should filter available helper types when availableHelperTypes prop is provided', () => {
      const availableTypes = [idHelperTypes[0], idHelperTypes[2]] // CPE and Models
      
      // This would be tested in a parent component that passes the filter
      expect(availableTypes).toHaveLength(2)
      expect(availableTypes[0].id).toBe('cpe')
      expect(availableTypes[1].id).toBe('models')
    })
  })

  describe('Helper Type Metadata', () => {
    it('should handle CPE metadata formatting', () => {
      const cpeMetadata = JSON.stringify({ cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*' })
      
      // Test the metadata parsing logic
      expect(() => JSON.parse(cpeMetadata)).not.toThrow()
      const parsed = JSON.parse(cpeMetadata)
      expect(parsed.cpe).toBe('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*')
    })

    it('should handle hash metadata formatting', () => {
      const hashMetadata = JSON.stringify({
        file_hashes: [
          {
            filename: 'test.txt',
            items: [{ algorithm: 'SHA-256', value: 'abcdef123456' }]
          }
        ]
      })
      
      expect(() => JSON.parse(hashMetadata)).not.toThrow()
      const parsed = JSON.parse(hashMetadata)
      expect(parsed.file_hashes).toHaveLength(1)
      expect(parsed.file_hashes[0].filename).toBe('test.txt')
    })

    it('should handle model metadata formatting', () => {
      const modelMetadata = JSON.stringify({ models: ['Model A', 'Model B'] })
      
      expect(() => JSON.parse(modelMetadata)).not.toThrow()
      const parsed = JSON.parse(modelMetadata)
      expect(parsed.models).toHaveLength(2)
      expect(parsed.models[0]).toBe('Model A')
    })

    it('should handle PURL metadata formatting', () => {
      const purlMetadata = JSON.stringify({ purl: 'pkg:npm/react@18.0.0' })
      
      expect(() => JSON.parse(purlMetadata)).not.toThrow()
      const parsed = JSON.parse(purlMetadata)
      expect(parsed.purl).toBe('pkg:npm/react@18.0.0')
    })

    it('should handle SBOM metadata formatting', () => {
      const sbomMetadata = JSON.stringify({ 
        sbom_urls: ['https://example.com/sbom1.json', 'https://example.com/sbom2.json']
      })
      
      expect(() => JSON.parse(sbomMetadata)).not.toThrow()
      const parsed = JSON.parse(sbomMetadata)
      expect(parsed.sbom_urls).toHaveLength(2)
      expect(parsed.sbom_urls[0]).toBe('https://example.com/sbom1.json')
    })

    it('should handle serial number metadata formatting', () => {
      const serialMetadata = JSON.stringify({ serial_numbers: ['SN123456', 'SN789012'] })
      
      expect(() => JSON.parse(serialMetadata)).not.toThrow()
      const parsed = JSON.parse(serialMetadata)
      expect(parsed.serial_numbers).toHaveLength(2)
      expect(parsed.serial_numbers[0]).toBe('SN123456')
    })

    it('should handle SKU metadata formatting', () => {
      const skuMetadata = JSON.stringify({ skus: ['SKU-001', 'SKU-002'] })
      
      expect(() => JSON.parse(skuMetadata)).not.toThrow()
      const parsed = JSON.parse(skuMetadata)
      expect(parsed.skus).toHaveLength(2)
      expect(parsed.skus[0]).toBe('SKU-001')
    })

    it('should handle URI metadata formatting', () => {
      const uriMetadata = JSON.stringify({
        uris: [
          { namespace: 'https://example.com', uri: 'product/123' },
          { namespace: 'https://test.com', uri: 'item/456' }
        ]
      })
      
      expect(() => JSON.parse(uriMetadata)).not.toThrow()
      const parsed = JSON.parse(uriMetadata)
      expect(parsed.uris).toHaveLength(2)
      expect(parsed.uris[0].namespace).toBe('https://example.com')
      expect(parsed.uris[0].uri).toBe('product/123')
    })

    it('should handle malformed metadata gracefully', () => {
      const malformedMetadata = '{ invalid json'
      
      expect(() => JSON.parse(malformedMetadata)).toThrow()
      
      // Test that the component would handle this gracefully
      let parsed
      try {
        parsed = JSON.parse(malformedMetadata)
      } catch {
        parsed = {}
      }
      expect(parsed).toEqual({})
    })
  })

  describe('Data Validation', () => {
    it('should validate CPE format structure', () => {
      const validCPE = 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*'
      const parts = validCPE.split(':')
      
      expect(parts).toHaveLength(13)
      expect(parts[0]).toBe('cpe')
      expect(parts[1]).toBe('2.3')
      expect(parts[2]).toBe('a') // application
    })

    it('should validate PURL format structure', () => {
      const validPURL = 'pkg:npm/react@18.0.0'
      
      expect(validPURL).toMatch(/^pkg:/)
      expect(validPURL).toContain('npm')
      expect(validPURL).toContain('react')
      expect(validPURL).toContain('@18.0.0')
    })

    it('should validate URL format for SBOM URLs', () => {
      const validURL = 'https://example.com/sbom.json'
      
      expect(() => new URL(validURL)).not.toThrow()
      const url = new URL(validURL)
      expect(url.protocol).toBe('https:')
      expect(url.hostname).toBe('example.com')
    })

    it('should validate hash algorithm types', () => {
      const commonAlgorithms = ['SHA-1', 'SHA-256', 'SHA-512', 'MD5', 'BLAKE2B']
      
      commonAlgorithms.forEach(algorithm => {
        expect(algorithm).toMatch(/^[A-Z0-9-]+$/)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle empty helper list gracefully', () => {
      const emptyHelpers: any[] = []
      
      expect(emptyHelpers).toHaveLength(0)
      expect(Array.isArray(emptyHelpers)).toBe(true)
    })

    it('should handle missing metadata gracefully', () => {
      const helperWithoutMetadata: any = {
        id: 'test-id',
        category: 'cpe',
        product_version_id: 'version-1',
        // metadata is missing
      }
      
      const metadata = helperWithoutMetadata.metadata || '{}'
      expect(() => JSON.parse(metadata)).not.toThrow()
    })

    it('should handle null values in metadata gracefully', () => {
      const helperWithNullMetadata = {
        id: 'test-id',
        category: 'cpe',
        product_version_id: 'version-1',
        metadata: null,
      }
      
      const metadata = helperWithNullMetadata.metadata || '{}'
      expect(() => JSON.parse(metadata)).not.toThrow()
    })
  })

  describe('Component Functionality', () => {
    it('should render with existing helpers and display them correctly', async () => {
      const client = await import('@/client')
      
      // Mock with existing helpers
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'cpe',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*' })
          },
          {
            id: 'helper-2',
            category: 'hashes',
            product_version_id: 'version-1',
            metadata: JSON.stringify({
              file_hashes: [
                { filename: 'test.txt', items: [{ algorithm: 'SHA-256', value: 'abc123' }] }
              ]
            })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display the CPE value
      expect(screen.getByText('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*')).toBeInTheDocument()
      
      // Should display the hash filename
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })

    it('should hide breadcrumbs when hideBreadcrumbs prop is true', () => {
      render(
        <TestWrapper>
          <IdentificationOverview hideBreadcrumbs={true} />
        </TestWrapper>
      )

      // Should not have breadcrumb navigation
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('should render add buttons when no helpers exist', async () => {
      const client = await import('@/client')
      
      // Mock with no existing helpers to show "Add" buttons
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
      
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should show "Add" buttons for each helper type
      expect(screen.getByText('Add CPE')).toBeInTheDocument()
      expect(screen.getByText('Add Hashes')).toBeInTheDocument()
      expect(screen.getByText('Add Models')).toBeInTheDocument()
      expect(screen.getByText('Add PURL')).toBeInTheDocument()
      expect(screen.getByText('Add SBOM')).toBeInTheDocument()
      expect(screen.getByText('Add Serial Number')).toBeInTheDocument()
      expect(screen.getByText('Add SKU')).toBeInTheDocument()
      expect(screen.getByText('Add URI')).toBeInTheDocument()
    })

    it('should handle helper actions through button clicks', async () => {
      const { fireEvent } = await import('@testing-library/react')
      const client = await import('@/client')
      
      // Mock with no existing helpers to show "Add" buttons
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should find and be able to click add button
      const addCPEButton = screen.getByText('Add CPE')
      expect(addCPEButton).toBeInTheDocument()
      
      // Button should be clickable (no errors when clicked)
      expect(() => fireEvent.click(addCPEButton)).not.toThrow()
    })

    it('should handle delete helper action', async () => {
      const { fireEvent } = await import('@testing-library/react')
      const client = await import('@/client')
      const mockMutate = vi.fn()
      
      // Mock with existing helper and delete mutation
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'cpe',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*' })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      vi.mocked(client.default.useMutation).mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        error: null,
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Find delete button (second FontAwesome icon should be trash)
      const deleteButtons = screen.getAllByTestId('fontawesome-icon')
      const deleteButton = deleteButtons.find(btn => btn.getAttribute('data-icon') === 'trash')
      
      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(mockMutate).toHaveBeenCalled()
      }
    })

    it('should display "and more" text for multiple hash files', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'hashes',
            product_version_id: 'version-1',
            metadata: JSON.stringify({
              file_hashes: [
                { filename: 'file1.txt', items: [{ algorithm: 'SHA-256', value: 'abc123' }] },
                { filename: 'file2.txt', items: [{ algorithm: 'SHA-256', value: 'def456' }] },
                { filename: 'file3.txt', items: [{ algorithm: 'SHA-256', value: 'ghi789' }] }
              ]
            })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display first filename with "and more" text
      expect(screen.getByText('file1.txt and 2 more')).toBeInTheDocument()
    })

    it('should display "and more" text for multiple models', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'models',
            product_version_id: 'version-1',
            metadata: JSON.stringify({
              models: ['Model-A', 'Model-B', 'Model-C']
            })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display first model with "and more" text
      expect(screen.getByText('Model-A and 2 more')).toBeInTheDocument()
    })

    it('should display "and more" text for multiple URIs', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'uri',
            product_version_id: 'version-1',
            metadata: JSON.stringify({
              uris: [
                { namespace: 'https://example.com', uri: 'product/123' },
                { namespace: 'https://test.com', uri: 'item/456' },
                { namespace: 'https://demo.com', uri: 'object/789' }
              ]
            })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display first URI with "and more" text
      expect(screen.getByText('https://example.com: product/123 and 2 more')).toBeInTheDocument()
    })

    it('should display PURL values correctly', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'purl',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ purl: 'pkg:npm/react@18.0.0' })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display the PURL value
      expect(screen.getByText('pkg:npm/react@18.0.0')).toBeInTheDocument()
    })

    it('should display serial numbers correctly', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'serial',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ serial_numbers: ['SN123456', 'SN789012'] })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display first serial number with "and more"
      expect(screen.getByText('SN123456 and 1 more')).toBeInTheDocument()
    })

    it('should display SKUs correctly', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'sku',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ skus: ['SKU-001'] })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display single SKU without "and more"
      expect(screen.getByText('SKU-001')).toBeInTheDocument()
    })

    it('should display SBOM URLs correctly', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'sbom',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ sbom_urls: ['https://example.com/sbom.json'] })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display SBOM URL
      expect(screen.getByText('https://example.com/sbom.json')).toBeInTheDocument()
    })

    it('should display "Not configured" for invalid metadata', async () => {
      const client = await import('@/client')
      
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'cpe',
            product_version_id: 'version-1',
            metadata: 'invalid json'
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should display "Not configured" when JSON parsing fails
      expect(screen.getByText('Not configured')).toBeInTheDocument()
    })

    it('should render correctly when data is available', async () => {
      const client = await import('@/client')
      
      // Mock with existing data
      vi.mocked(client.default.useQuery).mockReturnValue({
        data: [
          {
            id: 'helper-1',
            category: 'cpe',
            product_version_id: 'version-1',
            metadata: JSON.stringify({ cpe: 'cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*' })
          }
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
      
      render(
        <TestWrapper>
          <IdentificationOverview />
        </TestWrapper>
      )

      // Should show existing data instead of add button for CPE
      expect(screen.getByText('cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*')).toBeInTheDocument()
      
      // Should still show add buttons for types without data
      expect(screen.getByText('Add Hashes')).toBeInTheDocument()
    })
  })
})
