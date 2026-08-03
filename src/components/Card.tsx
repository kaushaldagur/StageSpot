import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat'
  children: React.ReactNode
}

export const Card = ({ variant = 'default', className = '', ...props }: CardProps) => {
  const baseClasses = variant === 'flat' ? 'card-flat' : 'card'
  return <div className={`${baseClasses} ${className}`} {...props} />
}

interface FeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  avatar?: React.ReactNode
  name: string
  meta?: string
  verified?: boolean
  image?: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const FeedCard = ({
  avatar,
  name,
  meta,
  verified,
  image,
  title,
  subtitle,
  actions,
  className = '',
}: FeedCardProps) => {
  return (
    <div className={`feed-card ${className}`}>
      <div className="card-top">
        {avatar || <div className="card-avatar" />}
        <div style={{ flex: 1 }}>
          <span className="card-name">{name}</span>
          {verified && (
            <span className="verified-dot">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#3F5E33"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          {meta && <div className="card-meta">{meta}</div>}
        </div>
      </div>
      {image}
      <div className="card-body">
        <div className="card-title">{title}</div>
        {subtitle && <div className="card-sub">{subtitle}</div>}
        {actions && <div className="card-actions">{actions}</div>}
      </div>
    </div>
  )
}
