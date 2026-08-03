'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/utils/auth'
import { getUserRole, getPerformerProfile, getVenueProfile } from '@/utils/db'

// Module-level cache so the avatar doesn't refetch (and flicker) on every
// page navigation within a session.
let cachedUrl: string | null | undefined

// Header avatar: shows the signed-in user's uploaded profile picture,
// falling back to the wireframe's gradient circle.
export const AvatarButton = () => {
  const [url, setUrl] = useState<string | null>(cachedUrl ?? null)

  useEffect(() => {
    if (cachedUrl !== undefined) return
    let alive = true
    const load = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return
        const role = await getUserRole(user.id).catch(() => null)
        let profile: any = null
        if (role === 'venue') {
          profile = await getVenueProfile(user.id).catch(() => null)
        } else {
          profile = await getPerformerProfile(user.id).catch(() => null)
          if (!profile) profile = await getVenueProfile(user.id).catch(() => null)
        }
        cachedUrl = profile?.profile_picture_url || null
        if (alive) setUrl(cachedUrl ?? null)
      } catch {
        cachedUrl = null
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <Link
      href="/app/profile"
      aria-label="My profile"
      className="w-8 h-8 rounded-full"
      style={{
        display: 'block',
        flexShrink: 0,
        background: url
          ? `url(${url}) center / cover no-repeat`
          : 'linear-gradient(135deg,#D9C3A0,#A8763F)',
        border: '1.5px solid var(--surface)',
        boxShadow: '0 0 0 1px var(--border)',
      }}
    />
  )
}
