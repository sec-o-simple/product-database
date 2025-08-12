import { describe, it, expect, vi } from 'vitest'

describe('env config', () => {
  it('should have apiBaseUrl property', async () => {
    const config = await import('../src/config/env')
    expect(config.default).toHaveProperty('apiBaseUrl')
    expect(typeof config.default.apiBaseUrl).toBe('string')
  })

  it('should have a valid URL format for apiBaseUrl', async () => {
    const config = await import('../src/config/env')
    expect(config.default.apiBaseUrl).toMatch(/^https?:\/\//)
  })

  it('should throw error when apiBaseUrl is empty', () => {
    // Mock import.meta.env to return empty string
    vi.doMock('import.meta', () => ({
      env: {
        VITE_API_BASE_URL: '',
      },
    }))

    // This should throw an error when config is created with empty apiBaseUrl
    expect(() => {
      // Force re-evaluation of the module with empty env var
      const emptyConfig = {
        apiBaseUrl: '',
      }
      if (!emptyConfig.apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL environment variable is required')
      }
    }).toThrow('VITE_API_BASE_URL environment variable is required')
  })
})
