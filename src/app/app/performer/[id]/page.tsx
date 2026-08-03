'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Badge, Button, PageLoader } from '@/components'
import { useState, useEffect, use } from 'react'
import { getCurrentUser } from '@/utils/auth'
import { getPerformerProfileById, getReviewsForUser, getUserProfileIds, hasCompletedBookingBetween } from '@/utils/db'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function PerformerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [performer, setPerformer] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({})
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [workedWith, setWorkedWith] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser()

        const profile = await getPerformerProfileById(id)
        setPerformer(profile)
        setIsOwnProfile(user?.id === profile?.user_id)

        // "Already worked with this artist" (PRD 5.2): shown to a venue
        // with a prior completed booking with this performer
        if (user && user.id !== profile.user_id) {
          try {
            const { venueIds } = await getUserProfileIds(user.id)
            setWorkedWith(await hasCompletedBookingBetween([profile.id], venueIds))
          } catch {
            setWorkedWith(false)
          }
        }

        // Reviews + reviewer names (venues that hosted this performer)
        try {
          const performerReviews = await getReviewsForUser(profile.user_id)
          setReviews(performerReviews || [])

          const reviewerIds = Array.from(new Set((performerReviews || []).map(r => r.from_user_id)))
          if (reviewerIds.length > 0) {
            const [venueRes, perfRes] = await Promise.all([
              supabase.from('venue_profiles').select('user_id, name').in('user_id', reviewerIds),
              supabase.from('performer_profiles').select('user_id, name').in('user_id', reviewerIds),
            ])
            const names: Record<string, string> = {}
            for (const row of [...(venueRes.data || []), ...(perfRes.data || [])]) names[row.user_id] = row.name
            setReviewerNames(names)
          }
        } catch {
          setReviews([])
        }
      } catch (error: any) {
        toast.error(`Failed: ${error.message || 'Unknown error'}`)
        setTimeout(() => router.back(), 2000)
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

  if (!performer) {
    return null
  }

  const workedWithCount = new Set(reviews.map(r => r.from_user_id)).size
  const socialLinks: { key: string; href: string; icon: 'instagram' | 'play' | 'image' }[] = []
  if (performer.social_media_links?.instagram) {
    const handle = String(performer.social_media_links.instagram).replace('@', '')
    socialLinks.push({ key: 'instagram', href: `https://instagram.com/${handle}`, icon: 'instagram' })
  }
  if (performer.social_media_links?.other) {
    socialLinks.push({ key: 'other', href: performer.social_media_links.other, icon: 'image' })
  }
  for (const [i, link] of (performer.portfolio_links || []).entries()) {
    socialLinks.push({ key: `portfolio-${i}`, href: link, icon: 'play' })
  }

  const icons = {
    instagram: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="#6B6862" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="#6B6862" strokeWidth="1.6" />
      </svg>
    ),
    play: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M4 4l16 8-16 8V4z" stroke="#6B6862" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    image: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="#6B6862" strokeWidth="1.6" />
        <path d="M4 15l4-4 4 4 5-6 3 3" stroke="#6B6862" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4" style={{ backgroundColor: 'var(--bg)' }}>
        <button onClick={() => router.back()} style={{ fontSize: '18px', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ←
        </button>
        {isOwnProfile ? (
          <button
            onClick={() => router.push(`/app/profile/setup/performer`)}
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
          {performer.profile_picture_url ? (
            <Image
              src={performer.profile_picture_url}
              alt={performer.name}
              width={76}
              height={76}
              className="profile-avatar"
              style={{ objectFit: 'cover', margin: '0 auto 10px' }}
            />
          ) : (
            <div className="profile-avatar" style={{ margin: '0 auto 10px' }} />
          )}
          <div className="profile-name">{performer.name}</div>
          <div className="profile-id" style={{ margin: '2px 0 10px' }}>
            Performer · ID P-{String(performer.id).slice(0, 4).toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            {performer.verification_status === 'approved' && <Badge variant="verified">Verified</Badge>}
            {performer.first_time_performing && <span className="m-chip">first stage</span>}
            {workedWith && <Badge variant="verified">Already worked with this artist</Badge>}
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{performer.rating || 0}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-2)' }}>rating</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{performer.total_performances || 0}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-2)' }}>performances</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{workedWithCount}</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-2)' }}>worked with</div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5, textAlign: 'center', marginBottom: '16px', padding: '0 8px' }}>
          {performer.bio}
        </div>

        {/* Social / portfolio icon pills */}
        {socialLinks.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}>
            {socialLinks.map(link => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icons[link.icon]}
              </a>
            ))}
          </div>
        )}

        {/* Recent performances (from reviews received) */}
        {reviews.length > 0 && (
          <>
            <div className="section-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '4px 0 8px' }}>
              Recent performances
            </div>
            {reviews.slice(0, 4).map((review, idx) => (
              <div
                key={`perf-${idx}`}
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
                <span>{reviewerNames[review.from_user_id] || 'Venue'}</span>
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
                  {reviewerNames[review.from_user_id] || 'Venue'}
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
            Post a Gig for This Performer
          </Button>
        )}
      </main>
    </div>
  )
}
