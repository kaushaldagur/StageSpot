'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, SegmentedControl, ImageUpload, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { getCurrentUser } from '@/utils/auth'
import { createPerformerProfile, getPerformerProfile, updatePerformerProfile } from '@/utils/db'

const ACT_TYPES = ['Music', 'Comedy', 'Poetry', 'Other']

export default function PerformerSetup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isEdit, setIsEdit] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    act_type: 'Music',
    bio: '',
    social_media_links: { other: '' },
    portfolio_links: [''],
    first_time_performing: false,
    proof_of_work_link: '',
  })

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        try {
          const existingProfile = await getPerformerProfile(user.id)
          if (existingProfile) {
            setIsEdit(true)
            setFormData({
              name: existingProfile.name,
              act_type: existingProfile.act_type,
              bio: existingProfile.bio,
              social_media_links: { other: existingProfile.social_media_links?.other || '' },
              portfolio_links: existingProfile.portfolio_links || [''],
              first_time_performing: existingProfile.first_time_performing,
              proof_of_work_link: existingProfile.proof_of_work_link || '',
            })
            setProfilePictureUrl(existingProfile.profile_picture_url || '')
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      })
    } else if (name === 'socialLink') {
      setFormData({
        ...formData,
        social_media_links: { other: value },
      })
    } else if (name === 'portfolioLink') {
      setFormData({
        ...formData,
        portfolio_links: [value],
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.bio) {
      toast.error('Please fill in name and bio')
      return
    }

    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const profileData = {
        user_id: user.id,
        name: formData.name,
        act_type: formData.act_type.toLowerCase(),
        bio: formData.bio,
        profile_picture_url: profilePictureUrl,
        social_media_links: formData.social_media_links,
        portfolio_links: formData.portfolio_links.filter(link => link.trim()),
        first_time_performing: formData.first_time_performing,
        proof_of_work_link: formData.proof_of_work_link,
        verification_status: 'pending' as const,
        rating: 0,
        total_performances: 0,
      } as any

      if (isEdit) {
        await updatePerformerProfile(user.id, profileData)
        toast.success('Profile updated!')
      } else {
        await createPerformerProfile(profileData)
        toast.success('Profile submitted for verification!')
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
          {isEdit ? 'Edit Profile' : 'Your Profile'}
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="text-center mb-6">
              <ImageUpload
                onUpload={async (url) => {
                  setProfilePictureUrl(url)
                  // Persist right away when editing, so the picture survives
                  // a reload even if the rest of the form is never submitted.
                  if (isEdit) {
                    try {
                      const user = await getCurrentUser()
                      if (user) await updatePerformerProfile(user.id, { profile_picture_url: url } as any)
                    } catch {
                      // form submit remains the fallback path
                    }
                  }
                }}
                currentUrl={profilePictureUrl}
                label="Upload Profile Picture"
              />
            </div>

            {/* Name */}
            <div>
              <label className="field-label">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="field-input"
              />
            </div>

            {/* Act Type */}
            <div>
              <label className="field-label">Act Type *</label>
              <SegmentedControl
                options={ACT_TYPES}
                value={formData.act_type.charAt(0).toUpperCase() + formData.act_type.slice(1)}
                onChange={(value) => setFormData({ ...formData, act_type: value.toLowerCase() })}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="field-label">Bio *</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your performance style"
                className="field-input"
                rows={4}
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

            {/* Portfolio Link */}
            <div>
              <label className="field-label">Portfolio Link</label>
              <input
                type="text"
                name="portfolioLink"
                value={formData.portfolio_links[0]}
                onChange={handleChange}
                placeholder="youtube.com/..."
                className="field-input"
              />
            </div>

            {/* First Time */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="first_time_performing"
                id="firstTime"
                checked={formData.first_time_performing}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="firstTime" style={{ color: 'var(--text)', fontSize: '14px', cursor: 'pointer' }}>
                First time performing
              </label>
            </div>

            {/* Proof Link */}
            <div>
              <label className="field-label">Proof of Work Link</label>
              <input
                type="text"
                name="proof_of_work_link"
                value={formData.proof_of_work_link}
                onChange={handleChange}
                placeholder="Link to a video or page"
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
