import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Extend Vitest's expect with jest-dom matchers
import '@testing-library/jest-dom'

// Mock the dependencies
const mockChangeLanguage = vi.fn()
const mockI18n = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}))

vi.mock('@heroui/react', () => ({
  Button: ({ children, color, size, onPress, ...props }: any) => (
    <button 
      onClick={onPress}
      data-color={color}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
  ButtonGroup: ({ children }: any) => (
    <div data-testid="button-group">{children}</div>
  ),
}))

// Mock localStorage
const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
}

// Setup global mocks
beforeEach(() => {
  vi.clearAllMocks()
  mockI18n.language = 'en'
  
  // Reset localStorage mock
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
})

import { LanguageSwitcher } from '../src/components/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('should render English and German buttons', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('DE')).toBeInTheDocument()
  })

  it('should highlight the current language (English)', () => {
    mockI18n.language = 'en'
    render(<LanguageSwitcher />)

    const enButton = screen.getByText('EN')
    const deButton = screen.getByText('DE')

    expect(enButton).toHaveAttribute('data-color', 'primary')
    expect(deButton).toHaveAttribute('data-color', 'secondary')
  })

  it('should highlight the current language (German)', () => {
    mockI18n.language = 'de'
    render(<LanguageSwitcher />)

    const enButton = screen.getByText('EN')
    const deButton = screen.getByText('DE')

    expect(enButton).toHaveAttribute('data-color', 'secondary')
    expect(deButton).toHaveAttribute('data-color', 'primary')
  })

  it('should render buttons with correct size', () => {
    render(<LanguageSwitcher />)

    const enButton = screen.getByText('EN')
    const deButton = screen.getByText('DE')

    expect(enButton).toHaveAttribute('data-size', 'sm')
    expect(deButton).toHaveAttribute('data-size', 'sm')
  })

  it('should change language to English when EN button is clicked', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    const enButton = screen.getByText('EN')
    await user.click(enButton)

    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en')
  })

  it('should change language to German when DE button is clicked', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    const deButton = screen.getByText('DE')
    await user.click(deButton)

    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'de')
  })

  it('should render buttons within a ButtonGroup', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByTestId('button-group')).toBeInTheDocument()
  })

  it('should call changeLanguage function multiple times correctly', async () => {
    const user = userEvent.setup()
    mockI18n.language = 'en'
    render(<LanguageSwitcher />)

    // Switch to German
    const deButton = screen.getByText('DE')
    await user.click(deButton)

    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'de')

    vi.clearAllMocks()

    // Switch to English
    const enButton = screen.getByText('EN')
    await user.click(enButton)

    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en')
  })
})
