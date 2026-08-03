import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Landing-page "This week nearby" preview (PRD 5.1) runs before sign-in,
// but RLS only exposes profiles/gigs to authenticated users. This server-side
// route returns a minimal, safe slice: approved performers and open gigs,
// locality only — never the exact address (PRD 5.6).
function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export async function GET() {
  try {
    const supabase = getServerClient()

    const [performersRes, gigsRes] = await Promise.all([
      supabase
        .from('performer_profiles')
        .select('id, name, act_type, rating, first_time_performing')
        .eq('verification_status', 'approved')
        .order('rating', { ascending: false })
        .limit(4),
      supabase
        .from('gigs')
        .select('id, date, time_start, act_type_needed, venue_profiles(name, locality)')
        .eq('status', 'open')
        .order('date', { ascending: true })
        .limit(4),
    ])

    if (performersRes.error) throw performersRes.error
    if (gigsRes.error) throw gigsRes.error

    return NextResponse.json({
      performers: performersRes.data || [],
      gigs: (gigsRes.data || []).map((g: any) => ({
        id: g.id,
        date: g.date,
        time_start: g.time_start,
        act_type_needed: g.act_type_needed,
        venueName: g.venue_profiles?.name || 'Venue',
        locality: g.venue_profiles?.locality || '',
      })),
    })
  } catch {
    return NextResponse.json({ performers: [], gigs: [] })
  }
}
