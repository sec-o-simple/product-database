import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock the HeroUI Select component to capture props
vi.mock('@heroui/select', () => ({
  Select: vi.fn(({ children, ...props }) => (
    <select data-testid="heroui-select" {...props}>
      {children}
    </select>
  )),
}))

import Select from '../src/components/forms/Select'
import { Select as MockedSelect } from '@heroui/select'

const mockHeroUISelect = MockedSelect as ReturnType<typeof vi.fn>

describe('Select', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    render(<Select><option value="test">Test</option></Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        labelPlacement: 'outside',
        placeholder: ' ',
        variant: 'bordered',
        classNames: {
          trigger: 'border-1 shadow-none',
        },
      }),
      {}
    )
  })

  it('should use provided labelPlacement prop', () => {
    render(<Select labelPlacement="inside"><option value="test">Test</option></Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        labelPlacement: 'inside',
        placeholder: ' ',
        variant: 'bordered',
      }),
      {}
    )
  })

  it('should use provided placeholder prop', () => {
    render(<Select placeholder="Choose an option"><option value="test">Test</option></Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        labelPlacement: 'outside',
        placeholder: 'Choose an option',
        variant: 'bordered',
      }),
      {}
    )
  })

  it('should use provided variant prop', () => {
    render(<Select variant="underlined"><option value="test">Test</option></Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        labelPlacement: 'outside',
        placeholder: ' ',
        variant: 'underlined',
      }),
      {}
    )
  })

  it('should pass through additional props', () => {
    const additionalProps = {
      label: 'Test Label',
      isRequired: true,
      size: 'sm' as const,
    }

    render(<Select {...additionalProps}><option value="test">Test</option></Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        ...additionalProps,
        labelPlacement: 'outside',
        placeholder: ' ',
        variant: 'bordered',
        classNames: {
          trigger: 'border-1 shadow-none',
        },
      }),
      {}
    )
  })

  it('should override default props with provided props', () => {
    render(
      <Select 
        labelPlacement="inside"
        placeholder="Custom placeholder"
        variant="flat"
        isDisabled={true}
      >
        <option value="test">Test</option>
      </Select>
    )

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        labelPlacement: 'inside',
        placeholder: 'Custom placeholder',
        variant: 'flat',
        isDisabled: true,
        classNames: {
          trigger: 'border-1 shadow-none',
        },
      }),
      {}
    )
  })

  it('should always apply custom classNames for trigger', () => {
    render(<Select><option value="test">Test</option></Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        classNames: {
          trigger: 'border-1 shadow-none',
        },
      }),
      {}
    )
  })

  it('should handle children prop correctly', () => {
    const children = <option value="test">Test Option</option>

    render(<Select>{children}</Select>)

    expect(mockHeroUISelect).toHaveBeenCalledWith(
      expect.objectContaining({
        labelPlacement: 'outside',
        placeholder: ' ',
        variant: 'bordered',
        classNames: {
          trigger: 'border-1 shadow-none',
        },
        children,
      }),
      {}
    )
  })
})
