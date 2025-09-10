import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HSplit from '../src/components/forms/HSplit'
import VSplit from '../src/components/forms/VSplit'

describe('HSplit', () => {
  it('should render children with horizontal layout', () => {
    render(
      <HSplit>
        <div data-testid="child1">Content 1</div>
        <div data-testid="child2">Content 2</div>
      </HSplit>,
    )

    const container = screen.getByTestId('child1').parentElement
    expect(container).toHaveClass('flex', 'gap-4')
    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <HSplit className="bg-red-500">
        <div data-testid="child">Content</div>
      </HSplit>,
    )

    const container = screen.getByTestId('child').parentElement
    expect(container).toHaveClass('flex', 'gap-4', 'bg-red-500')
  })
})

describe('VSplit', () => {
  it('should render children with vertical layout', () => {
    render(
      <VSplit>
        <div data-testid="child1">Content 1</div>
        <div data-testid="child2">Content 2</div>
      </VSplit>,
    )

    const container = screen.getByTestId('child1').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4')
    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <VSplit className="bg-blue-500">
        <div data-testid="child">Content</div>
      </VSplit>,
    )

    const container = screen.getByTestId('child').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4', 'bg-blue-500')
  })
})
