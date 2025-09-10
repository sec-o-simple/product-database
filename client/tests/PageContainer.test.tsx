import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageContainer from '../src/components/forms/PageContainer'

describe('PageContainer', () => {
  it('should render children with correct styling', () => {
    render(
      <PageContainer>
        <div data-testid="child">Test Content</div>
      </PageContainer>,
    )

    const container = screen.getByTestId('child').parentElement
    expect(container).toHaveClass(
      'flex',
      'h-screen',
      'flex-col',
      'bg-[#F9FAFB]',
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <PageContainer>
        <div data-testid="child1">Content 1</div>
        <div data-testid="child2">Content 2</div>
      </PageContainer>,
    )

    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
  })
})
