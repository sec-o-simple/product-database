import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../src/Layout'

// Mock react-router-dom
const mockNavigate = vi.fn()
let mockLocation: {
  pathname: string
  search: string
  hash: string
  state: { message?: string; type?: string } | null
  key: string
} = {
  pathname: '/test',
  search: '',
  hash: '',
  state: null,
  key: 'test-key',
}

// Mock all dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockLocation,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  }
})

vi.mock('@heroui/react', async () => {
  const actual = await vi.importActual('@heroui/react')
  return {
    ...actual,
    addToast: vi.fn(),
  }
})

vi.mock('../src/utils/useRouter', () => ({
  default: () => ({
    navigate: mockNavigate,
  }),
}))

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation = {
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'test-key',
    }
  })

  it('should render outlet', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>,
    )

    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('should show toast and navigate when state has message', async () => {
    const { addToast } = await import('@heroui/react')
    const mockAddToast = vi.mocked(addToast)
    
    mockLocation.state = {
      message: 'Test message',
      type: 'success',
    }

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>,
    )

    expect(mockAddToast).toHaveBeenCalledWith({
      title: 'Test message',
      color: 'success',
    })
    expect(mockNavigate).toHaveBeenCalledWith('', { replace: true, state: {} })
  })

  it('should use default type when type is not specified', async () => {
    const { addToast } = await import('@heroui/react')
    const mockAddToast = vi.mocked(addToast)
    
    mockLocation.state = {
      message: 'Test message without type',
    }

    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>,
    )

    expect(mockAddToast).toHaveBeenCalledWith({
      title: 'Test message without type',
      color: 'default',
    })
    expect(mockNavigate).toHaveBeenCalledWith('', { replace: true, state: {} })
  })
})
