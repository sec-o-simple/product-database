import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from '../src/components/forms/Sidebar'

describe('Sidebar', () => {
  it('should render with attributes and actions', () => {
    const attributes = [
      <div key="attr1" data-testid="attribute-1">
        Attribute 1
      </div>,
      <div key="attr2" data-testid="attribute-2">
        Attribute 2
      </div>,
    ]

    const actions = <button data-testid="action-button">Save</button>

    render(
      <Sidebar attributes={attributes} actions={actions}>
        <div data-testid="children">Content</div>
      </Sidebar>,
    )

    expect(screen.getByTestId('attribute-1')).toBeInTheDocument()
    expect(screen.getByTestId('attribute-2')).toBeInTheDocument()
    expect(screen.getByTestId('action-button')).toBeInTheDocument()
    expect(screen.getByTestId('children')).toBeInTheDocument()
  })

  it('should render with single attribute', () => {
    const attribute = <div data-testid="single-attribute">Single Attribute</div>

    render(<Sidebar attributes={attribute} />)

    expect(screen.getByTestId('single-attribute')).toBeInTheDocument()
  })

  it('should render without attributes and actions', () => {
    render(
      <Sidebar>
        <div data-testid="only-children">Only Children</div>
      </Sidebar>,
    )

    expect(screen.getByTestId('only-children')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    render(
      <Sidebar>
        <div data-testid="content">Content</div>
      </Sidebar>,
    )

    // Check the outermost div has the correct classes
    const container = screen.getByTestId('content')
    const sidebarContainer = container.closest(
      '[class*="flex"][class*="w-1/3"]',
    )
    expect(sidebarContainer).toBeInTheDocument()
  })
})
