import { describe, expect, it, vi } from 'vitest'

// Mock the dependencies
vi.mock('openapi-fetch', () => ({
  default: vi.fn((config) => ({
    baseUrl: config.baseUrl,
    mockFetchClient: true,
  })),
}))

vi.mock('openapi-react-query', () => ({
  default: vi.fn((fetchClient) => ({
    fetchClient,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    mockReactQueryClient: true,
  })),
}))

vi.mock('../src/config/env', () => ({
  default: {
    apiBaseUrl: 'http://localhost:3000/api',
  },
}))

describe('Client', () => {
  it('should create and export a client', async () => {
    const client = await import('../src/client/index')
    
    expect(client.default).toBeDefined()
    expect(typeof client.default).toBe('object')
  })

  it('should configure fetch client with correct base URL', async () => {
    const createFetchClient = await import('openapi-fetch')
    
    // Import the client to trigger the setup
    await import('../src/client/index')
    
    expect(createFetchClient.default).toHaveBeenCalledWith({
      baseUrl: 'http://localhost:3000/api',
    })
  })

  it('should create react-query client with fetch client', async () => {
    const createClient = await import('openapi-react-query')
    
    // Import the client to trigger the setup
    await import('../src/client/index')
    
    expect(createClient.default).toHaveBeenCalled()
  })

  it('should export client as default', async () => {
    const module = await import('../src/client/index')
    
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('object')
  })
})
