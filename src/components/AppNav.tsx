'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Desktop-only inline nav links (hidden on mobile, where the bottom
// tab bar handles navigation — PRD Section 8: navigation may need a
// different arrangement on larger screens).
export const AppNav = () => {
  const pathname = usePathname()
  const links = [
    { href: '/app/home', label: 'Home' },
    { href: '/app/explore', label: 'Explore' },
    { href: '/app/bookings', label: 'My Bookings' },
  ]

  return (
    <nav className="app-nav">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={pathname?.startsWith(l.href) ? 'active' : ''}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
