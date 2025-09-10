import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from '../src/provider'

// Mock HeroUIProvider
vi.mock('@heroui/system', () => ({
  HeroUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="heroui-provider">{children}</div>
  ),
}))

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useHref: () => vi.fn(),
  }
})

describe('Provider', () => {
  it('should render children within HeroUIProvider', () => {
    render(
      <BrowserRouter>
        <Provider>
          <div data-testid="child-content">Test content</div>
        </Provider>
      </BrowserRouter>,
    )

    expect(screen.getByTestId('heroui-provider')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should provide navigation functionality', () => {
    render(
      <BrowserRouter>
        <Provider>
          <div>Provider content</div>
        </Provider>
      </BrowserRouter>,
    )

    // Provider should wrap children without error
    expect(screen.getByText('Provider content')).toBeInTheDocument()
  })
})
