import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import useRefetchQuery from '../src/utils/useRefetchQuery'

const mockRefetch = vi.fn()

// Mock react-router-dom
let mockLocationState: { shouldRefetch?: boolean } | null = null

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/test',
      search: '',
      hash: '',
      state: mockLocationState,
      key: 'test-key',
    }),
  }
})

describe('useRefetchQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocationState = null
  })

  it('should not call refetch when no state', () => {
    renderHook(() => useRefetchQuery({ refetch: mockRefetch }))

    expect(mockRefetch).not.toHaveBeenCalled()
  })

  it('should call refetch when shouldRefetch is true', () => {
    mockLocationState = { shouldRefetch: true }

    renderHook(() => useRefetchQuery({ refetch: mockRefetch }))

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('should not call refetch when shouldRefetch is false', () => {
    mockLocationState = { shouldRefetch: false }

    renderHook(() => useRefetchQuery({ refetch: mockRefetch }))

    expect(mockRefetch).not.toHaveBeenCalled()
  })

  it('should handle empty state object', () => {
    mockLocationState = {}

    renderHook(() => useRefetchQuery({ refetch: mockRefetch }))

    expect(mockRefetch).not.toHaveBeenCalled()
  })
})
