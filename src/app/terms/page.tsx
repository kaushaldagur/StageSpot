'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import { useState } from 'react'

export default function TermsPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleContinue = () => {
    if (!agreed) return
    router.push('/auth/signup')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link href="/" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          ← Back
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Terms
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20">
        <div className="max-w-md mx-auto">
          {/* Platform Rules */}
          <div>
            <div className="field-label">Platform rules</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5', textAlign: 'left', marginBottom: '10px', padding: 0 }}>
              All users must respect the community guidelines. No harassment, discrimination, or abusive behavior is tolerated. Users must be honest in their profiles and interactions. Any violations may result in account suspension or permanent ban.
            </div>
          </div>

          {/* Verification */}
          <div>
            <div className="field-label">Verification</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5', textAlign: 'left', marginBottom: '10px', padding: 0 }}>
              Performers and venues must provide proof of identity and legitimacy. Verification helps ensure community trust. Once approved, your verified badge will appear on your profile. You may be asked to provide additional documentation at any time.
            </div>
          </div>

          {/* Bookings and Conduct */}
          <div>
            <div className="field-label">Bookings and conduct</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5', textAlign: 'left', marginBottom: '16px', padding: 0 }}>
              Both performers and venues are expected to honor confirmed bookings. Cancellations must be made with notice. Feedback and ratings should be honest and based on the actual performance or interaction. Disputes will be mediated by our support team.
            </div>
          </div>

          {/* Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="agree" style={{ fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
              I agree to the terms and conditions
            </label>
          </div>

          {/* Continue Button */}
          <Button
            variant="primary"
            fullWidth
            disabled={!agreed}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  )
}
