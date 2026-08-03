'use client'

import { useRouter } from 'next/navigation'
import { Button, PageLoader } from '@/components'
import { useState, useEffect, use } from 'react'
import { getCurrentUser } from '@/utils/auth'
import { getBooking, getGig, getVenueProfileById, getPerformerProfileById, updateBookingStatus } from '@/utils/db'
import { formatTime } from '@/utils/format'
import toast, { Toaster } from 'react-hot-toast'

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [booking, setBooking] = useState<any>(null)
  const [gig, setGig] = useState<any>(null)
  const [venue, setVenue] = useState<any>(null)
  const [performer, setPerformer] = useState<any>(null)
  const [isVenueUser, setIsVenueUser] = useState(false)
  const [isPerformerUser, setIsPerformerUser] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()

        let bookingData = await getBooking(id)
        const gigData = await getGig(bookingData.gig_id)

        // PRD 5.6: completed triggers automatically once the scheduled date has passed
        if (bookingData.status === 'confirmed' && new Date(`${gigData.date}T${gigData.time_end || '23:59'}`) < new Date()) {
          bookingData = await updateBookingStatus(bookingData.id, 'completed')
        }

        const venueData = await getVenueProfileById(bookingData.venue_id)
        const performerData = await getPerformerProfileById(bookingData.performer_id)

        setBooking(bookingData)
        setGig(gigData)
        setVenue(venueData)
        setPerformer(performerData)
        setIsVenueUser(user?.id === venueData.user_id)
        setIsPerformerUser(user?.id === performerData.user_id)
      } catch (error: any) {
        toast.error('Booking not found')
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const changeStatus = async (status: string, successMessage: string) => {
    setActionLoading(true)
    try {
      const updated = await updateBookingStatus(booking.id, status)
      setBooking(updated)
      toast.success(successMessage)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <PageLoader />
      </div>
    )
  }

  if (!booking || !gig || !venue || !performer) {
    return null
  }

  const status = booking.status
  const isConfirmed = status === 'confirmed'
  const isCompleted = status === 'completed'
  // PRD 5.6: contact information and exact address are revealed only at confirmed (or later)
  const detailsUnlocked = isConfirmed || isCompleted
  const gigDate = new Date(gig.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })

  const statusCopy: Record<string, { title: string; subtitle: string }> = {
    requested: {
      title: 'Booking Requested',
      subtitle: isVenueUser
        ? `${performer.name} wants to perform at your gig. Accept or decline below.`
        : 'Waiting for the venue to respond to your request.',
    },
    accepted: {
      title: 'Booking Accepted',
      subtitle: isPerformerUser
        ? 'The venue accepted! Confirm to lock in the show and reveal full details.'
        : 'Waiting for the performer to confirm the final details.',
    },
    confirmed: {
      title: 'Booking Confirmed',
      subtitle: 'Full details visible below. See you at the show!',
    },
    completed: {
      title: 'Show Completed',
      subtitle: 'Hope it went great! Leave feedback for the other side.',
    },
    declined: {
      title: 'Booking Declined',
      subtitle: 'This request was declined.',
    },
    cancelled: {
      title: 'Booking Cancelled',
      subtitle: 'This booking was cancelled.',
    },
  }

  const copy = statusCopy[status] || { title: status, subtitle: '' }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <button onClick={() => router.back()} className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          ← Back
        </button>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-sm mx-auto text-center" style={{ width: '100%' }}>
          {/* Status Icon */}
          {detailsUnlocked ? (
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--verified-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="var(--verified-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--pending-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{status === 'declined' || status === 'cancelled' ? '✕' : '⏳'}</span>
            </div>
          )}

          {/* Title */}
          <h1 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
            {copy.title}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '24px', lineHeight: '1.5' }}>
            {copy.subtitle}
          </p>

          {/* Details */}
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            {/* Performer */}
            <div>
              <label className="field-label">Performer</label>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              >
                {performer.name}
              </div>
            </div>

            {/* Venue - ADDRESS ONLY VISIBLE ONCE CONFIRMED (PRD 5.6) */}
            <div style={{ marginTop: '16px' }}>
              <label className="field-label">Venue</label>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              >
                {venue.name} · {detailsUnlocked ? venue.full_address : `${venue.locality}, ${venue.city} (exact address after confirmation)`}
              </div>
            </div>

            {/* Contact info - revealed only once confirmed (PRD 5.6) */}
            {detailsUnlocked && (
              <div style={{ marginTop: '16px' }}>
                <label className="field-label">Contact</label>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--text)',
                  }}
                >
                  {isPerformerUser
                    ? venue.social_media_links?.phone || venue.social_media_links?.instagram || 'Via the venue\'s social links on their profile'
                    : performer.social_media_links?.phone || performer.social_media_links?.instagram || 'Via the performer\'s social links on their profile'}
                </div>
              </div>
            )}

            {/* Date and Time */}
            <div style={{ marginTop: '16px' }}>
              <label className="field-label">Date and Time</label>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              >
                {gigDate}, {formatTime(gig.time_start)} to {formatTime(gig.time_end)}
              </div>
            </div>

            {/* Status */}
            <div style={{ marginTop: '16px' }}>
              <label className="field-label">Status</label>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: detailsUnlocked ? 'var(--verified-text)' : 'var(--pending-text)',
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </div>
            </div>
          </div>

          {/* Lifecycle Actions (PRD 5.6) */}
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            {/* Venue responds to a request */}
            {status === 'requested' && isVenueUser && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => changeStatus('accepted', 'Request accepted!')}
                >
                  Accept Request
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => changeStatus('declined', 'Request declined')}
                >
                  Decline
                </Button>
              </>
            )}

            {/* Performer can withdraw a pending request */}
            {status === 'requested' && isPerformerUser && (
              <Button
                variant="ghost"
                fullWidth
                disabled={actionLoading}
                onClick={() => changeStatus('declined', 'Request withdrawn')}
              >
                Withdraw Request
              </Button>
            )}

            {/* Performer confirms an accepted booking */}
            {status === 'accepted' && isPerformerUser && (
              <Button
                variant="primary"
                fullWidth
                disabled={actionLoading}
                onClick={() => changeStatus('confirmed', 'Booking confirmed! Full details unlocked.')}
              >
                Confirm Booking
              </Button>
            )}

            {/* Either party can cancel after acceptance (PRD 5.6) */}
            {(status === 'accepted' || status === 'confirmed') && (isVenueUser || isPerformerUser) && (
              <Button
                variant="ghost"
                fullWidth
                disabled={actionLoading}
                onClick={() => changeStatus('cancelled', 'Booking cancelled')}
              >
                Cancel Booking
              </Button>
            )}

            {/* Feedback unlocks after completion (PRD 5.7) */}
            {isCompleted && (
              <Button variant="primary" fullWidth onClick={() => router.push(`/app/bookings/${id}/feedback`)}>
                Leave Feedback
              </Button>
            )}

            <Button variant={isCompleted ? 'ghost' : 'primary'} fullWidth onClick={() => router.push('/app/bookings')}>
              My Bookings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
