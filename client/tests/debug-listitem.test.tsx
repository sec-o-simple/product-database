import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ListItem from '../src/components/forms/ListItem'
import { SelectableContext } from '../src/routes/Products'

const mockSelectableContext = {
  selectable: false,
  selected: [] as string[],
  setSelected: vi.fn(),
  toggleSelectable: vi.fn(),
}

describe('Debug ListItem Structure', () => {
  it('should debug DOM structure', () => {
    const { container } = render(
      <SelectableContext.Provider value={mockSelectableContext}>
        <ListItem id="test-1" title="Test Item" />
      </SelectableContext.Provider>
    )

    console.log('DOM Structure:', container.innerHTML)
    
    // Find the main container (the div with the onClick handler)
    const listItem = container.querySelector('div[class*="group"]')
    console.log('Main div classes:', listItem?.className)
    
    // Find the text element
    const textElement = screen.getByText('Test Item')
    console.log('Text element classes:', textElement.className)
    console.log('Text element parent classes:', textElement.parentElement?.className)
    
    expect(true).toBe(true) // Just to make the test pass
  })
})
