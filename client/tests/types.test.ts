import { describe, expect, it } from 'vitest'
import type { IconSvgProps } from '../src/types/index'

describe('Types', () => {
  it('should define IconSvgProps correctly', () => {
    // Test that the type can be used correctly
    const iconProps: IconSvgProps = {
      size: 24,
      width: 32,
      height: 32,
      className: 'text-blue-500',
    }

    expect(iconProps.size).toBe(24)
    expect(iconProps.width).toBe(32)
    expect(iconProps.height).toBe(32)
    expect(iconProps.className).toBe('text-blue-500')
  })

  it('should allow partial IconSvgProps', () => {
    const iconProps: IconSvgProps = {
      size: 16,
    }

    expect(iconProps.size).toBe(16)
    expect(iconProps.width).toBeUndefined()
    expect(iconProps.height).toBeUndefined()
  })

  it('should allow empty IconSvgProps', () => {
    const iconProps: IconSvgProps = {}

    expect(iconProps.size).toBeUndefined()
    expect(iconProps.width).toBeUndefined()
    expect(iconProps.height).toBeUndefined()
  })
})
