import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Breadcrumbs from '../src/components/forms/Breadcrumbs'

describe('Breadcrumbs', () => {
  it('should render breadcrumbs navigation component', () => {
    render(
      <Breadcrumbs>
        <span>Test</span>
      </Breadcrumbs>,
    )

    // Check if the nav element exists
    const nav = screen.getByRole('navigation', { name: 'Breadcrumbs' })
    expect(nav).toBeInTheDocument()
  })

  it('should have correct ARIA structure', () => {
    render(
      <Breadcrumbs>
        <span>Test</span>
      </Breadcrumbs>,
    )

    // The component should render the HeroUI Breadcrumbs component with correct structure
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumbs')
    
    const list = nav.querySelector('ol')
    expect(list).toBeInTheDocument()
  })
})
