'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, ChipRow, Chip, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { getCurrentUser } from '@/utils/auth'
import { getBooking, getPerformerProfileById, getVenueProfileById, updateBookingStatus, createReview } from '@/utils/db'

const TAGS = ['respectful', 'followed through', 'would work with again', 'professional', 'great energy']

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [booking, setBooking] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [isPerformer, setIsPerformer] = useState(false)

  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const bookingData = await getBooking(id)
        setBooking(bookingData)

        // Booking rows hold profile ids, so resolve both profiles and
        // compare their user_id against the signed-in user
        const [performerProfile, venueProfile] = await Promise.all([
          getPerformerProfileById(bookingData.performer_id),
          getVenueProfileById(bookingData.venue_id),
        ])

        if (performerProfile.user_id === currentUser.id) {
          setIsPerformer(true)
          setOtherUser(venueProfile)
        } else {
          setIsPerformer(false)
          setOtherUser(performerProfile)
        }

        // Gate: only show feedback if booking is completed
        if (bookingData.status !== 'completed') {
          toast.error('This booking is not yet completed')
          router.push('/app/bookings')
          return
        }
      } catch (error: any) {
        toast.error('Booking not found')
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      // Update booking with rating/comment/tags (from current user's perspective)
      const updates: any = {}
      if (isPerformer) {
        updates.performer_rating = rating
        updates.performer_comment = comment
        updates.performer_tags = selectedTags
      } else {
        updates.venue_rating = rating
        updates.venue_comment = comment
        updates.venue_tags = selectedTags
      }

      // Update the booking fields directly via supabase
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Create review record
      await createReview({
        booking_id: id,
        from_user_id: user.id,
        to_user_id: otherUser.user_id,
        rating: rating,
        comment: comment,
        tags: selectedTags,
      })

      toast.success('Feedback submitted!')
      router.push('/app/bookings')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <PageLoader />
      </div>
    )
  }

  if (!booking || !otherUser) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link href="/app/bookings" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          ← Back
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Rate Your Show
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Who you're rating */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Rating</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>{otherUser.name}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div style={{ textAlign: 'center', fontSize: '32px', marginBottom: '20px', color: 'var(--accent-text)' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '32px',
                    opacity: star <= rating ? 1 : 0.3,
                    transition: 'opacity 0.2s',
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="field-label">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how it went"
                className="field-input"
                rows={4}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="field-label">Tags</label>
              <ChipRow>
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: selectedTags.includes(tag) ? 'var(--accent)' : 'var(--border)',
                      color: selectedTags.includes(tag) ? '#FFF' : 'var(--text-2)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </ChipRow>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={submitting || rating === 0}
              style={{ marginTop: '24px' }}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
