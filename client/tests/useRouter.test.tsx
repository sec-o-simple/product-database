import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Location } from 'react-router-dom'
import useRouter from '../src/utils/useRouter'

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
let mockLocation: Location = {
  pathname: '/test',
  search: '',
  hash: '',
  state: null,
  key: 'test-key',
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({ id: 'test-id' }),
  }
})

// Test component to use the hook
function TestComponent() {
  const router = useRouter()
  
  return (
    <div>
      <button onClick={router.goBack}>Go Back</button>
      <button onClick={() => router.navigate('/test')}>Navigate</button>
      <button onClick={() => router.navigateToModal('/modal', '/return')}>
        Navigate to Modal
      </button>
      <span data-testid="pathname">{router.location.pathname}</span>
      <span data-testid="params">{JSON.stringify(router.params)}</span>
    </div>
  )
}

describe('useRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide navigation functions and location data', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>,
    )

    expect(screen.getByTestId('pathname')).toHaveTextContent('/test')
    expect(screen.getByTestId('params')).toHaveTextContent('{"id":"test-id"}')
  })

  it('should call navigate function', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>,
    )

    const navigateButton = screen.getByText('Navigate')
    navigateButton.click()

    expect(mockNavigate).toHaveBeenCalledWith('/test')
  })

  it('should navigate to modal with background location', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>,
    )

    const modalButton = screen.getByText('Navigate to Modal')
    modalButton.click()

    expect(mockNavigate).toHaveBeenCalledWith('/modal', {
      state: {
        backgroundLocation: mockLocation,
        returnTo: '/return',
      },
    })
  })

  it('should go back with background location', () => {
    // Set up location with background location
    mockLocation = {
      ...mockLocation,
      state: { backgroundLocation: { pathname: '/background' } as Location },
    }

    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>,
    )

    const backButton = screen.getByText('Go Back')
    backButton.click()

    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/background' })
  })

  it('should go back with navigate(-1) when no background location', () => {
    // Reset to no background location
    mockLocation = {
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'test-key',
    }

    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>,
    )

    const backButton = screen.getByText('Go Back')
    backButton.click()

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
