import { describe, expect, it } from 'vitest'
import config from '@/config/env'

describe('Config', () => {
  it('should have an apiBaseUrl property', () => {
    expect(config).toHaveProperty('apiBaseUrl')
    expect(typeof config.apiBaseUrl).toBe('string')
    expect(config.apiBaseUrl).toBeTruthy()
  })

  it('should export a valid URL format for apiBaseUrl', () => {
    expect(config.apiBaseUrl).toMatch(/^https?:\/\//)
  })

  it('should have a non-empty apiBaseUrl', () => {
    expect(config.apiBaseUrl.length).toBeGreaterThan(0)
  })

  it('should export config object with correct structure', () => {
    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
    expect(config.apiBaseUrl).toBeDefined()
  })

  it('should handle URL validation', () => {
    // Test that the URL doesn't have trailing slash issues
    expect(config.apiBaseUrl).not.toMatch(/\/$/)
  })

  it('should provide consistent config values', () => {
    // Test multiple accesses return same value
    const firstAccess = config.apiBaseUrl
    const secondAccess = config.apiBaseUrl
    expect(firstAccess).toBe(secondAccess)
  })

  it('should have valid hostname in URL', () => {
    try {
      const url = new URL(config.apiBaseUrl)
      expect(url.hostname).toBeTruthy()
      expect(url.protocol).toMatch(/^https?:$/)
    } catch (error) {
      throw new Error(`Invalid URL format: ${config.apiBaseUrl}`)
    }
  })

  it('should be accessible as default export', () => {
    expect(config).toBeDefined()
    expect(config.apiBaseUrl).toBeDefined()
  })
})
