import { supabase } from '@/lib/supabase'
import { PerformerProfile, VenueProfile, Gig, Booking, Review, VerificationStatus } from '@/types'

// Performer operations
export async function getPerformerProfile(userId: string) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as PerformerProfile
}

export async function createPerformerProfile(profile: Omit<PerformerProfile, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data as PerformerProfile
}

export async function updatePerformerProfile(userId: string, updates: Partial<PerformerProfile>) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as PerformerProfile
}

export async function getPerformerProfileById(id: string) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as PerformerProfile
}

// Venue operations
export async function getVenueProfile(userId: string) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as VenueProfile
}

export async function createVenueProfile(profile: Omit<VenueProfile, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data as VenueProfile
}

export async function updateVenueProfile(userId: string, updates: Partial<VenueProfile>) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as VenueProfile
}

export async function getVenueProfileById(id: string) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as VenueProfile
}

// Gig operations
export async function getGig(gigId: string) {
  const { data, error } = await supabase
    .from('gigs')
    .select('*')
    .eq('id', gigId)
    .single()

  if (error) throw error
  return data as Gig
}

export async function createGig(gig: Omit<Gig, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('gigs')
    .insert([gig])
    .select()
    .single()

  if (error) throw error
  return data as Gig
}

export async function getOpenGigs(limit = 50) {
  const { data, error } = await supabase
    .from('gigs')
    .select('*, venue_profiles(name, locality, city, coordinates)')
    .eq('status', 'open')
    .limit(limit)

  if (error) throw error
  return data as (Gig & {
    venue_profiles: { name: string; locality: string; city: string; coordinates: string | null } | null
  })[]
}

export async function getVenueGigs(venueId: string) {
  const { data, error } = await supabase
    .from('gigs')
    .select('*')
    .eq('venue_id', venueId)

  if (error) throw error
  return data as Gig[]
}

export async function getOpenGigsCount() {
  const { count, error } = await supabase
    .from('gigs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  if (error) throw error
  return count || 0
}

// Booking operations
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

export async function getBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (error) throw error
  return data as Booking
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

// Role identification: the user_roles table is the database source of truth
// (auth metadata is only a fallback for accounts created before the table
// was populated)
export async function getUserRole(userId: string): Promise<'performer' | 'venue' | 'admin' | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return (data?.role as 'performer' | 'venue' | 'admin') || null
}

// Self-registers the signed-in user's role row if missing. RLS only allows
// performer/venue here — admin rows are created server-side.
export async function ensureUserRole(userId: string, role: 'performer' | 'venue') {
  const existing = await getUserRole(userId).catch(() => null)
  if (existing) return existing

  const { error } = await supabase.from('user_roles').insert([{ user_id: userId, role }])
  if (error && error.code !== '23505') throw error
  return role
}

// Bookings reference profile ids, not auth user ids
export async function getUserProfileIds(userId: string) {
  const [performerRes, venueRes] = await Promise.all([
    supabase.from('performer_profiles').select('id').eq('user_id', userId),
    supabase.from('venue_profiles').select('id').eq('user_id', userId),
  ])

  if (performerRes.error) throw performerRes.error
  if (venueRes.error) throw venueRes.error

  return {
    performerIds: (performerRes.data || []).map(p => p.id as string),
    venueIds: (venueRes.data || []).map(v => v.id as string),
  }
}

export async function getUserBookings(userId: string) {
  const { performerIds, venueIds } = await getUserProfileIds(userId)

  const conditions = [
    ...performerIds.map(id => `performer_id.eq.${id}`),
    ...venueIds.map(id => `venue_id.eq.${id}`),
  ]
  if (conditions.length === 0) return [] as Booking[]

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .or(conditions.join(','))
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Booking[]
}

// "Already worked with" indicator (PRD 5.2/5.3): true when a completed
// booking exists between any of the performer profiles and venue profiles
export async function hasCompletedBookingBetween(performerProfileIds: string[], venueProfileIds: string[]) {
  if (performerProfileIds.length === 0 || venueProfileIds.length === 0) return false

  const { count, error } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('performer_id', performerProfileIds)
    .in('venue_id', venueProfileIds)
    .eq('status', 'completed')

  if (error) throw error
  return (count || 0) > 0
}

// Review operations
export async function createReview(review: Omit<Review, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single()

  if (error) throw error
  return data as Review
}

export async function getReviewsForUser(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('to_user_id', userId)

  if (error) throw error
  return data as Review[]
}

// Search operations
export async function searchPerformers(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .select('*')
    .eq('verification_status', 'approved')
    .ilike('name', `%${query}%`)
    .limit(limit)

  if (error) throw error
  return data as PerformerProfile[]
}

export async function getPerformersByType(actType: string, limit = 20) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .select('*')
    .eq('verification_status', 'approved')
    .eq('act_type', actType)
    .limit(limit)

  if (error) throw error
  return data as PerformerProfile[]
}

export async function getFeaturedPerformers(limit = 10) {
  const { data, error } = await supabase
    .from('performer_profiles')
    .select('*')
    .eq('verification_status', 'approved')
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as PerformerProfile[]
}

// Admin operations
export async function getPendingProfiles() {
  // PRD 5.8: admin reviews performers' portfolio + social media presence,
  // and venues' proof of business + address details
  const { data: performers, error: pError } = await supabase
    .from('performer_profiles')
    .select('id, user_id, name, act_type, bio, verification_status, proof_of_work_link, portfolio_links, social_media_links, created_at')
    .eq('verification_status', 'pending')

  const { data: venues, error: vError } = await supabase
    .from('venue_profiles')
    .select('id, user_id, name, verification_status, proof_of_business_link, full_address, locality, city, social_media_links, created_at')
    .eq('verification_status', 'pending')

  if (pError || vError) throw pError || vError

  return {
    performers: performers as any[],
    venues: venues as any[],
  }
}

// PRD 5.8: admin can view all gigs, bookings, and reviews on the platform
export async function getAllGigsAdmin() {
  const { data, error } = await supabase
    .from('gigs')
    .select('*, venue_profiles(name)')
    .order('date', { ascending: false })

  if (error) throw error
  return data as (Gig & { venue_profiles: { name: string } | null })[]
}

export async function getAllBookingsAdmin() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, performer_profiles(name), venue_profiles(name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Booking & {
    performer_profiles: { name: string } | null
    venue_profiles: { name: string } | null
  })[]
}

export async function getAllReviewsAdmin() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Review[]
}

export async function updateVerificationStatus(
  table: 'performer_profiles' | 'venue_profiles',
  id: string,
  status: VerificationStatus,
  reason?: string
) {
  const updates: Record<string, any> = { verification_status: status }
  if (reason) {
    updates.rejection_reason = reason
  }

  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as PerformerProfile | VenueProfile
}
