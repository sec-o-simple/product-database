import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Latest from '../src/components/forms/Latest'

// Mock HeroUI Chip
vi.mock('@heroui/chip', () => ({
  Chip: ({ children, variant, color, className, ...props }: any) => (
    <div
      role="status"
      data-testid="chip"
      data-variant={variant}
      data-color={color}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}))

describe('Latest', () => {
  it('should render latest chip', () => {
    const { getByTestId } = render(<Latest />)
    const chip = getByTestId('chip')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveTextContent('Latest')
  })

  it('should have correct styling classes', () => {
    const { getByTestId } = render(<Latest />)
    const chip = getByTestId('chip')
    expect(chip).toHaveClass('rounded-md')
  })

  it('should be a flat primary colored chip', () => {
    const { getByTestId } = render(<Latest />)
    const chip = getByTestId('chip')
    expect(chip).toBeInTheDocument()
    expect(chip).toHaveAttribute('data-variant', 'flat')
    expect(chip).toHaveAttribute('data-color', 'primary')
  })
})
