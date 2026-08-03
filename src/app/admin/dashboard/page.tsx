'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, SegmentedControl, StatusBadge, AvatarButton, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { formatTime } from '@/utils/format'
import { getCurrentUser } from '@/utils/auth'
import {
  getPendingProfiles,
  updateVerificationStatus,
  getAllGigsAdmin,
  getAllBookingsAdmin,
  getAllReviewsAdmin,
  getUserRole,
} from '@/utils/db'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [view, setView] = useState('Queue')
  const [performers, setPerformers] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [gigs, setGigs] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()

        // Role comes from the user_roles table (database source of truth);
        // app_metadata remains a fallback for legacy admin grants
        const role = await getUserRole(user.id).catch(() => null)
        const isAdmin = role === 'admin' || user.app_metadata?.role === 'admin'
        if (!isAdmin) {
          toast.error('Admin access only')
          router.push('/app/home')
          return
        }

        const [{ performers: pendingPerformers, venues: pendingVenues }, allGigs, allBookings, allReviews] =
          await Promise.all([
            getPendingProfiles(),
            getAllGigsAdmin(),
            getAllBookingsAdmin(),
            getAllReviewsAdmin(),
          ])

        setPerformers(pendingPerformers)
        setVenues(pendingVenues)
        setGigs(allGigs)
        setBookings(allBookings)
        setReviews(allReviews)
      } catch (error: any) {
        toast.error('Failed to load admin data')
        router.push('/app/home')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleApprove = async (id: string, table: 'performer_profiles' | 'venue_profiles') => {
    setActionLoading(`approve-${id}`)
    try {
      await updateVerificationStatus(table, id, 'approved')
      toast.success('Profile approved!')

      if (table === 'performer_profiles') {
        setPerformers(performers.filter(p => p.id !== id))
      } else {
        setVenues(venues.filter(v => v.id !== id))
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string, table: 'performer_profiles' | 'venue_profiles') => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setActionLoading(`reject-${id}`)
    try {
      await updateVerificationStatus(table, id, 'rejected', rejectReason)
      toast.success('Profile rejected')

      if (table === 'performer_profiles') {
        setPerformers(performers.filter(p => p.id !== id))
      } else {
        setVenues(venues.filter(v => v.id !== id))
      }

      setRejectingId(null)
      setRejectReason('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <PageLoader label="Loading admin dashboard" />
      </div>
    )
  }

  const pendingCount = performers.length + venues.length
  const openGigsCount = gigs.filter(g => g.status === 'open').length

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '8px',
  }

  const proofLink = (href: string, label: string) => (
    <a key={`${label}-${href}`} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', marginRight: '10px' }}>
      {label} →
    </a>
  )

  const renderQueueCard = (profile: any, kind: 'performer' | 'venue') => {
    const table = kind === 'performer' ? 'performer_profiles' : 'venue_profiles'
    return (
      <div key={profile.id} style={cardStyle}>
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{profile.name}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-2)' }}>
            {kind === 'performer' ? `Performer · ${profile.act_type || ''}` : `Venue · ${profile.full_address || `${profile.locality}, ${profile.city}`}`}
          </div>
        </div>

        {kind === 'performer' && profile.bio && (
          <div style={{ fontSize: '10.5px', color: 'var(--text-2)', marginBottom: '6px' }}>{profile.bio}</div>
        )}

        {/* Submitted proof (PRD 5.8): proof link, portfolio, social presence */}
        <div style={{ fontSize: '10px', marginBottom: '8px', lineHeight: '1.8' }}>
          {kind === 'performer' && profile.proof_of_work_link && proofLink(profile.proof_of_work_link, 'Proof of work')}
          {kind === 'venue' && profile.proof_of_business_link && proofLink(profile.proof_of_business_link, 'Proof of business')}
          {(profile.portfolio_links || []).map((link: string, i: number) => proofLink(link, `Portfolio ${i + 1}`))}
          {profile.social_media_links?.instagram && (
            <span style={{ color: 'var(--text-2)' }}>Instagram: {profile.social_media_links.instagram} </span>
          )}
          {profile.social_media_links?.other && proofLink(profile.social_media_links.other, 'Social link')}
        </div>

        {rejectingId === profile.id ? (
          <div style={{ marginBottom: '8px' }}>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why are you rejecting this profile?"
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '11px',
                marginBottom: '8px',
                fontFamily: 'inherit',
              }}
              rows={2}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                onClick={() => handleReject(profile.id, table)}
                disabled={actionLoading === `reject-${profile.id}`}
                variant="primary"
                style={{ flex: 1, padding: '6px' }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  setRejectingId(null)
                  setRejectReason('')
                }}
                variant="ghost"
                style={{ flex: 1, padding: '6px' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button
              onClick={() => handleApprove(profile.id, table)}
              disabled={actionLoading === `approve-${profile.id}`}
              variant="primary"
              style={{ flex: 1, padding: '6px' }}
            >
              Approve
            </Button>
            <Button
              onClick={() => setRejectingId(profile.id)}
              variant="ghost"
              style={{ flex: 1, padding: '6px' }}
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Admin
        </h1>
        <AvatarButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-5xl">
        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {[
            [pendingCount, 'Pending'],
            [openGigsCount, 'Open Gigs'],
            [bookings.length, 'Bookings'],
            [reviews.length, 'Reviews'],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-2)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Section Toggle (PRD 5.8: queue + view of all gigs, bookings, reviews) */}
        <SegmentedControl
          options={['Queue', 'Gigs', 'Bookings', 'Reviews']}
          value={view}
          onChange={setView}
        />

        {view === 'Queue' && (
          <div style={{ marginTop: '14px' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Pending Verification
            </h2>
            {pendingCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>
                ✓ All profiles verified!
              </div>
            ) : (
              <>
                {performers.map(p => renderQueueCard(p, 'performer'))}
                {venues.map(v => renderQueueCard(v, 'venue'))}
              </>
            )}
          </div>
        )}

        {view === 'Gigs' && (
          <div style={{ marginTop: '14px' }}>
            {gigs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>No gigs yet.</div>
            ) : (
              gigs.map(gig => (
                <div key={gig.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                        {gig.venue_profiles?.name || 'Venue'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-2)' }}>
                        {new Date(gig.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}, {formatTime(gig.time_start)} to {formatTime(gig.time_end)} · {gig.act_type_needed}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: gig.status === 'open' ? 'var(--verified-text)' : 'var(--text-3)', textTransform: 'capitalize' }}>
                      {gig.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'Bookings' && (
          <div style={{ marginTop: '14px' }}>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>No bookings yet.</div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                        {booking.performer_profiles?.name || 'Performer'} @ {booking.venue_profiles?.name || 'Venue'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-2)' }}>
                        {new Date(booking.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <StatusBadge status={booking.status as any}>
                      <span style={{ textTransform: 'capitalize' }}>{booking.status}</span>
                    </StatusBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'Reviews' && (
          <div style={{ marginTop: '14px' }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>No reviews yet.</div>
            ) : (
              reviews.map(review => (
                <div key={review.id} style={cardStyle}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text)', marginBottom: '3px' }}>
                    ⭐ {review.rating} · "{review.comment}"
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>
                    {(review.tags || []).join(' · ')} · {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
