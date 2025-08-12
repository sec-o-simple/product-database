import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AddItemButton from '../src/components/forms/AddItemButton'
import { faAdd, faEdit } from '@fortawesome/free-solid-svg-icons'

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: any }) => (
    <div data-testid="fa-icon">{icon.iconName || 'icon'}</div>
  )
}))

// Mock HeroUI Button
vi.mock('@heroui/button', () => ({
  Button: ({ children, className, size, color, startContent, onPress, variant, ...props }: any) => (
    <button 
      data-testid="button" 
      className={className}
      data-size={size}
      data-color={color}
      data-variant={variant}
      onClick={onPress} // Map onPress to onClick for testing
      {...props}
    >
      {startContent}
      {children}
    </button>
  ),
}))

// Mock tailwind-merge
vi.mock('tailwind-merge', () => ({
  twMerge: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('AddItemButton', () => {
  it('should render with default props', () => {
    render(<AddItemButton />)
    
    const button = screen.getByTestId('button')
    const icon = screen.getByTestId('fa-icon')
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Add New Item')
    expect(icon).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'bordered')
  })

  it('should render with custom label', () => {
    render(<AddItemButton label="Create Product" />)
    
    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent('Create Product')
  })

  it('should render with custom icon', () => {
    render(<AddItemButton icon={faEdit} />)
    
    const icon = screen.getByTestId('fa-icon')
    expect(icon).toHaveTextContent('pen-to-square')
  })

  it('should apply default styling classes', () => {
    render(<AddItemButton />)
    
    const button = screen.getByTestId('button')
    expect(button).toHaveClass('border-dashed', 'text-neutral-foreground', 'border-gray')
  })

  it('should merge custom className with default classes', () => {
    render(<AddItemButton className="custom-class bg-blue-500" />)
    
    const button = screen.getByTestId('button')
    expect(button).toHaveClass('border-dashed', 'text-neutral-foreground', 'border-gray', 'custom-class', 'bg-blue-500')
  })

  it('should handle onPress event', () => {
    const handlePress = vi.fn()
    render(<AddItemButton onPress={handlePress} />)
    
    const button = screen.getByTestId('button')
    fireEvent.click(button)
    
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('should pass through button props', () => {
    render(<AddItemButton disabled size="lg" color="primary" />)
    
    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('disabled')
    expect(button).toHaveAttribute('data-size', 'lg')
    expect(button).toHaveAttribute('data-color', 'primary')
  })

  it('should render with both custom label and icon', () => {
    render(<AddItemButton label="Add Product" icon={faEdit} />)
    
    const button = screen.getByTestId('button')
    const icon = screen.getByTestId('fa-icon')
    
    expect(button).toHaveTextContent('Add Product')
    expect(icon).toHaveTextContent('pen-to-square')
  })
})
