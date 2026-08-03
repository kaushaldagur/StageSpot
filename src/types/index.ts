export type UserRole = 'performer' | 'venue' | 'admin'

export type BookingStatus = 'requested' | 'accepted' | 'confirmed' | 'completed' | 'declined' | 'cancelled'

export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface PerformerProfile {
  id: string
  user_id: string
  name: string
  act_type: string // music, comedy, poetry, other
  bio: string
  profile_picture_url: string
  social_media_links: Record<string, string> // instagram, youtube, etc
  portfolio_links: string[] // Links to videos, recordings, photos
  first_time_performing: boolean
  rating: number // Average rating 1-5
  total_performances: number
  verification_status: VerificationStatus
  proof_of_work_link: string
  created_at: string
  updated_at: string
}

export interface VenueProfile {
  id: string
  user_id: string
  name: string
  full_address: string
  city: string
  locality: string
  coordinates: { lat: number; lng: number }
  act_types_wanted: string[]
  venue_photos: string[] // Links to photos
  venue_video_link: string
  social_media_links: Record<string, string>
  rating: number
  total_gigs_hosted: number
  verification_status: VerificationStatus
  proof_of_business_link: string
  created_at: string
  updated_at: string
}

export interface Gig {
  id: string
  venue_id: string
  date: string
  time_start: string
  time_end: string
  act_type_needed: string
  notes: string
  status: 'open' | 'filled'
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  gig_id: string
  performer_id: string
  venue_id: string
  status: BookingStatus
  performer_rating: number | null
  performer_comment: string | null
  performer_tags: string[]
  venue_rating: number | null
  venue_comment: string | null
  venue_tags: string[]
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  from_user_id: string
  to_user_id: string
  rating: number
  comment: string
  tags: string[]
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  role?: UserRole
}
