'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components'
import toast, { Toaster } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      // TODO: Call resetPassword from auth utils
      toast.success('Password reset link sent!')
      setSent(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link href="/auth/login" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          ← Back
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Reset Password
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md mx-auto w-full">
          <div
            className="rounded-lg p-8 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {!sent ? (
              <>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Forgot your password?
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '20px' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="field-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>✓</div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    Check your email
                  </h2>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
                  We've sent a password reset link to <strong>{email}</strong>. Click the link in your email to create a new password.
                </p>

                <div style={{ fontSize: '12px', color: 'var(--text-2)', textAlign: 'center', marginBottom: '16px' }}>
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => setSent(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Try again
                  </button>
                </div>

                <Link href="/auth/login">
                  <Button variant="ghost" fullWidth>
                    Back to login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
