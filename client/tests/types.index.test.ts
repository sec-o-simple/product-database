import { describe, expect, it, vi } from 'vitest'
import type { IconSvgProps } from '@/types'

describe('Types', () => {
  describe('IconSvgProps', () => {
    it('should extend SVGProps<SVGSVGElement>', () => {
      // Test that IconSvgProps can accept standard SVG props
      const iconProps: IconSvgProps = {
        width: 24,
        height: 24,
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        stroke: 'currentColor',
        strokeWidth: 2,
        className: 'icon',
        role: 'img',
        'aria-label': 'test icon',
      }

      expect(iconProps.width).toBe(24)
      expect(iconProps.height).toBe(24)
      expect(iconProps.viewBox).toBe('0 0 24 24')
      expect(iconProps.fill).toBe('currentColor')
      expect(iconProps.stroke).toBe('currentColor')
      expect(iconProps.strokeWidth).toBe(2)
      expect(iconProps.className).toBe('icon')
      expect(iconProps.role).toBe('img')
      expect(iconProps['aria-label']).toBe('test icon')
    })

    it('should have optional size property', () => {
      const iconPropsWithSize: IconSvgProps = {
        size: 32,
      }

      const iconPropsWithoutSize: IconSvgProps = {
        width: 16,
        height: 16,
      }

      expect(iconPropsWithSize.size).toBe(32)
      expect(iconPropsWithoutSize.size).toBeUndefined()
      expect(iconPropsWithoutSize.width).toBe(16)
      expect(iconPropsWithoutSize.height).toBe(16)
    })

    it('should allow combining size with other SVG props', () => {
      const combinedProps: IconSvgProps = {
        size: 20,
        fill: 'red',
        stroke: 'blue',
        className: 'custom-icon',
        onClick: () => {},
      }

      expect(combinedProps.size).toBe(20)
      expect(combinedProps.fill).toBe('red')
      expect(combinedProps.stroke).toBe('blue')
      expect(combinedProps.className).toBe('custom-icon')
      expect(typeof combinedProps.onClick).toBe('function')
    })

    it('should accept event handlers from SVGProps', () => {
      const handleClick = () => {}
      const handleMouseOver = () => {}

      const iconWithEvents: IconSvgProps = {
        onClick: handleClick,
        onMouseOver: handleMouseOver,
        onFocus: () => {},
        onBlur: () => {},
      }

      expect(iconWithEvents.onClick).toBe(handleClick)
      expect(iconWithEvents.onMouseOver).toBe(handleMouseOver)
      expect(typeof iconWithEvents.onFocus).toBe('function')
      expect(typeof iconWithEvents.onBlur).toBe('function')
    })

    it('should accept accessibility props', () => {
      const accessibleIcon: IconSvgProps = {
        'aria-hidden': true,
        'aria-label': 'Close button',
        'aria-describedby': 'tooltip-1',
        role: 'button',
        tabIndex: 0,
      }

      expect(accessibleIcon['aria-hidden']).toBe(true)
      expect(accessibleIcon['aria-label']).toBe('Close button')
      expect(accessibleIcon['aria-describedby']).toBe('tooltip-1')
      expect(accessibleIcon.role).toBe('button')
      expect(accessibleIcon.tabIndex).toBe(0)
    })

    it('should accept CSS and styling props', () => {
      const styledIcon: IconSvgProps = {
        style: { color: 'red', fontSize: '16px' },
        className: 'icon-button',
        id: 'unique-icon',
      }

      expect(styledIcon.style).toEqual({ color: 'red', fontSize: '16px' })
      expect(styledIcon.className).toBe('icon-button')
      expect(styledIcon.id).toBe('unique-icon')
    })

    it('should allow optional properties to be undefined', () => {
      const minimalIcon: IconSvgProps = {}

      expect(minimalIcon.size).toBeUndefined()
      expect(minimalIcon.width).toBeUndefined()
      expect(minimalIcon.height).toBeUndefined()
      expect(minimalIcon.fill).toBeUndefined()
    })

    it('should work with numeric size values', () => {
      const iconSizes: IconSvgProps[] = [
        { size: 12 },
        { size: 16 },
        { size: 24 },
        { size: 32 },
        { size: 48 },
      ]

      iconSizes.forEach((iconProps) => {
        expect(typeof iconProps.size).toBe('number')
        expect(iconProps.size).toBeGreaterThan(0)
      })

      expect(iconSizes[0].size).toBe(12)
      expect(iconSizes[4].size).toBe(48)
    })
  })
})
