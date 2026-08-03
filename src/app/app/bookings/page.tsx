'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StatusBadge, TabBar, AppNav, AvatarButton, ListSkeleton } from '@/components'
import { formatTime } from '@/utils/format'
import { getCurrentUser } from '@/utils/auth'
import { getUserBookings, getUserProfileIds, getGig, getPerformerProfileById, getVenueProfileById } from '@/utils/db'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('bookings')
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const user = await getCurrentUser()
        const [userBookings, { performerIds }] = await Promise.all([
          getUserBookings(user.id),
          getUserProfileIds(user.id),
        ])

        // Enrich bookings with gig and user details; one failed lookup
        // must not blank the whole list
        const enriched = await Promise.all(
          userBookings.map(async (booking) => {
            let gigLabel = ''
            try {
              const gig = await getGig(booking.gig_id)
              const gigDate = new Date(gig.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
              gigLabel = `${gigDate}, ${formatTime(gig.time_start)}`
            } catch {
              gigLabel = 'Gig details unavailable'
            }

            let otherUserName = ''
            try {
              if (performerIds.includes(booking.performer_id)) {
                // Current user is performer, get venue name
                const venue = await getVenueProfileById(booking.venue_id)
                otherUserName = venue.name
              } else {
                // Current user is venue, get performer name
                const performer = await getPerformerProfileById(booking.performer_id)
                otherUserName = performer.name
              }
            } catch {
              otherUserName = 'Unknown'
            }

            return {
              id: booking.id,
              title: `${otherUserName}, ${gigLabel}`,
              status: booking.status,
              meta: getStatusMeta(booking.status),
            }
          })
        )

        setBookings(enriched)
      } catch (error: any) {
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Waiting for response'
      case 'accepted':
        return 'Awaiting confirmation'
      case 'confirmed':
        return 'Confirmed - ready to go'
      case 'completed':
        return 'Leave feedback'
      case 'declined':
        return 'Not available'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: '●' },
    { id: 'explore', label: 'Explore', icon: '◻' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>My Bookings</h1>
          <AvatarButton />
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-3xl">
          <ListSkeleton count={4} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          My Bookings
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AppNav />
          <AvatarButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 w-full mx-auto lg:max-w-3xl">
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)', fontSize: '12px' }}>
            No bookings yet. Start by posting a gig or applying to one!
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => router.push(`/app/bookings/${booking.id}/confirm`)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>
                    {booking.title}
                  </div>
                  <StatusBadge status={booking.status as any}>
                    {booking.status === 'requested' && 'Requested'}
                    {booking.status === 'accepted' && 'Accepted'}
                    {booking.status === 'confirmed' && 'Confirmed'}
                    {booking.status === 'completed' && 'Completed'}
                    {booking.status === 'declined' && 'Declined'}
                    {booking.status === 'cancelled' && 'Cancelled'}
                  </StatusBadge>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-2)' }}>
                  {booking.meta}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          if (id === 'home') {
            router.push('/app/home')
          } else if (id === 'explore') {
            router.push('/app/explore')
          }
          setActiveTab(id)
        }}
      />
    </div>
  )
}
