'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/utils/auth'
import { SegmentedControl, FeedCard, Button, TabBar, AISearchSheet, AppNav, AvatarButton, FeedSkeleton } from '@/components'
import toast, { Toaster } from 'react-hot-toast'
import { getOpenGigs, getFeaturedPerformers, getUserRole, getPerformerProfile, getVenueProfile } from '@/utils/db'
import { formatTime } from '@/utils/format'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feedType, setFeedType] = useState('Performers')
  const [activeTab, setActiveTab] = useState('home')
  const [showSearch, setShowSearch] = useState(false)
  const [performers, setPerformers] = useState<any[]>([])
  const [gigs, setGigs] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  // undefined = not applicable (admin); null = role chosen but profile not created yet
  const [ownProfile, setOwnProfile] = useState<any>(undefined)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }
        setUser(currentUser)

        const userRole = await getUserRole(currentUser.id).catch(() => null)
        setRole(userRole)
        setIsAdmin(userRole === 'admin' || currentUser.app_metadata?.role === 'admin')

        // Each side sees what they're looking for first: performers browse
        // gigs, venues browse performers (PRD 5.1 keeps the toggle for both)
        if (userRole === 'performer') setFeedType('Gigs')
        if (userRole === 'venue') setFeedType('Performers')

        const [gigData, performerData, myProfile] = await Promise.all([
          getOpenGigs(20),
          getFeaturedPerformers(20),
          userRole === 'performer'
            ? getPerformerProfile(currentUser.id).catch(() => null)
            : userRole === 'venue'
              ? getVenueProfile(currentUser.id).catch(() => null)
              : Promise.resolve(undefined),
        ])

        setGigs(gigData)
        setPerformers(performerData)
        setOwnProfile(myProfile)
      } catch (error: any) {
        console.error('Home page error:', error)
        if (error?.status === 401) {
          router.push('/auth/login')
        } else {
          toast.error('Failed to load data')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const tabs = [
    { id: 'home', label: 'Home', icon: '●' },
    { id: 'explore', label: 'Explore', icon: '◻' },
  ]

  const feedData = feedType === 'Performers'
    ? performers.map(p => ({
        id: p.id,
        name: p.name,
        verified: p.verification_status === 'approved',
        meta: `${p.act_type} · ${p.rating || 0} ⭐`,
        title: p.first_time_performing ? '🎉 First time performing' : `${p.total_performances} performances`,
        subtitle: p.bio?.substring(0, 60) || '',
        type: 'performer',
      }))
    : gigs.map(g => ({
        id: g.id,
        name: g.venue_profiles?.name || 'Venue',
        verified: true,
        meta: `${g.venue_profiles?.locality || ''} · ${new Date(g.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
        title: `${formatTime(g.time_start)} to ${formatTime(g.time_end)}`,
        subtitle: g.act_type_needed || 'Any act',
        type: 'gig',
      }))

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Home</h1>
          <AvatarButton />
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-5xl">
          <FeedSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Toaster position="top-center" />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          Home
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AppNav />
          {isAdmin && (
            <Link href="/admin/dashboard" className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
              Admin
            </Link>
          )}
          <AvatarButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-5xl">
        {/* Verification status nudge (PRD 5.2/5.3 gates) */}
        {(role === 'performer' || role === 'venue') && ownProfile === null && (
          <button
            onClick={() => router.push(`/app/profile/setup/${role}`)}
            className="p-3 rounded-lg text-center mb-4 w-full"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-text)', fontSize: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            👋 Finish setting up your {role} profile to get verified and start booking →
          </button>
        )}
        {ownProfile?.verification_status === 'pending' && (
          <div className="p-3 rounded-lg text-center mb-4" style={{ backgroundColor: 'var(--pending-soft)', color: 'var(--pending-text)', fontSize: '12px' }}>
            ⏳ Your profile is awaiting admin verification. You can browse meanwhile — {role === 'performer' ? 'applying' : 'posting gigs'} unlocks once approved.
          </div>
        )}
        {ownProfile?.verification_status === 'rejected' && (
          <button
            onClick={() => router.push('/app/profile')}
            className="p-3 rounded-lg text-center mb-4 w-full"
            style={{ backgroundColor: 'var(--error-soft)', color: 'var(--error-text)', fontSize: '12px', border: 'none', cursor: 'pointer' }}
          >
            ❌ Your profile was rejected — tap to see the reason and resubmit.
          </button>
        )}

        {/* Segmented Control */}
        <SegmentedControl
          options={['Performers', 'Gigs']}
          value={feedType}
          onChange={setFeedType}
        />

        {/* Feed Cards */}
        <div className="feed-grid">
          {feedData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>
              No {feedType.toLowerCase()} yet. Check back soon!
            </div>
          ) : (
            feedData.map((item: any) => (
              <FeedCard
                key={item.id}
                name={item.name}
                verified={item.verified}
                meta={item.meta}
                image={<div className="card-img" />}
                title={item.title}
                subtitle={item.subtitle}
                actions={
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="primary"
                      fullWidth
                      style={{ flex: 1 }}
                      onClick={() => {
                        if (item.type === 'performer') {
                          router.push(`/app/performer/${item.id}`)
                        } else {
                          router.push(`/app/gigs/${item.id}`)
                        }
                      }}
                    >
                      {/* CTA matches the viewer's role: venues invite performers,
                          performers apply to gigs, everyone else just views */}
                      {item.type === 'performer'
                        ? role === 'venue' ? 'Invite' : 'View'
                        : role === 'performer' ? 'Apply' : 'View'}
                    </Button>
                    {((item.type === 'performer' && role === 'venue') || (item.type === 'gig' && role === 'performer')) && (
                      <Button
                        variant="ghost"
                        style={{ padding: '8px 12px' }}
                        onClick={() => {
                          if (item.type === 'performer') {
                            router.push(`/app/performer/${item.id}`)
                          } else {
                            router.push(`/app/gigs/${item.id}`)
                          }
                        }}
                      >
                        View
                      </Button>
                    )}
                  </div>
                }
              />
            ))
          )}
        </div>
      </main>

      {/* AI Search Sheet */}
      <AISearchSheet isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Floating Action Button */}
      <button className="fab" onClick={() => setShowSearch(true)}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: '20px', height: '20px' }}>
          <path
            d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z"
            fill="#FFF"
          />
        </svg>
      </button>

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          if (id === 'explore') {
            router.push('/app/explore')
          }
          setActiveTab(id)
        }}
      />
    </div>
  )
}
