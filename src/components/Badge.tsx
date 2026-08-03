import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'verified' | 'pending'
  children: React.ReactNode
}

export const Badge = ({ variant = 'default', children }: BadgeProps) => {
  const classMap = {
    default: 'badge',
    verified: 'badge badge-verified',
    pending: 'badge badge-pending',
  }

  return <span className={classMap[variant]}>{children}</span>
}

interface StatusBadgeProps {
  status:
    | 'pending'
    | 'accepted'
    | 'done'
    | 'requested'
    | 'confirmed'
    | 'completed'
    | 'declined'
    | 'cancelled'
  children: React.ReactNode
}

export const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  const classMap: Record<StatusBadgeProps['status'], string> = {
    pending: 'status-pill status-pending',
    requested: 'status-pill status-pending',
    accepted: 'status-pill status-accepted',
    confirmed: 'status-pill status-accepted',
    done: 'status-pill status-done',
    completed: 'status-pill status-done',
    declined: 'status-pill status-cancelled',
    cancelled: 'status-pill status-cancelled',
  }

  return <span className={classMap[status] || 'status-pill status-pending'}>{children}</span>
}
