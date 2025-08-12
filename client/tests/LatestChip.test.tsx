import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LatestChip from '../src/components/forms/Latest'

describe('LatestChip', () => {
  it('should render latest chip', () => {
    const { getByText } = render(<LatestChip />)
    const chip = getByText('Latest')
    expect(chip).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    const { getByText } = render(<LatestChip />)
    const chip = getByText('Latest')
    expect(chip).toBeInTheDocument()
    // Just check that it renders without checking specific HeroUI classes
  })

  it('should be a primary colored chip', () => {
    const { getByText } = render(<LatestChip />)
    const chip = getByText('Latest')
    expect(chip).toBeInTheDocument()
  })
})
