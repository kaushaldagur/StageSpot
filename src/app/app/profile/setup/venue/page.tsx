'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, ImageUpload, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { getCurrentUser } from '@/utils/auth'
import { createVenueProfile, getVenueProfile, updateVenueProfile } from '@/utils/db'
import { DELHI_LOCALITIES, getLocalityByName } from '@/utils/delhiLocalities'

const ACT_TYPES = ['Music', 'Comedy', 'Poetry', 'Other']

export default function VenueSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isEdit, setIsEdit] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    full_address: '',
    locality: '',
    city: '',
    act_types_wanted: ['Music'],
    social_media_links: { other: '' },
    proof_of_business_link: '',
    // PRD 5.3 / Section 7: photos and video stored as links
    venue_photos: ['', '', ''],
    venue_video_link: '',
  })

  // Check if user already has a venue profile
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        try {
          const existingProfile = await getVenueProfile(user.id)
          if (existingProfile) {
            setIsEdit(true)
            setProfilePictureUrl((existingProfile as any).profile_picture_url || '')
            const savedPhotos: string[] = (existingProfile as any).venue_photos || []
            setFormData({
              name: existingProfile.name,
              full_address: existingProfile.full_address,
              locality: existingProfile.locality,
              city: existingProfile.city,
              act_types_wanted: existingProfile.act_types_wanted || ['Music'],
              social_media_links: { other: existingProfile.social_media_links?.other || '' },
              proof_of_business_link: existingProfile.proof_of_business_link || '',
              venue_photos: [savedPhotos[0] || '', savedPhotos[1] || '', savedPhotos[2] || ''],
              venue_video_link: (existingProfile as any).venue_video_link || '',
            })
          }
        } catch {
          // Profile doesn't exist yet, that's fine
        }
      } catch (error: any) {
        console.error('Profile check error:', error)
        router.push('/auth/login')
      } finally {
        setChecking(false)
      }
    }

    checkProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'locality') {
      const localityData = getLocalityByName(value)
      setFormData({
        ...formData,
        locality: value,
        city: localityData?.city || '',
      })
    } else if (name === 'socialLink') {
      setFormData({
        ...formData,
        social_media_links: { other: value },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const toggleActType = (actType: string) => {
    setFormData({
      ...formData,
      act_types_wanted: formData.act_types_wanted.includes(actType)
        ? formData.act_types_wanted.filter((a) => a !== actType)
        : [...formData.act_types_wanted, actType],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.full_address || !formData.locality) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Get coordinates from locality
      const localityData = getLocalityByName(formData.locality)
      if (!localityData) {
        toast.error('Invalid locality selected')
        return
      }

      const profileData = {
        user_id: user.id,
        name: formData.name,
        profile_picture_url: profilePictureUrl,
        full_address: formData.full_address,
        state: 'Delhi',
        city: localityData.city,
        locality: localityData.name,
        coordinates: `(${localityData.lat},${localityData.lng})` as any,
        act_types_wanted: formData.act_types_wanted,
        social_media_links: formData.social_media_links,
        proof_of_business_link: formData.proof_of_business_link,
        venue_photos: formData.venue_photos.map(p => p.trim()).filter(Boolean),
        venue_video_link: formData.venue_video_link.trim() || null,
        verification_status: 'pending' as const,
        rating: 0,
        total_gigs_hosted: 0,
      } as any

      if (isEdit) {
        await updateVenueProfile(user.id, profileData)
        toast.success('Venue profile updated!')
      } else {
        await createVenueProfile(profileData)
        toast.success('Venue profile submitted for verification!')
      }

      router.push('/app/home')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit profile')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
          {isEdit ? 'Edit Venue' : 'Venue Profile'}
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture (PRD Section 7: direct upload) */}
            <div className="text-center mb-6">
              <ImageUpload
                onUpload={async (url) => {
                  setProfilePictureUrl(url)
                  // Persist right away when editing, so the picture survives
                  // a reload even if the rest of the form is never submitted.
                  if (isEdit) {
                    try {
                      const user = await getCurrentUser()
                      if (user) await updateVenueProfile(user.id, { profile_picture_url: url } as any)
                    } catch {
                      // form submit remains the fallback path
                    }
                  }
                }}
                currentUrl={profilePictureUrl}
                label="Upload Profile Picture"
              />
            </div>

            {/* Venue Name */}
            <div>
              <label className="field-label">Venue Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Cafe or restaurant name"
                className="field-input"
              />
            </div>

            {/* Full Address */}
            <div>
              <label className="field-label">Full Address *</label>
              <input
                type="text"
                name="full_address"
                value={formData.full_address}
                onChange={handleChange}
                placeholder="Street address"
                className="field-input"
              />
            </div>

            {/* Locality */}
            <div>
              <label className="field-label">Locality *</label>
              <select
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="field-input"
              >
                <option value="">Select a Delhi locality</option>
                {DELHI_LOCALITIES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}, {loc.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Act Types Wanted */}
            <div>
              <label className="field-label">Act Types Wanted</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {ACT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleActType(type)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      background: formData.act_types_wanted.includes(type) ? 'var(--accent)' : 'var(--border)',
                      color: formData.act_types_wanted.includes(type) ? '#FFF' : 'var(--text-2)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Venue Photos (links, PRD Section 7) */}
            <div>
              <label className="field-label">Venue Photos (links)</label>
              {formData.venue_photos.map((photo, i) => (
                <input
                  key={i}
                  type="text"
                  value={photo}
                  onChange={(e) => {
                    const photos = [...formData.venue_photos]
                    photos[i] = e.target.value
                    setFormData({ ...formData, venue_photos: photos })
                  }}
                  placeholder={`Photo link ${i + 1} (e.g. Instagram or Drive)`}
                  className="field-input"
                  style={{ marginBottom: '6px' }}
                />
              ))}
            </div>

            {/* Venue Video (optional) */}
            <div>
              <label className="field-label">Venue Video (link, optional)</label>
              <input
                type="text"
                name="venue_video_link"
                value={formData.venue_video_link}
                onChange={handleChange}
                placeholder="youtube.com/..."
                className="field-input"
              />
            </div>

            {/* Social Link */}
            <div>
              <label className="field-label">Social Media Link</label>
              <input
                type="text"
                name="socialLink"
                value={formData.social_media_links.other}
                onChange={handleChange}
                placeholder="instagram.com/..."
                className="field-input"
              />
            </div>

            {/* Proof Link */}
            <div>
              <label className="field-label">Proof of Business Link</label>
              <input
                type="text"
                name="proof_of_business_link"
                value={formData.proof_of_business_link}
                onChange={handleChange}
                placeholder="Registration or listing link"
                className="field-input"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? 'Submitting...' : isEdit ? 'Update Profile' : 'Submit for Verification'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
