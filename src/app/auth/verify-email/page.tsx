'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

export default function VerifyEmail() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleResendEmail = async () => {
    setLoading(true)
    try {
      // Note: In production, you would need to get the email from a form or stored state
      // For now, this is a placeholder. Users should receive the verification email on signup.
      toast.success('Check your email for the verification link')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/stagespot-logo.svg" alt="StageSpot" style={{ height: '34px', width: 'auto' }} />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--accent-soft)' }}
          ></div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Check your inbox
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-2)' }}>
            We sent a verification link to your email. Click it to activate your account.
          </p>

          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg border font-semibold transition-colors"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-2)',
            }}
          >
            {loading ? 'Resending...' : 'Resend email'}
          </button>

          <div className="mt-6">
            <Link href="/auth/login" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              Back to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
