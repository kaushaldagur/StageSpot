'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { formatTime } from '@/utils/format'

export default function Home() {
  const [userType, setUserType] = useState<'performer' | 'venue'>('performer')
  const [preview, setPreview] = useState<{ performers: any[]; gigs: any[] }>({ performers: [], gigs: [] })

  useEffect(() => {
    fetch('/api/preview')
      .then(res => res.json())
      .then(setPreview)
      .catch(() => {})
  }, [])

  const previewCards = [
    ...preview.gigs.slice(0, 2).map((g, i) => ({
      key: `gig-${g.id}`,
      name: g.venueName,
      chip: `${new Date(g.date).toLocaleDateString('en-IN', { weekday: 'short' })}, ${formatTime(g.time_start)}`,
      height: i % 2 === 0 ? 100 : 130,
    })),
    ...preview.performers.slice(0, 2).map((p, i) => ({
      key: `perf-${p.id}`,
      name: p.name,
      chip: p.first_time_performing ? 'first stage' : `★ ${p.rating || 0} ${(p.act_type || '').toLowerCase()}`,
      height: i % 2 === 0 ? 130 : 100,
    })),
  ]

  const steps = {
    performer: [
      ['Create profile', 'Share your bio, links, and portfolio'],
      ['Get verified', 'Submit proof of work for review'],
      ['Apply to gigs', 'Browse nearby cafes and submit applications'],
      ['Perform', 'Build your reputation with ratings and reviews'],
    ],
    venue: [
      ['Create profile', 'Add your venue details and photos'],
      ['Get verified', 'Submit proof of business'],
      ['Post a gig', 'Let performers know what you are looking for'],
      ['Host a show', 'Connect with verified performers in your area'],
    ],
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4" style={{ backgroundColor: 'var(--bg)' }}>
        <Image src="/stagespot-logo.svg" alt="StageSpot — Get Your First Stage" width={144} height={40} priority />
        <Link href="/auth/login" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-md md:max-w-4xl mx-auto px-6 py-6 md:py-12">
        <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start">
          {/* Hero */}
          <div>
            <h2 className="hero-title" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '8px', color: 'var(--text)' }}>
              Get your first stage
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '18px' }}>
              Find a cafe to perform at, or find a performer for your venue. Built for first timers, hyperlocal to your city.
            </p>

            {/* Role Toggle (wireframe segmented control) */}
            <div className="segmented">
              <div
                className={`seg ${userType === 'performer' ? 'active' : ''}`}
                onClick={() => setUserType('performer')}
              >
                I&apos;m a performer
              </div>
              <div
                className={`seg ${userType === 'venue' ? 'active' : ''}`}
                onClick={() => setUserType('venue')}
              >
                I&apos;m a venue
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/auth/signup?type=${userType}`}
              className="btn btn-primary btn-block"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              Continue
            </Link>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '10px', margin: '18px 0' }}>
              <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-text)' }}>120+</div>
                <div style={{ fontSize: '9px', color: 'var(--text-2)' }}>verified acts</div>
              </div>
              <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-text)' }}>40+</div>
                <div style={{ fontSize: '9px', color: 'var(--text-2)' }}>venues</div>
              </div>
            </div>

            {/* This week nearby (PRD 5.1 preview grid) */}
            <div className="section-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '4px 0 8px' }}>
              This week nearby
            </div>
            <div className="masonry" style={{ marginBottom: '24px' }}>
              {previewCards.length === 0 ? (
                <>
                  <div className="m-card"><div className="m-img" style={{ height: '100px' }} /><div className="m-body"><div className="m-name">Loading…</div></div></div>
                  <div className="m-card"><div className="m-img" style={{ height: '130px' }} /><div className="m-body"><div className="m-name">Loading…</div></div></div>
                </>
              ) : (
                previewCards.map(card => (
                  <div key={card.key} className="m-card">
                    <div className="m-img" style={{ height: `${card.height}px` }} />
                    <div className="m-body">
                      <div className="m-name">{card.name}</div>
                      <div className="m-chip">{card.chip}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* How It Works (PRD 5.1) */}
          <div style={{ marginBottom: '24px' }}>
            <div className="section-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '4px 0 8px' }}>
              How it works
            </div>
            <div className="segmented" style={{ marginBottom: '12px' }}>
              <div className={`seg ${userType === 'performer' ? 'active' : ''}`} onClick={() => setUserType('performer')}>For performers</div>
              <div className={`seg ${userType === 'venue' ? 'active' : ''}`} onClick={() => setUserType('venue')}>For venues</div>
            </div>
            {steps[userType].map(([title, sub], i) => (
              <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-text)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)' }}>{title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{sub}</div>
                </div>
              </div>
            ))}

            {/* Terms */}
            <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '16px', textAlign: 'center' }}>
              By signing up, you agree to our{' '}
              <Link href="/terms" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                Terms and Conditions
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer (Section 6 #18: Terms linked from the landing footer) */}
      <footer
        className="flex justify-between items-center px-6 py-4 border-t"
        style={{ borderColor: 'var(--border)', fontSize: '11px', color: 'var(--text-3)' }}
      >
        <span>© StageSpot · Delhi region</span>
        <Link href="/terms" className="hover:underline" style={{ color: 'var(--accent-text)' }}>
          Terms and Conditions
        </Link>
      </footer>
    </div>
  )
}
