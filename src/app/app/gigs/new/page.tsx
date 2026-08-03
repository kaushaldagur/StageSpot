'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, SegmentedControl, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { getCurrentUser } from '@/utils/auth'
import { getVenueProfile, createGig } from '@/utils/db'

const ACT_TYPES = ['Music', 'Comedy', 'Poetry', 'Other']

export default function PostGigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [venue, setVenue] = useState<any>(null)
  const [formData, setFormData] = useState({
    date: '',
    time_start: '',
    time_end: '',
    act_type_needed: 'Music',
    notes: '',
  })

  useEffect(() => {
    const loadVenue = async () => {
      try {
        const user = await getCurrentUser()
        const venueProfile = await getVenueProfile(user.id)

        if (venueProfile.verification_status !== 'approved') {
          toast.error('Your venue must be verified before posting gigs')
          router.push('/app/home')
          return
        }

        setVenue(venueProfile)
      } catch (error) {
        toast.error('You must be a verified venue to post gigs')
        router.push('/app/home')
      } finally {
        setLoading(false)
      }
    }

    loadVenue()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time_start) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      await createGig({
        venue_id: venue.id,
        date: formData.date,
        time_start: formData.time_start,
        time_end: formData.time_end,
        act_type_needed: formData.act_type_needed.toLowerCase(),
        notes: formData.notes,
        status: 'open' as any,
      })

      toast.success('Gig posted successfully!')
      router.push('/app/home')
    } catch (error: any) {
      toast.error(error.message || 'Failed to post gig')
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link href="/app/home" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          ← Back
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Post a Gig
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          {venue && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-2)' }}>Posting at</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                {venue.name}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="field-label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            {/* Time Start */}
            <div>
              <label className="field-label">Time Start *</label>
              <input
                type="time"
                name="time_start"
                value={formData.time_start}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            {/* Time End */}
            <div>
              <label className="field-label">Time End</label>
              <input
                type="time"
                name="time_end"
                value={formData.time_end}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            {/* Act Type */}
            <div>
              <label className="field-label">Act Type Needed *</label>
              <SegmentedControl
                options={ACT_TYPES}
                value={formData.act_type_needed}
                onChange={(value) => setFormData({ ...formData, act_type_needed: value })}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="field-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Tell performers about your venue, stage setup, audience, etc."
                className="field-input"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={submitting}
              style={{ marginTop: '24px' }}
            >
              {submitting ? 'Posting...' : 'Post Gig'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
