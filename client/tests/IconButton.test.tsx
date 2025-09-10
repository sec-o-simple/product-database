import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import IconButton from '../src/components/forms/IconButton'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <div data-testid="fa-icon">{icon.iconName || 'icon'}</div>
  )
}))

// Mock HeroUI Button
vi.mock('@heroui/button', () => ({
  Button: ({ children, isIconOnly, variant, className, size, onPress, ...props }: any) => (
    <button 
      data-testid="button"
      data-is-icon-only={isIconOnly}
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onPress}
      {...props}
    >
      {children}
    </button>
  )
}))

describe('IconButton', () => {
  it('should render icon button with FontAwesome icon', () => {
    render(<IconButton icon={faEdit} />)
    
    const button = screen.getByTestId('button')
    const icon = screen.getByTestId('fa-icon')
    
    expect(button).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(button).toHaveAttribute('data-is-icon-only', 'true')
    expect(button).toHaveAttribute('data-variant', 'light')
  })

  it('should apply default styling classes', () => {
    render(<IconButton icon={faEdit} />)
    
    const button = screen.getByTestId('button')
    expect(button).toHaveClass('rounded-full', 'text-neutral-foreground')
  })

  it('should pass through button props', () => {
    const handlePress = vi.fn()
    render(
      <IconButton 
        icon={faEdit} 
        onPress={handlePress}
        disabled
        size="sm"
      />
    )
    
    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('disabled')
    expect(button).toHaveAttribute('data-size', 'sm')
  })

  it('should handle onPress event', () => {
    const handlePress = vi.fn()
    render(<IconButton icon={faEdit} onPress={handlePress} />)
    
    const button = screen.getByTestId('button')
    fireEvent.click(button)
    
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('should override default classes with custom className', () => {
    render(
      <IconButton 
        icon={faEdit} 
        className="custom-class bg-red-500"
      />
    )
    
    const button = screen.getByTestId('button')
    expect(button).toHaveClass('custom-class', 'bg-red-500')
  })

  it('should work with different icon types', () => {
    const customIcon = { prefix: 'fas', iconName: 'trash' } as any
    render(<IconButton icon={customIcon} />)
    
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toHaveTextContent('trash')
  })
})
