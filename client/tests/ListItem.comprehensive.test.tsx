import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ListItem, { ListGroup } from '../src/components/forms/ListItem'
import { SelectableContext } from '../src/routes/Products'

const mockSelectableContext = {
  selectable: false,
  selected: [] as string[],
  setSelected: vi.fn(),
  toggleSelectable: vi.fn(),
}

const SelectableTestWrapper = ({ 
  children, 
  contextValue = mockSelectableContext 
}: { 
  children: React.ReactNode
  contextValue?: typeof mockSelectableContext 
}) => (
  <SelectableContext.Provider value={contextValue}>
    {children}
  </SelectableContext.Provider>
)

describe('ListGroup Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with title and children', () => {
    render(
      <ListGroup title="Test Group">
        <div data-testid="test-child">Test Child</div>
      </ListGroup>
    )

    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('should render with header actions', () => {
    render(
      <ListGroup 
        title="Test Group" 
        headerActions={<button data-testid="header-action">Action</button>}
      >
        <div>Test Child</div>
      </ListGroup>
    )

    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByTestId('header-action')).toBeInTheDocument()
  })
})

describe('ListItem Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with title', () => {
      render(
        <SelectableTestWrapper>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should render with description', () => {
      render(
        <SelectableTestWrapper>
          <ListItem id="test-1" title="Test Item" description="Test description" />
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(screen.getByText('- Test description')).toBeInTheDocument()
    })

    it('should render with chips', () => {
      render(
        <SelectableTestWrapper>
          <ListItem 
            id="test-1" 
            title="Test Item" 
            chips={<span data-testid="test-chip">Test Chip</span>}
          />
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(screen.getByTestId('test-chip')).toBeInTheDocument()
    })

    it('should render with actions', () => {
      render(
        <SelectableTestWrapper>
          <ListItem 
            id="test-1" 
            title="Test Item" 
            actions={<button data-testid="test-action">Action</button>}
          />
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(screen.getByTestId('test-action')).toBeInTheDocument()
    })
  })

  describe('Click Handling', () => {
    it('should call onClick when clicked in non-selectable mode', () => {
      const mockOnClick = vi.fn()
      const nonSelectableContext = {
        selectable: false,
        selected: [] as string[],
        setSelected: vi.fn(),
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={nonSelectableContext}>
          <ListItem id="test-1" title="Test Item" onClick={mockOnClick} />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      fireEvent.click(listItem!)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should handle selection when clicked in selectable mode', () => {
      const mockSetSelected = vi.fn()
      const selectableContext = {
        selectable: true,
        selected: [] as string[],
        setSelected: mockSetSelected,
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={selectableContext}>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      fireEvent.click(listItem!)

      expect(mockSetSelected).toHaveBeenCalledTimes(1)
      expect(mockSetSelected).toHaveBeenCalledWith(['test-1'])
    })

    it('should handle deselection when already selected item clicked', () => {
      const mockSetSelected = vi.fn()
      const selectableContext = {
        selectable: true,
        selected: ['test-1'] as string[],
        setSelected: mockSetSelected,
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={selectableContext}>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      fireEvent.click(listItem!)

      expect(mockSetSelected).toHaveBeenCalledTimes(1)
      expect(mockSetSelected).toHaveBeenCalledWith([])
    })

    it('should prioritize selection over onClick in selectable mode', () => {
      const mockOnClick = vi.fn()
      const mockSetSelected = vi.fn()
      const selectableContext = {
        selectable: true,
        selected: [] as string[],
        setSelected: mockSetSelected,
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={selectableContext}>
          <ListItem id="test-1" title="Test Item" onClick={mockOnClick} />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      fireEvent.click(listItem!)

      expect(mockSetSelected).toHaveBeenCalledTimes(1)
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('Styling and CSS Classes', () => {
    it('should apply selected styling when item is selected', () => {
      const selectableContext = {
        selectable: true,
        selected: ['test-1'] as string[],
        setSelected: vi.fn(),
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={selectableContext}>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      expect(listItem).toHaveClass('bg-gray-50', 'border-primary-500')
    })

    it('should apply base CSS classes', () => {
      const { container } = render(
        <SelectableTestWrapper>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      expect(listItem).toHaveClass('group', 'flex', 'w-full', 'rounded-lg', 'bg-white')
    })

    it('should apply selectable classes when in selectable mode', () => {
      const selectableContext = {
        selectable: true,
        selected: [] as string[],
        setSelected: vi.fn(),
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={selectableContext}>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      const listItem = container.querySelector('div[class*="group"]')
      expect(listItem).toHaveClass('selectable', 'hover:bg-gray-100')
    })
  })

  describe('Edge Cases', () => {
    it('should render with React node as title', () => {
      render(
        <SelectableTestWrapper>
          <ListItem 
            id="test-1" 
            title={<span data-testid="custom-title">Custom Title</span>} 
          />
        </SelectableTestWrapper>
      )

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render without chips when none provided', () => {
      const { container } = render(
        <SelectableTestWrapper>
          <ListItem id="test-1" title="Test Item" />
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(container.querySelector('.pb-1')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should work with multiple ListItem components in same context', () => {
      const selectableContext = {
        selectable: true,
        selected: ['test-2'] as string[],
        setSelected: vi.fn(),
        toggleSelectable: vi.fn(),
      }

      const { container } = render(
        <SelectableTestWrapper contextValue={selectableContext}>
          <ListItem id="test-1" title="Item 1" />
          <ListItem id="test-2" title="Item 2" />
          <ListItem id="test-3" title="Item 3" />
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()

      // Find all divs that have the actual ListItem containers (parent of group divs)
      const allContainers = container.querySelectorAll('div')
      const groupDivs = Array.from(allContainers).filter(div => 
        div.className.includes('group') && 
        div.className.includes('flex') && 
        div.className.includes('w-full')
      )
      
      expect(groupDivs[0]).not.toHaveClass('bg-gray-50', 'border-primary-500')
      expect(groupDivs[1]).toHaveClass('bg-gray-50', 'border-primary-500')
      expect(groupDivs[2]).not.toHaveClass('bg-gray-50', 'border-primary-500')
    })

    it('should work within ListGroup component', () => {
      render(
        <SelectableTestWrapper>
          <ListGroup title="Test Group">
            <ListItem id="test-1" title="Item 1" />
            <ListItem id="test-2" title="Item 2" />
          </ListGroup>
        </SelectableTestWrapper>
      )

      expect(screen.getByText('Test Group')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })
})
