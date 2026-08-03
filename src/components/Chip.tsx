import React from 'react'

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  onRemove?: () => void
}

export const Chip = ({ children, onRemove, className = '', ...props }: ChipProps) => {
  return (
    <span className={`chip ${className}`} {...props}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      )}
    </span>
  )
}

interface ChipRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ChipRow = ({ children, className = '', ...props }: ChipRowProps) => {
  return (
    <div className={`chip-row ${className}`} {...props}>
      {children}
    </div>
  )
}
