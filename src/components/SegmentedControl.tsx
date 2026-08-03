import React from 'react'

interface SegmentedControlProps {
  options: string[]
  value: string
  onChange: (value: string) => void
}

export const SegmentedControl = ({ options, value, onChange }: SegmentedControlProps) => {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={option}
          className={`seg ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
