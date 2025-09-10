import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HSplit from '../src/components/forms/HSplit'
import VSplit from '../src/components/forms/VSplit'

describe('HSplit', () => {
  it('should render children horizontally', () => {
    const { getByText } = render(
      <HSplit>
        <div>Child 1</div>
        <div>Child 2</div>
      </HSplit>,
    )

    expect(getByText('Child 1')).toBeInTheDocument()
    expect(getByText('Child 2')).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    const { container } = render(
      <HSplit>
        <div>Content</div>
      </HSplit>,
    )

    const wrapper = container.firstChild as Element
    expect(wrapper).toHaveClass('flex', 'gap-4')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <HSplit className="text-blue-500">
        <div>Content</div>
      </HSplit>,
    )

    const wrapper = container.firstChild as Element
    expect(wrapper).toHaveClass('flex', 'gap-4', 'text-blue-500')
  })

  it('should handle no children', () => {
    const { container } = render(<HSplit>{null}</HSplit>)
    const wrapper = container.firstChild as Element
    expect(wrapper).toHaveClass('flex', 'gap-4')
  })
})

describe('VSplit', () => {
  it('should render children vertically', () => {
    const { getByText } = render(
      <VSplit>
        <div>Child 1</div>
        <div>Child 2</div>
      </VSplit>,
    )

    expect(getByText('Child 1')).toBeInTheDocument()
    expect(getByText('Child 2')).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    const { container } = render(
      <VSplit>
        <div>Content</div>
      </VSplit>,
    )

    const wrapper = container.firstChild as Element
    expect(wrapper).toHaveClass('flex', 'flex-col', 'gap-4')
  })

  it('should merge custom className', () => {
    const { container } = render(
      <VSplit className="text-red-500">
        <div>Content</div>
      </VSplit>,
    )

    const wrapper = container.firstChild as Element
    expect(wrapper).toHaveClass('flex', 'flex-col', 'gap-4', 'text-red-500')
  })

  it('should handle no children', () => {
    const { container } = render(<VSplit>{null}</VSplit>)
    const wrapper = container.firstChild as Element
    expect(wrapper).toHaveClass('flex', 'flex-col', 'gap-4')
  })
})
