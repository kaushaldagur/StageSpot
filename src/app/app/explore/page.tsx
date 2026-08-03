'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/utils/auth'
import { SegmentedControl, TabBar, AISearchSheet, AppNav, AvatarButton, MasonrySkeleton } from '@/components'
import { formatTime } from '@/utils/format'
import toast, { Toaster } from 'react-hot-toast'
import { getOpenGigs, searchPerformers, getVenueProfile } from '@/utils/db'
import { haversineDistanceKm, Coordinates } from '@/utils/geo'

// "(28.6329,77.1197)" — Postgres point string from venue_profiles.coordinates
function parsePoint(value: string | null | undefined): Coordinates | null {
  if (!value) return null
  const m = String(value).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/)
  return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null
}

// Default origin: Connaught Place, central Delhi (launch region)
const DELHI_CENTER: Coordinates = { lat: 28.6329, lng: 77.2195 }

export default function ExplorePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('Performers')
  const [activeTab, setActiveTab] = useState('explore')
  const [performers, setPerformers] = useState<any[]>([])
  const [gigs, setGigs] = useState<any[]>([])
  const [selectedDistance, setSelectedDistance] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showSearch, setShowSearch] = useState(false)
  const [origin, setOrigin] = useState<Coordinates>(DELHI_CENTER)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Load all performers
        const allPerformers = await searchPerformers('', 100)
        setPerformers(allPerformers)

        // Load all gigs
        const allGigs = await getOpenGigs(100)
        setGigs(allGigs)

        // Distance origin (PRD 5.4): the venue's saved address if the user
        // is a venue, otherwise browser geolocation, else central Delhi
        try {
          const venueProfile = await getVenueProfile(currentUser.id)
          const point = parsePoint(venueProfile?.coordinates as any)
          if (point) {
            setOrigin(point)
            return
          }
        } catch {
          // not a venue — fall through to geolocation
        }
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {}
          )
        }
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const tabs = [
    { id: 'home', label: 'Home', icon: '●' },
    { id: 'explore', label: 'Explore', icon: '◻' },
  ]

  const distanceOptions = [
    { label: 'All', value: 'all' },
    { label: 'Nearby (5km)', value: '5' },
    { label: 'Within 15km', value: '15' },
  ]

  // Distance-based "near me" filtering for gigs (PRD 5.4) — venues carry
  // coordinates; compute each gig's distance from the origin. Nearest first
  // when a radius is chosen, soonest first otherwise (recency, PRD 5.1)
  const gigsWithDistance = gigs.map(g => {
    const point = parsePoint(g.venue_profiles?.coordinates)
    return { ...g, distanceKm: point ? haversineDistanceKm(origin, point) : null }
  })
  const filteredGigs = (selectedDistance === 'all'
    ? gigsWithDistance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : gigsWithDistance
        .filter(g => g.distanceKm !== null && g.distanceKm <= Number(selectedDistance))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)))

  // Category (act type) filtering for performers (PRD 5.1)
  const filteredPerformers = selectedCategory === 'all'
    ? performers
    : performers.filter(p => (p.act_type || '').toLowerCase() === selectedCategory)

  // Masonry cards per the wireframe: image, name, one accent chip
  const heights = [110, 150, 120, 95, 130, 100]
  const feedData = view === 'Performers'
    ? filteredPerformers.map((p, i) => ({
        id: p.id,
        name: p.name,
        chip: p.first_time_performing ? 'first stage' : `★ ${p.rating || 0} ${(p.act_type || '').toLowerCase()}`,
        height: heights[i % heights.length],
        type: 'performer',
      }))
    : filteredGigs.map((g, i) => ({
        id: g.id,
        name: g.venue_profiles?.name || 'Venue',
        chip: `${new Date(g.date).toLocaleDateString('en-IN', { weekday: 'short' })}, ${formatTime(g.time_start)}${g.distanceKm !== null ? ` · ${g.distanceKm.toFixed(1)}km` : ''}`,
        height: heights[(i + 1) % heights.length],
        type: 'gig',
      }))

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Explore</h1>
          <AvatarButton />
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-5xl">
          <MasonrySkeleton count={6} />
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
          Explore
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AppNav />
          <AvatarButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-5xl">
        {/* View Toggle */}
        <SegmentedControl
          options={['Performers', 'Gigs']}
          value={view}
          onChange={setView}
        />

        {/* Category filter for performers (PRD 5.1) */}
        {view === 'Performers' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Music', value: 'music' },
              { label: 'Comedy', value: 'comedy' },
              { label: 'Poetry', value: 'poetry' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedCategory(opt.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: selectedCategory === opt.value ? 'var(--accent)' : 'var(--border)',
                  color: selectedCategory === opt.value ? '#FFF' : 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Distance Filter — applies to gigs, whose venues have coordinates (PRD 5.4) */}
        {view === 'Gigs' && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
            {distanceOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedDistance(opt.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  background: selectedDistance === opt.value ? 'var(--accent)' : 'var(--border)',
                  color: selectedDistance === opt.value ? '#FFF' : 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Masonry grid (wireframe explore) */}
        <div style={{ marginTop: '12px' }}>
          {feedData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>
              No {view.toLowerCase()} found
            </div>
          ) : (
            <div className="masonry">
              {feedData.map((item: any) => (
                <div
                  key={item.id}
                  className="m-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (item.type === 'performer') {
                      router.push(`/app/performer/${item.id}`)
                    } else {
                      router.push(`/app/gigs/${item.id}`)
                    }
                  }}
                >
                  <div className="m-img" style={{ height: `${item.height}px` }} />
                  <div className="m-body">
                    <div className="m-name">{item.name}</div>
                    <div className="m-chip">{item.chip}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* AI Search Sheet + FAB (PRD 5.1: visible on both tabs) */}
      <AISearchSheet isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <button className="fab" onClick={() => setShowSearch(true)}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: '20px', height: '20px' }}>
          <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z" fill="#FFF" />
        </svg>
      </button>

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          if (id === 'home') {
            router.push('/app/home')
          }
          setActiveTab(id)
        }}
      />
    </div>
  )
}
