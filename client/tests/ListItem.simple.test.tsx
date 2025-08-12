import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ListItem from '../src/components/forms/ListItem'
import { SelectableContext } from '../src/routes/Products'

describe('ListItem Simple Tests', () => {
  it('should render basic ListItem', () => {
    const mockContext = {
      selectable: false,
      selected: [],
      setSelected: vi.fn(),
      toggleSelectable: vi.fn(),
    }

    render(
      <SelectableContext.Provider value={mockContext}>
        <ListItem id="test" title="Test Title" />
      </SelectableContext.Provider>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
