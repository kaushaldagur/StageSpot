'use client'

import { useRouter } from 'next/navigation'
import { Button, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { useState, useEffect, use } from 'react'
import { getCurrentUser } from '@/utils/auth'
import { getGig, createBooking, getVenueProfileById, getPerformerProfile } from '@/utils/db'
import { formatTime } from '@/utils/format'

export default function GigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [gig, setGig] = useState<any>(null)
  const [venue, setVenue] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [performer, setPerformer] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading gig:', id)
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Get gig details
        const gigData = await getGig(id)
        console.log('Gig data:', gigData)
        setGig(gigData)

        // Get venue details (for full address, shown only after confirmation)
        const venueData = await getVenueProfileById(gigData.venue_id)
        console.log('Venue data:', venueData)
        setVenue(venueData)

        // If user is a performer, get their profile to check verification
        if (currentUser) {
          try {
            const performerData = await getPerformerProfile(currentUser.id)
            console.log('Performer data:', performerData)
            setPerformer(performerData)
          } catch (perfError) {
            console.log('No performer profile (expected):', perfError)
            setPerformer(null)
          }
        }
      } catch (error: any) {
        console.error('Error loading gig:', error)
        console.error('Error message:', error.message)
        console.error('Full error:', JSON.stringify(error, null, 2))
        toast.error(`Failed: ${error.message || 'Unknown error'}`)
        setTimeout(() => router.back(), 2000)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const handleApply = async () => {
    if (!user) {
      toast.error('You must be logged in')
      return
    }

    if (!performer || performer.verification_status !== 'approved') {
      toast.error('Your profile must be verified before applying to gigs')
      return
    }

    setApplying(true)
    try {
      await createBooking({
        gig_id: gig.id,
        performer_id: performer.id,
        venue_id: venue.id,
        status: 'requested' as any,
        performer_rating: null,
        performer_comment: null,
        performer_tags: [],
        venue_rating: null,
        venue_comment: null,
        venue_tags: [],
      } as any)

      toast.success('Application sent! Wait for the venue to respond.')
      router.push('/app/bookings')
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <PageLoader />
      </div>
    )
  }

  if (!gig || !venue) {
    return null
  }

  // Format date nicely
  const gigDate = new Date(gig.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })

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
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto max-w-md lg:max-w-xl">
        {/* Gig Image */}
        <div
          style={{
            height: '150px',
            borderRadius: '14px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg,#EFE7D8,#DDD2BB)',
            overflow: 'hidden',
          }}
        >
          {/* Venue photo when the stored link is an embeddable image (PRD 5.3) */}
          {venue.venue_photos?.[0] && (
            <img
              src={venue.venue_photos[0]}
              alt={venue.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
        </div>

        {/* Venue Name */}
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {venue.name}
        </h1>

        {/* Location & Details - CRITICAL: Show address only after confirmed booking */}
        <div style={{ fontSize: '10.5px', color: 'var(--text-2)', marginBottom: '10px' }}>
          {venue.locality} · {venue.city}
        </div>

        {/* Date & Time */}
        <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '14px' }}>
          {gigDate}, {formatTime(gig.time_start)} to {formatTime(gig.time_end)} · {gig.act_type_needed}
        </div>

        {/* About Section */}
        <div>
          <div className="field-label">About this venue</div>
          <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5', padding: 0 }}>
            {gig.notes || 'No additional details provided yet.'}
          </div>
        </div>

        {/* Act Types Wanted */}
        {venue.act_types_wanted && venue.act_types_wanted.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <div className="field-label">We're looking for</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {venue.act_types_wanted.map((type: string) => (
                <span
                  key={type}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-text)',
                    fontSize: '11px',
                    fontWeight: '500',
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        {user && performer && performer.verification_status === 'approved' ? (
          <Button
            onClick={handleApply}
            disabled={applying}
            variant="primary"
            fullWidth
            style={{ marginTop: '20px' }}
          >
            {applying ? 'Sending...' : 'Request to Perform'}
          </Button>
        ) : user ? (
          <Button
            variant="primary"
            fullWidth
            disabled
            style={{ marginTop: '20px' }}
          >
            Complete your profile to apply
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/auth/login')}
            variant="primary"
            fullWidth
            style={{ marginTop: '20px' }}
          >
            Login to Apply
          </Button>
        )}
      </main>
    </div>
  )
}
