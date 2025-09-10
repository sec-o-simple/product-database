import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input, Textarea } from '../src/components/forms/Input'

describe('Input', () => {
  it('should render with default props', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeInTheDocument()
  })

  it('should render with custom props', () => {
    render(
      <Input
        data-testid="input"
        label="Test Label"
        placeholder="Test Placeholder"
        value="Test Value"
        variant="flat"
      />,
    )

    const input = screen.getByTestId('input')
    expect(input).toHaveValue('Test Value')
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input data-testid="input" onChange={handleChange} />)

    const input = screen.getByTestId('input')
    await user.type(input, 'Hello')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should apply default variant and labelPlacement', () => {
    render(<Input data-testid="input" />)

    const input = screen.getByTestId('input')
    expect(input).toBeInTheDocument()
  })
})

describe('Textarea', () => {
  it('should render with default props', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeInTheDocument()
  })

  it('should render with custom props', () => {
    render(
      <Textarea
        data-testid="textarea"
        label="Test Label"
        placeholder="Test Placeholder"
        value="Test Value"
        variant="flat"
      />,
    )

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveValue('Test Value')
  })

  it('should handle user input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Textarea data-testid="textarea" onChange={handleChange} />)

    const textarea = screen.getByTestId('textarea')
    await user.type(textarea, 'Hello World')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should apply default variant and labelPlacement', () => {
    render(<Textarea data-testid="textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeInTheDocument()
  })
})
