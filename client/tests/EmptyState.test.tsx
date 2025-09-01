import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../src/components/table/EmptyState'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.emptyState.title': 'No data available',
        'common.emptyState.description': 'Get started by adding some data',
      }
      return translations[key] || key
    },
  }),
}))

describe('EmptyState', () => {
  it('should render default empty state', () => {
    render(<EmptyState />)

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'No data available',
    )
    expect(
      screen.getByText('Get started by adding some data'),
    ).toBeInTheDocument()
  })

  it('should render with add button', () => {
    const addButton = <button data-testid="add-button">Add Item</button>

    render(<EmptyState add={addButton} />)

    expect(screen.getByTestId('add-button')).toBeInTheDocument()
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    render(<EmptyState />)

    const container = screen.getByRole('heading', { level: 3 }).closest('div')
    expect(container).toHaveClass('px-6', 'py-16', 'text-center')
  })
})
