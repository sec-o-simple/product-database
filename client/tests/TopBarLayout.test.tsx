import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TopBar, default as TopBarLayout } from '@/components/layout/TopBarLayout'
import { PageOutlet } from '@/components/forms/PageContent'

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'title': 'Product Database',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Router Outlet</div>,
  }
})

vi.mock('@heroui/react', () => ({
  Button: ({ children, onPress, className, isIconOnly, ...props }: any) => (
    <button 
      onClick={onPress}
      className={className}
      data-testid="button"
      data-is-icon-only={isIconOnly}
      {...props}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}))

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => <span data-icon={icon.iconName} />,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TopBarLayout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TopBar Component', () => {
    it('should render with title and children', () => {
      render(
        <TestWrapper>
          <TopBar title="Test Title" navigateBack={false}>
            <div data-testid="child-content">Child Content</div>
          </TopBar>
        </TestWrapper>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('should render back button when navigateBack is true', () => {
      render(
        <TestWrapper>
          <TopBar title="Test Title" navigateBack={true}>
            Child Content
          </TopBar>
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2) // Home button + Back button
      
      // Check that FontAwesome icon spans are rendered
      const icons = screen.getAllByRole('generic', { hidden: true })
      const arrowLeftIcon = icons.find(icon => icon.getAttribute('data-icon') === 'arrow-left')
      expect(arrowLeftIcon).toBeInTheDocument()
    })

    it('should not render back button when navigateBack is false', () => {
      render(
        <TestWrapper>
          <TopBar title="Test Title" navigateBack={false}>
            <div>Child Content</div>
          </TopBar>
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1) // Only Home button
      
      // Check that only the home (database) icon is rendered, not the arrow-left
      const icons = screen.getAllByRole('generic', { hidden: true })
      const databaseIcon = icons.find(icon => icon.getAttribute('data-icon') === 'database')
      const arrowLeftIcon = icons.find(icon => icon.getAttribute('data-icon') === 'arrow-left')
      
      expect(databaseIcon).toBeInTheDocument()
      expect(arrowLeftIcon).toBeUndefined()
    })

    it('should render without children', () => {
      render(
        <TestWrapper>
          <TopBar title="Test Title" navigateBack={false} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should apply correct CSS classes', () => {
      const { container } = render(
        <TestWrapper>
          <TopBar title="Test Title" navigateBack={false}>
            <div>Child Content</div>
          </TopBar>
        </TestWrapper>
      )

      const topBarContainer = container.firstChild
      expect(topBarContainer).toHaveClass('flex', 'w-full', 'items-center', 'justify-between', 'gap-8', 'border-b', 'bg-white', 'px-6', 'py-4')
    })
  })

  describe('PageOutlet Component', () => {
    it('should render children with correct CSS classes', () => {
      const { container } = render(
        <TestWrapper>
          <PageOutlet>
            <div data-testid="page-content">Page Content</div>
          </PageOutlet>
        </TestWrapper>
      )

      expect(screen.getByTestId('page-content')).toBeInTheDocument()
      
      const pageOutletContainer = container.firstChild
      expect(pageOutletContainer).toHaveClass('grow', 'overflow-scroll', 'p-4')
    })

    it('should render with minimal content', () => {
      const { container } = render(
        <TestWrapper>
          <PageOutlet>
            <div />
          </PageOutlet>
        </TestWrapper>
      )

      const pageOutletContainer = container.firstChild
      expect(pageOutletContainer).toHaveClass('grow', 'overflow-scroll', 'p-4')
    })
  })

  describe('TopBarLayout Default Export', () => {
    it('should render complete layout with all components', () => {
      render(
        <TestWrapper>
          <TopBarLayout />
        </TestWrapper>
      )

      // Check title is rendered correctly
      expect(screen.getByText('Product Database')).toBeInTheDocument()
      
      // Check language switcher is rendered
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
      
      // Check outlet is rendered
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })

    it('should have correct layout structure', () => {
      const { container } = render(
        <TestWrapper>
          <TopBarLayout />
        </TestWrapper>
      )

      // Check main container has correct classes
      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'bg-[#F9FAFB]')
    })

    it('should not show back button in default layout', () => {
      render(
        <TestWrapper>
          <TopBarLayout />
        </TestWrapper>
      )

      // No back button should be present since navigateBack=false
      expect(screen.queryByTestId('button')).not.toBeInTheDocument()
    })
  })
})
