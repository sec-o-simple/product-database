import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DataGrid, {
  Titlebar,
  FilterButton,
} from '../src/components/forms/DataGrid'

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <div data-testid="fa-icon">{icon.iconName || icon || 'icon'}</div>
  )
}))

// Mock HeroUI Button
vi.mock('@heroui/button', () => ({
  Button: ({ children, startContent, onPress, variant, ...props }: any) => (
    <button 
      onClick={onPress}
      data-variant={variant}
      {...props}
    >
      {startContent}
      {children}
    </button>
  )
}))

// Mock the EmptyState component
vi.mock('../src/components/table/EmptyState', () => ({
  EmptyState: ({ add }: { add?: React.ReactNode }) => (
    <div data-testid="empty-state">
      Empty State
      {add && <div data-testid="add-content">{add}</div>}
    </div>
  ),
}))

describe('Titlebar', () => {
  it('should render title', () => {
    render(<Titlebar title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})

describe('FilterButton', () => {
  it('should render with icon and title', () => {
    // Using faAdd as a test icon since it's commonly used in the codebase
    const mockIcon = { iconName: 'filter', prefix: 'fas' } as any
    const handleClick = vi.fn()

    render(
      <FilterButton
        icon={mockIcon}
        title="Filter Items"
        onPress={handleClick}
        data-testid="filter-button"
      />,
    )

    const button = screen.getByTestId('filter-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'light')
    
    // Check that icon is rendered
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveTextContent('filter')
    
    // Check that title is rendered
    expect(button).toHaveTextContent('Filter Items')
    
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('DataGrid', () => {
  it('should render without title and actions', () => {
    render(
      <DataGrid>
        <div data-testid="child">Child Content</div>
      </DataGrid>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should render with title and actions', () => {
    const actions = <button data-testid="action-button">Action</button>
    
    render(
      <DataGrid title="Test Grid" actions={actions}>
        <div data-testid="child">Child Content</div>
      </DataGrid>,
    )

    expect(screen.getByText('Test Grid')).toBeInTheDocument()
    expect(screen.getByTestId('action-button')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should show empty state when no children', () => {
    const addButton = <button data-testid="add-button">Add Item</button>
    
    render(<DataGrid addButton={addButton}>{[]}</DataGrid>)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('add-content')).toBeInTheDocument()
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
  })

  it('should not show empty state when children exist', () => {
    render(
      <DataGrid>
        <div data-testid="child">Content</div>
      </DataGrid>,
    )

    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <DataGrid>
        <div data-testid="child1">Content 1</div>
        <div data-testid="child2">Content 2</div>
      </DataGrid>,
    )

    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
  })
})
