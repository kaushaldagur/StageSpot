'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/utils/auth'
import toast, { Toaster } from 'react-hot-toast'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userType, setUserType] = useState<'performer' | 'venue'>(
    (searchParams.get('type') === 'venue' ? 'venue' : 'performer')
  )
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // PRD Section 4: sign up requires accepting the Terms and Conditions
    if (!acceptedTerms) {
      toast.error('Please accept the Terms and Conditions')
      return
    }

    setLoading(true)
    try {
      await signUp(formData.email, formData.password, userType)
      toast.success('Check your email to verify your account')
      router.push('/auth/verify-email')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up')
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
        <Link href="/auth/login" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-lg p-8 border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              Create account
            </h2>

            {/* Role selection (PRD Section 4, wireframe "I am a" toggle) */}
            <div className="field-label" style={{ marginTop: 0 }}>I am a</div>
            <div className="segmented" style={{ marginBottom: '16px' }}>
              <div className={`seg ${userType === 'performer' ? 'active' : ''}`} onClick={() => setUserType('performer')}>
                Performer
              </div>
              <div className={`seg ${userType === 'venue' ? 'active' : ''}`} onClick={() => setUserType('venue')}>
                Venue
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                  }}
                  placeholder="name@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                  }}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-2)' }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                  }}
                  placeholder="••••••••"
                />
              </div>

              {/* Required T&C acceptance (PRD Section 4) */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: 'var(--accent)' }}
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="font-medium" style={{ color: 'var(--accent)' }}>
                    Terms and Conditions
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--text)' }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium" style={{ color: 'var(--accent)' }}>
                  Log in
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-center" style={{ color: 'var(--text-3)' }}>
                By signing up, you agree to our Terms and Conditions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  )
}
