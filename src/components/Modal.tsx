'use client'

import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

interface SheetProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}

export const Sheet = ({ title, subtitle, onClose, children }: SheetProps) => {
  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">{title}</div>
      {subtitle && <div className="sheet-sub">{subtitle}</div>}
      {children}
    </>
  )
}
