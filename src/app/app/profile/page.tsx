'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/utils/auth'
import { getPerformerProfile, getVenueProfile, getUserRole } from '@/utils/db'
import { Button, Badge, AppNav, PageLoader } from '@/components'
import toast, { Toaster } from 'react-hot-toast'

type ProfileType = 'performer' | 'venue' | 'admin' | null

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileType, setProfileType] = useState<ProfileType>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Admins are created directly (PRD Section 4) and have no
        // performer/venue profile — show the admin view, not role selection
        const role = await getUserRole(currentUser.id).catch(() => null)
        if (role === 'admin' || currentUser.app_metadata?.role === 'admin') {
          setProfileType('admin')
          return
        }

        // Try to load performer profile
        try {
          const performerProfile = await getPerformerProfile(currentUser.id)
          setProfile(performerProfile)
          setProfileType('performer')
          return
        } catch {
          // No performer profile
        }

        // Try to load venue profile
        try {
          const venueProfile = await getVenueProfile(currentUser.id)
          setProfile(venueProfile)
          setProfileType('venue')
          return
        } catch {
          // No venue profile
        }

        // No profile found, show setup options
        setProfileType(null)
      } catch (error: any) {
        console.error('Profile load error:', error)
        if (error?.status === 401) {
          router.push('/auth/login')
        } else {
          toast.error('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <PageLoader />
      </div>
    )
  }

  // Admin account: no performer/venue profile to show or set up
  if (profileType === 'admin') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <Toaster position="top-center" />

        <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <Link href="/admin/dashboard" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
            ← Dashboard
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            My Profile
          </h1>
          <div />
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#D9C3A0,#A8763F)' }}
            />
            <div className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {user?.email}
            </div>
            <div className="badge badge-verified" style={{ display: 'inline-block', margin: '8px 0 24px' }}>
              Platform Administrator
            </div>

            <div className="space-y-3">
              <Button variant="primary" fullWidth onClick={() => router.push('/admin/dashboard')}>
                Open Admin Dashboard
              </Button>
              <Button variant="ghost" fullWidth onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show existing profile
  if (profileType && profile) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <Toaster position="top-center" />

        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <Link href="/app/home" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
            ← Back
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            My Profile
          </h1>
          <AppNav />
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-md mx-auto">
            {/* Profile Avatar */}
            <div className="text-center mb-8">
              {profile.profile_picture_url ? (
                <Image
                  src={profile.profile_picture_url}
                  alt={profile.name}
                  width={76}
                  height={76}
                  style={{
                    borderRadius: '50%',
                    border: '3px solid var(--surface)',
                    boxShadow: '0 0 0 1px var(--border)',
                    objectFit: 'cover',
                    display: 'block',
                    margin: '0 auto 16px',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#D9C3A0,#A8763F)',
                    margin: '0 auto 16px',
                  }}
                />
              )}

              <div className="text-lg font-semibold flex items-center justify-center gap-2" style={{ color: 'var(--text)' }}>
                {profile.name}
                {profile.verification_status === 'approved' && <Badge variant="verified">Verified</Badge>}
              </div>

              <div className="text-sm" style={{ color: 'var(--text-2)', marginTop: '4px' }}>
                {profileType === 'performer' ? `${profile.act_type} • ${profile.rating || 0} stars` : `${profile.city} • ${profile.rating || 0} stars`}
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-surface rounded-lg border p-4 space-y-3 mb-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              {profileType === 'performer' ? (
                <>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Bio</div>
                    <div style={{ color: 'var(--text)', marginTop: '4px' }}>{profile.bio}</div>
                  </div>
                  {profile.first_time_performing && (
                    <div style={{ fontSize: '12px', color: 'var(--accent)' }}>🎉 First time performing</div>
                  )}
                  {profile.total_performances > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Performances</div>
                      <div style={{ color: 'var(--text)', marginTop: '4px' }}>{profile.total_performances}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Address</div>
                    <div style={{ color: 'var(--text)', marginTop: '4px' }}>{profile.full_address}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Locality</div>
                    <div style={{ color: 'var(--text)', marginTop: '4px' }}>{profile.locality}</div>
                  </div>
                  {profile.total_gigs_hosted > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>Gigs Hosted</div>
                      <div style={{ color: 'var(--text)', marginTop: '4px' }}>{profile.total_gigs_hosted}</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Verification Status */}
            {profile.verification_status !== 'approved' && (
              <div
                className="p-3 rounded-lg text-center mb-6"
                style={{
                  backgroundColor: profile.verification_status === 'pending' ? 'var(--pending-soft)' : 'var(--error-soft)',
                  color: profile.verification_status === 'pending' ? 'var(--pending-text)' : 'var(--error-text)',
                  fontSize: '12px',
                }}
              >
                {profile.verification_status === 'pending' ? (
                  '⏳ Awaiting verification. You can edit your profile while waiting.'
                ) : (
                  <>
                    ❌ Profile was rejected. Please update and resubmit.
                    {/* PRD 5.8: a reason is required for rejection — show it to the user */}
                    {profile.rejection_reason && (
                      <div style={{ marginTop: '6px', fontWeight: 600 }}>
                        Reason: {profile.rejection_reason}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/app/profile/setup/${profileType}`)}
                variant="primary"
                fullWidth
              >
                Edit Profile
              </Button>

              {/* Only reachable spot on mobile — the tab bar has Home/Explore only */}
              <Button onClick={() => router.push('/app/bookings')} variant="ghost" fullWidth>
                My Bookings
              </Button>

              <Button onClick={handleSignOut} variant="ghost" fullWidth>
                Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show setup options when no profile exists
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <Link href="/app/home" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          ← Back
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Profile
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Profile Avatar */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#D9C3A0,#A8763F)' }}
            />
            <div className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {user?.email}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>
              Welcome to StageSpot
            </div>
          </div>

          {/* Setup Options */}
          <div className="space-y-4 mb-8">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Choose your role
            </h2>

            <Link href="/app/profile/setup/performer" style={{ display: 'block' }}>
              <div
                className="p-6 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎤</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  I&apos;m a Performer
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                  Create a profile to find gigs and showcase your talent
                </div>
              </div>
            </Link>

            <Link href="/app/profile/setup/venue" style={{ display: 'block' }}>
              <div
                className="p-6 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>☕</div>
                <div className="font-semibold" style={{ color: 'var(--text)' }}>
                  I&apos;m a Venue
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                  Set up your venue to host performances and find performers
                </div>
              </div>
            </Link>
          </div>

          {/* Sign Out */}
          <Button onClick={handleSignOut} variant="ghost" fullWidth>
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  )
}
