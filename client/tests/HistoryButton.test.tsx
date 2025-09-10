import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import HistoryButton from '../src/components/forms/HistoryButton'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <div data-testid="fa-icon">{icon.iconName || 'icon'}</div>
  )
}))

// Mock HeroUI Button
vi.mock('@heroui/react', () => ({
  Button: ({ children, variant, color, onPress }: any) => (
    <button 
      data-testid="button"
      data-variant={variant}
      data-color={color}
      onClick={onPress}
    >
      {children}
    </button>
  )
}))

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('HistoryButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render history button with icon and text', () => {
    render(
      <TestWrapper>
        <HistoryButton />
      </TestWrapper>
    )
    
    const button = screen.getByTestId('button')
    const icon = screen.getByTestId('fa-icon')
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('History')
    expect(icon).toBeInTheDocument()
  })

  it('should have correct styling props', () => {
    render(
      <TestWrapper>
        <HistoryButton />
      </TestWrapper>
    )
    
    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-variant', 'light')
    expect(button).toHaveAttribute('data-color', 'primary')
  })

  it('should navigate to history page when clicked', () => {
    render(
      <TestWrapper>
        <HistoryButton />
      </TestWrapper>
    )
    
    const button = screen.getByTestId('button')
    fireEvent.click(button)
    
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/products/1/history')
  })

  it('should render clock rotate left icon', () => {
    render(
      <TestWrapper>
        <HistoryButton />
      </TestWrapper>
    )
    
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toHaveTextContent('clock-rotate-left')
  })
})
