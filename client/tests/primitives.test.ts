import { describe, expect, it } from 'vitest'
import { title, subtitle } from '../src/components/primitives'

describe('Primitives', () => {
  describe('title', () => {
    it('should return base classes', () => {
      const result = title()
      expect(result).toContain('inline')
      expect(result).toContain('font-semibold')
      expect(result).toContain('tracking-tight')
    })

    it('should handle color variants', () => {
      const violet = title({ color: 'violet' })
      expect(violet).toContain('from-[#FF1CF7]')
      expect(violet).toContain('to-[#b249f8]')

      const blue = title({ color: 'blue' })
      expect(blue).toContain('from-[#5EA2EF]')
      expect(blue).toContain('to-[#0072F5]')
    })

    it('should handle size variants', () => {
      const small = title({ size: 'sm' })
      expect(small).toContain('text-3xl')
      expect(small).toContain('lg:text-4xl')

      const large = title({ size: 'lg' })
      expect(large).toContain('text-4xl')
      expect(large).toContain('lg:text-6xl')
    })

    it('should handle fullWidth variant', () => {
      const fullWidth = title({ fullWidth: true })
      expect(fullWidth).toContain('block')
      expect(fullWidth).toContain('w-full')
    })

    it('should apply compound variants for colors', () => {
      const gradientColor = title({ color: 'cyan' })
      expect(gradientColor).toContain('bg-gradient-to-b')
      expect(gradientColor).toContain('bg-clip-text')
      expect(gradientColor).toContain('text-transparent')
    })
  })

  describe('subtitle', () => {
    it('should return base classes', () => {
      const result = subtitle()
      expect(result).toContain('my-2')
      expect(result).toContain('block')
      expect(result).toContain('w-full')
      expect(result).toContain('max-w-full')
      expect(result).toContain('text-lg')
      expect(result).toContain('text-default-600')
    })

    it('should handle fullWidth variant', () => {
      const fullWidth = subtitle({ fullWidth: true })
      expect(fullWidth).toContain('!w-full')

      const notFullWidth = subtitle({ fullWidth: false })
      expect(notFullWidth).not.toContain('!w-full')
    })

    it('should apply default fullWidth', () => {
      const defaultResult = subtitle()
      expect(defaultResult).toContain('!w-full')
    })
  })
})
