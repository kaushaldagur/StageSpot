'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Badge, Button, PageLoader } from '@/components'
import { useState, useEffect, use } from 'react'
import { getCurrentUser } from '@/utils/auth'
import { getVenueProfileById, getReviewsForUser, getUserProfileIds, hasCompletedBookingBetween } from '@/utils/db'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [venue, setVenue] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({})
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [workedWith, setWorkedWith] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser()

        const profile = await getVenueProfileById(id)
        setVenue(profile)
        setIsOwnProfile(user.id === profile.user_id)

        // "Already worked with this venue" (PRD 5.3): shown to a performer
        // with a prior completed booking here
        if (user && user.id !== profile.user_id) {
          try {
            const { performerIds } = await getUserProfileIds(user.id)
            setWorkedWith(await hasCompletedBookingBetween(performerIds, [profile.id]))
          } catch {
            setWorkedWith(false)
          }
        }

        // Reviews + reviewer names (performers who played here)
        try {
          const venueReviews = await getReviewsForUser(profile.user_id)
          setReviews(venueReviews || [])

          const reviewerIds = Array.from(new Set((venueReviews || []).map(r => r.from_user_id)))
          if (reviewerIds.length > 0) {
            const [perfRes, venRes] = await Promise.all([
              supabase.from('performer_profiles').select('user_id, name').in('user_id', reviewerIds),
              supabase.from('venue_profiles').select('user_id, name').in('user_id', reviewerIds),
            ])
            const names: Record<string, string> = {}
            for (const row of [...(perfRes.data || []), ...(venRes.data || [])]) names[row.user_id] = row.name
            setReviewerNames(names)
          }
        } catch {
          setReviews([])
        }
      } catch (error: any) {
        toast.error('Venue not found')
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <PageLoader />
      </div>
    )
  }

  if (!venue) {
    return null
  }

  const workedWithCount = new Set(reviews.map(r => r.from_user_id)).size
  const photos: string[] = venue.venue_photos || []

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4" style={{ backgroundColor: 'var(--bg)' }}>
        <button onClick={() => router.back()} style={{ fontSize: '18px', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ←
        </button>
        {isOwnProfile ? (
          <button
            onClick={() => router.push(`/app/profile/setup/venue`)}
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-text)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Edit
          </button>
        ) : (
          <div />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20 w-full mx-auto max-w-md lg:max-w-2xl">
        {/* Profile Head */}
        <div style={{ textAlign: 'center', padding: '4px 20px 14px' }}>
          {venue.profile_picture_url ? (
            <Image
              src={venue.profile_picture_url}
              alt={venue.name}
              width={76}
              height={76}
              className="profile-avatar"
              style={{ margin: '0 auto 10px', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="profile-avatar" style={{ margin: '0 auto 10px' }} />
          )}
          <div className="profile-name">{venue.name}</div>
          <div className="profile-id" style={{ margin: '2px 0 10px' }}>
            Venue · ID V-{String(venue.id).slice(0, 4).toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '10px' }}>
            {/* Exact address stays hidden until a booking is confirmed (PRD 5.6) */}
            {isOwnProfile ? venue.full_address : `${venue.locality}, ${venue.city}`}
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            {venue.verification_status === 'approved' && <Badge variant="verified">Verified</Badge>}
            {workedWith && <Badge variant="verified">Already worked with this venue</Badge>}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            padding: '12px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: '14px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{venue.rating || 0}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-2)' }}>rating</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{venue.total_gigs_hosted || 0}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-2)' }}>gigs hosted</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{workedWithCount}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-2)' }}>worked with</div>
          </div>
        </div>

        {/* Venue photo slots (wireframe) */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {[0, 1, 2].map(i =>
            photos[i] ? (
              // Photos are stored as links (PRD Section 7) and may not be
              // direct image URLs — fall back to the wireframe gradient slot
              // and link out when the image can't be embedded.
              <a
                key={i}
                href={photos[i]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, height: '56px', borderRadius: '10px', overflow: 'hidden', minWidth: 0, background: 'linear-gradient(160deg,#EFE7D8,#D9C9A8)', display: 'block' }}
              >
                <img
                  src={photos[i]}
                  alt={`${venue.name} photo ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </a>
            ) : (
              <div
                key={i}
                style={{ flex: 1, height: '56px', borderRadius: '10px', background: 'linear-gradient(160deg,#EFE7D8,#D9C9A8)' }}
              />
            )
          )}
        </div>

        {/* Venue video + social links (PRD 5.3), wireframe icon-pill row */}
        {(venue.venue_video_link || venue.social_media_links?.other || venue.social_media_links?.instagram) && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}>
            {venue.venue_video_link && (
              <a
                href={venue.venue_video_link}
                target="_blank"
                rel="noopener noreferrer"
                title="Venue video"
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4l16 8-16 8V4z" stroke="#6B6862" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </a>
            )}
            {venue.social_media_links?.instagram && (
              <a
                href={`https://instagram.com/${String(venue.social_media_links.instagram).replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#6B6862" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" stroke="#6B6862" strokeWidth="1.6" /></svg>
              </a>
            )}
            {venue.social_media_links?.other && (
              <a
                href={venue.social_media_links.other}
                target="_blank"
                rel="noopener noreferrer"
                title="Social link"
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#6B6862" strokeWidth="1.6" /><path d="M4 15l4-4 4 4 5-6 3 3" stroke="#6B6862" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            )}
          </div>
        )}

        {/* Act Types */}
        {venue.act_types_wanted && venue.act_types_wanted.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div className="section-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '4px 0 8px' }}>
              Looking for
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {venue.act_types_wanted.map((type: string) => (
                <span key={type} className="m-chip">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Past gigs hosted (from reviews received) */}
        {reviews.length > 0 && (
          <>
            <div className="section-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '4px 0 8px' }}>
              Past gigs hosted
            </div>
            {reviews.slice(0, 4).map((review, idx) => (
              <div
                key={`gig-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              >
                <span>{reviewerNames[review.from_user_id] || 'Performer'}</span>
                <span className="card-meta">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <div className="section-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '4px 0 8px' }}>
              Reviews
            </div>
            {reviews.map((review, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ fontSize: '11.5px', color: 'var(--text)', marginBottom: '3px' }}>
                  ⭐ {review.rating} · &quot;{review.comment}&quot;
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>
                  {reviewerNames[review.from_user_id] || 'Performer'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {!isOwnProfile && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push('/app/gigs/new')}
            style={{ marginTop: '20px' }}
          >
            Post a Gig Here
          </Button>
        )}
      </main>
    </div>
  )
}
