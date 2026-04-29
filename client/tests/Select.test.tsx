import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Select from '@/components/forms/Select'

const heroSelectMock = vi.fn((props: any) => <div data-testid="hero-select">{props.children}</div>)

vi.mock('@heroui/react', () => ({
  Select: (props: any) => heroSelectMock(props),
}))

describe('Select', () => {
  beforeEach(() => {
    heroSelectMock.mockClear()
  })

  it('applies default select props when values are not provided', () => {
    render(<Select {...({ 'aria-label': 'Select' } as any)} />)

    const passedProps = heroSelectMock.mock.calls[0][0]
    expect(passedProps.labelPlacement).toBe('outside')
    expect(passedProps.placeholder).toBe(' ')
    expect(passedProps.variant).toBe('bordered')
    expect(passedProps.classNames).toEqual({
      trigger: 'border-1 shadow-none',
    })
  })

  it('uses explicitly provided props and forwards remaining props', () => {
    const onChange = vi.fn()

    render(
      <Select
        {...({
          'aria-label': 'Select',
          labelPlacement: 'inside',
          placeholder: 'Choose one',
          variant: 'flat',
          onChange,
        } as any)}
      />,
    )

    const passedProps = heroSelectMock.mock.calls[0][0]
    expect(passedProps.labelPlacement).toBe('inside')
    expect(passedProps.placeholder).toBe('Choose one')
    expect(passedProps.variant).toBe('flat')
    expect(passedProps.onChange).toBe(onChange)
  })
})
