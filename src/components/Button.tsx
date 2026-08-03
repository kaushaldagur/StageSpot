import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }, ref) => {
    const baseClasses = 'btn'
    const variantClasses = `btn-${variant}`
    const widthClasses = fullWidth ? 'btn-block' : ''

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${widthClasses} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
