import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock react-router hooks
const mockUseLocation = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    NavLink: vi.fn(({ children, to, className, ...props }) => {
      // Handle both string and function className
      const resolvedClassName = typeof className === 'function' 
        ? className({ isActive: false }) 
        : className
      
      return (
        <a href={to} className={resolvedClassName} data-testid={`navlink-${to}`} {...props}>
          {children}
        </a>
      )
    }),
  }
})

import NavigationLayout from '../src/components/layout/NavigationLayout'

// Mock wrapper component since we're mocking the router
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <div data-testid="test-wrapper">{children}</div>
}

describe('NavigationLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the navigation layout structure', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    // Check main structure
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    
    // Check section titles
    expect(screen.getByText('Document Information')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument()
  })

  it('should render section numbers', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render document information subsections', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Publisher')).toBeInTheDocument()
    expect(screen.getByText('References')).toBeInTheDocument()
  })

  it('should create correct navigation links for main sections', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('navlink-/document-information')).toBeInTheDocument()
    expect(screen.getByTestId('navlink-/products')).toBeInTheDocument()
    expect(screen.getByTestId('navlink-/vulnerabilities')).toBeInTheDocument()
  })

  it('should create correct navigation links for subsections', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    expect(screen.getByTestId('navlink-/document-information/general')).toBeInTheDocument()
    expect(screen.getByTestId('navlink-/document-information/notes')).toBeInTheDocument()
    expect(screen.getByTestId('navlink-/document-information/publisher')).toBeInTheDocument()
    expect(screen.getByTestId('navlink-/document-information/references')).toBeInTheDocument()
  })

  it('should apply active styles when on document-information route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/document-information' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const documentInfoLink = screen.getByTestId('navlink-/document-information')
    expect(documentInfoLink).toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
  })

  it('should apply active styles when on document-information subroute', () => {
    mockUseLocation.mockReturnValue({ pathname: '/document-information/general' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const documentInfoLink = screen.getByTestId('navlink-/document-information')
    expect(documentInfoLink).toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
  })

  it('should apply active styles when on products route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/products' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const productsLink = screen.getByTestId('navlink-/products')
    expect(productsLink).toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
  })

  it('should apply active styles when on vulnerabilities route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/vulnerabilities' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const vulnerabilitiesLink = screen.getByTestId('navlink-/vulnerabilities')
    expect(vulnerabilitiesLink).toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
  })

  it('should not apply active styles when on unrelated route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/some-other-route' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const documentInfoLink = screen.getByTestId('navlink-/document-information')
    const productsLink = screen.getByTestId('navlink-/products')
    const vulnerabilitiesLink = screen.getByTestId('navlink-/vulnerabilities')

    expect(documentInfoLink).not.toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
    expect(productsLink).not.toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
    expect(vulnerabilitiesLink).not.toHaveClass('bg-content2', 'font-semibold', 'text-foreground')
  })

  it('should apply active number styles when section is active', () => {
    mockUseLocation.mockReturnValue({ pathname: '/products' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const productsSection = screen.getByTestId('navlink-/products')
    const numberElement = productsSection.querySelector('div')
    
    expect(numberElement).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('should render outlet for nested routes', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' })

    render(
      <TestWrapper>
        <NavigationLayout />
      </TestWrapper>
    )

    const outlet = screen.getByTestId('outlet')
    expect(outlet).toBeInTheDocument()
    expect(outlet).toHaveTextContent('Outlet Content')
  })
})
