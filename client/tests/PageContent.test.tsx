import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageContent, { PageOutlet } from '../src/components/forms/PageContent'

describe('PageContent', () => {
  it('should render children with correct styling', () => {
    render(
      <PageContent>
        <div data-testid="child">Test Content</div>
      </PageContent>,
    )

    const container = screen.getByTestId('child').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4', 'p-2')
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})

describe('PageOutlet', () => {
  it('should render children with correct styling', () => {
    render(
      <PageOutlet>
        <div data-testid="child">Test Content</div>
      </PageOutlet>,
    )

    const container = screen.getByTestId('child').parentElement
    expect(container).toHaveClass('grow', 'overflow-scroll', 'p-4')
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
