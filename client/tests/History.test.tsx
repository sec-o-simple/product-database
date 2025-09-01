import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Extend Vitest's expect with jest-dom matchers
import '@testing-library/jest-dom'

// Mock external dependencies
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: vi.fn(({ icon, className }) => (
    <span data-testid="fontawesome-icon" data-icon={icon?.iconName} className={className}>
      {icon?.iconName}
    </span>
  )),
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faRefresh: { iconName: 'refresh' },
  faTimeline: { iconName: 'timeline' },
  faFolderOpen: { iconName: 'folder-open' },
}))

vi.mock('@heroui/button', () => ({
  Button: vi.fn(({ children, onPress, variant, className, ...props }) => (
    <button
      onClick={onPress}
      data-variant={variant}
      className={className}
      data-testid="heroui-button"
      {...props}
    >
      {children}
    </button>
  )),
}))

vi.mock('@heroui/chip', () => ({
  Chip: vi.fn(({ children, color, variant, ...props }) => (
    <span
      data-color={color}
      data-variant={variant}
      data-testid="heroui-chip"
      {...props}
    >
      {children}
    </span>
  )),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import History from '../src/components/layout/History'

describe('History', () => {
  const mockUpdates = [
    {
      id: '1',
      title: 'First Update',
      description: 'Description 1',
      date: '2024-01-01',
    },
    {
      id: '2',
      title: 'Second Update',
      description: 'Description 2',
      date: '2024-01-02',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the history title', () => {
    render(<History updates={mockUpdates} />)

    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('History')).toHaveClass('text-2xl', 'font-bold')
  })

  it('should display the correct update count', () => {
    render(<History updates={mockUpdates} />)

    expect(screen.getByText('2 Updates')).toBeInTheDocument()
  })

  it('should display zero updates count when no updates', () => {
    render(<History updates={[]} />)

    expect(screen.getByText('0 Updates')).toBeInTheDocument()
  })

  it('should render refresh button with correct styling', () => {
    const mockRefetch = vi.fn()
    render(<History updates={mockUpdates} refetch={mockRefetch} />)

    const refreshButton = screen.getByTestId('heroui-button')
    expect(refreshButton).toBeInTheDocument()
    expect(refreshButton).toHaveAttribute('data-variant', 'bordered')
    expect(refreshButton).toHaveClass('rounded-xl')
    expect(refreshButton).toHaveTextContent('Refresh')
  })

  it('should render refresh icon in button', () => {
    const mockRefetch = vi.fn()
    render(<History updates={mockUpdates} refetch={mockRefetch} />)

    const refreshIcon = screen.getAllByTestId('fontawesome-icon').find(
      icon => icon.getAttribute('data-icon') === 'refresh'
    )
    expect(refreshIcon).toBeInTheDocument()
    expect(refreshIcon).toHaveAttribute('data-icon', 'refresh')
  })

  it('should call refetch when refresh button is clicked', () => {
    const mockRefetch = vi.fn()
    render(<History updates={mockUpdates} refetch={mockRefetch} />)

    const refreshButton = screen.getByTestId('heroui-button')
    fireEvent.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('should not crash when refetch is not provided and button is clicked', () => {
    render(<History updates={mockUpdates} />)

    const refreshButton = screen.getByTestId('heroui-button')
    expect(() => fireEvent.click(refreshButton)).not.toThrow()
  })

  it('should render EmptyState when no updates', () => {
    render(<History updates={[]} />)

    // The EmptyState is rendered inline, so we check for its characteristic content
    expect(screen.getByText('common.emptyState.title')).toBeInTheDocument()
    expect(screen.getByText('common.emptyState.description')).toBeInTheDocument()
    
    // Check for the folder-open icon in the EmptyState
    const folderIcon = screen.getAllByTestId('fontawesome-icon').find(
      icon => icon.getAttribute('data-icon') === 'folder-open'
    )
    expect(folderIcon).toBeInTheDocument()
  })

  it('should not render EmptyState when updates exist', () => {
    render(<History updates={mockUpdates} />)

    expect(screen.queryByText('common.emptyState.title')).not.toBeInTheDocument()
    expect(screen.queryByText('common.emptyState.description')).not.toBeInTheDocument()
  })

  it('should render updates correctly without ListItem mock', () => {
    render(<History updates={mockUpdates} />)

    // The actual component renders the updates, so we should see the titles
    expect(screen.getByText('First Update')).toBeInTheDocument()
    expect(screen.getByText('Second Update')).toBeInTheDocument()
  })

  it('should render timeline chip for each update with correct date', () => {
    render(<History updates={mockUpdates} />)

    const chips = screen.getAllByTestId('heroui-chip')
    expect(chips).toHaveLength(2)
    
    expect(chips[0]).toHaveAttribute('data-color', 'primary')
    expect(chips[0]).toHaveAttribute('data-variant', 'flat')
    expect(chips[0]).toHaveTextContent('Changed at: 2024-01-01')
    
    expect(chips[1]).toHaveTextContent('Changed at: 2024-01-02')
  })

  it('should render timeline icons in chips', () => {
    render(<History updates={mockUpdates} />)

    const timelineIcons = screen.getAllByTestId('fontawesome-icon').filter(
      icon => icon.getAttribute('data-icon') === 'timeline'
    )
    expect(timelineIcons).toHaveLength(2)
    
    timelineIcons.forEach(icon => {
      expect(icon).toHaveClass('mr-2')
    })
  })

  it('should handle single update correctly', () => {
    const singleUpdate = [mockUpdates[0]]
    render(<History updates={singleUpdate} />)

    expect(screen.getByText('1 Updates')).toBeInTheDocument()
    expect(screen.getByText('First Update')).toBeInTheDocument()
    expect(screen.queryByText('Second Update')).not.toBeInTheDocument()
    expect(screen.queryByText('common.emptyState.title')).not.toBeInTheDocument()
  })

  it('should maintain proper component structure', () => {
    const { container } = render(<History updates={mockUpdates} />)

    // Check main container - should be the first child of the container
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('flex', 'w-full', 'flex-col', 'gap-4')

    // Check header structure - find the div with justify-between class
    const headerSection = mainContainer.querySelector('.justify-between')
    expect(headerSection).toHaveClass('flex', 'flex-row', 'items-center', 'justify-between', 'align-middle')
    
    // Check the inner header div with History text
    const innerHeaderDiv = headerSection?.querySelector('.items-center.gap-4')
    expect(innerHeaderDiv).toHaveClass('flex', 'flex-row', 'items-center', 'gap-4')
  })
})
