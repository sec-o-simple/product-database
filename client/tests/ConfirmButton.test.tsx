import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import React from 'react'
import ConfirmButton from '@/components/forms/ConfirmButton'

// Initialize i18n for testing
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        'common.confirm': 'Confirm',
        'common.cancel': 'Cancel',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span data-testid="fontawesome-icon" data-icon={icon.iconName} {...props} />
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

describe('ConfirmButton', () => {
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render button with default text', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      expect(screen.getByText('Delete Item')).toBeInTheDocument()
    })

    it('should render button with custom confirm title', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Custom Confirm Title"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      expect(screen.getByText('Custom Confirm Title')).toBeInTheDocument()
    })

    it('should render button with custom confirm text', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            confirmText="Are you absolutely sure?"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument()
    })

    it('should render with custom confirm content', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            confirmContent={<div data-testid="custom-content">Custom warning message</div>}
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Custom warning message')).toBeInTheDocument()
    })
  })

  describe('Modal Behavior', () => {
    it('should open confirmation modal when button is clicked', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      // Should show confirmation modal
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('should close modal when cancel is clicked', async () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
      })
    })

    it('should call onConfirm and close modal when confirm is clicked', async () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
      })

      expect(mockOnConfirm).toHaveBeenCalled()
    })

    it('should close modal when close button is clicked', async () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      // Modal should be open
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument()

      // Click the close button (X)
      const closeButton = screen.getByLabelText('Close')
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
      })
    })
  })

  describe('Button Variants', () => {
    it('should render with default button props', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with custom variant', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
            variant="bordered"
          >
            Warning Action
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with custom size', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
            size="lg"
          >
            Large Button
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with custom color', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
            color="danger"
          >
            Danger Button
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Loading and Disabled States', () => {
    it('should show loading state when isLoading is true', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
            isLoading={true}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should disable button when isDisabled is true', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
            isDisabled={true}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not open modal when button is disabled', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
            isDisabled={true}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Modal should not open
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button attributes', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have modal with proper role', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })

    it('should support keyboard navigation in modal', async () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      // Should be able to find both modal buttons
      const confirmButton = screen.getByText('Confirm')
      const cancelButton = screen.getByText('Cancel')

      expect(confirmButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('Custom Content and Children', () => {
    it('should render custom children content', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
          >
            <span data-testid="custom-content">Custom Delete Button</span>
          </ConfirmButton>
        </TestWrapper>
      )

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Custom Delete Button')).toBeInTheDocument()
    })

    it('should render with icon and text', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            <span data-testid="fontawesome-icon" data-icon="trash" />
            Delete
          </ConfirmButton>
        </TestWrapper>
      )

      expect(screen.getByTestId('fontawesome-icon')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render default text when no children provided', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle multiple rapid clicks', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      
      // Click multiple times rapidly
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // Should only open one modal
      const modals = screen.getAllByRole('dialog')
      expect(modals).toHaveLength(1)
    })

    it('should handle empty confirmTitle', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle=""
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      // Should fallback to default title - check for header with Confirm
      expect(screen.getByRole('dialog')).toHaveTextContent('Confirm')
      // Should still have the confirm button
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    })

    it('should handle both confirmText and confirmContent', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            confirmText="This will permanently delete the item."
            confirmContent={<div data-testid="extra-content">Additional warning</div>}
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      expect(screen.getByText('This will permanently delete the item.')).toBeInTheDocument()
      expect(screen.getByTestId('extra-content')).toBeInTheDocument()
    })
  })

  describe('Integration with HeroUI', () => {
    it('should pass through button props correctly', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Action"
            onConfirm={mockOnConfirm}
            fullWidth={true}
            className="custom-class"
          >
            Full Width Button
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should respect modal size prop', () => {
      render(
        <TestWrapper>
          <ConfirmButton 
            confirmTitle="Confirm Delete"
            onConfirm={mockOnConfirm}
          >
            Delete Item
          </ConfirmButton>
        </TestWrapper>
      )

      const button = screen.getByText('Delete Item')
      fireEvent.click(button)

      // Modal should have xl size by default
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })
  })
})
