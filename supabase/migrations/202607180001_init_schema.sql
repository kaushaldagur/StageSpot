-- StageSpot Database Schema
-- Initialization migration with all core tables and indexes

-- User roles table (tracking role per user, though role also lives in auth.user_metadata)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('performer', 'venue', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performer profiles
CREATE TABLE IF NOT EXISTS performer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  act_type VARCHAR(50) NOT NULL,
  bio TEXT,
  profile_picture_url VARCHAR(500),
  social_media_links JSONB,
  portfolio_links TEXT[],
  first_time_performing BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 1) DEFAULT 0,
  total_performances INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_of_work_link VARCHAR(500),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue profiles
CREATE TABLE IF NOT EXISTS venue_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  full_address TEXT NOT NULL,
  city VARCHAR(100),
  locality VARCHAR(100),
  coordinates POINT,
  act_types_wanted TEXT[],
  venue_photos TEXT[],
  venue_video_link VARCHAR(500),
  social_media_links JSONB,
  rating NUMERIC(3, 1) DEFAULT 0,
  total_gigs_hosted INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_of_business_link VARCHAR(500),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gigs (performance opportunities posted by venues)
CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venue_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_start TIME,
  time_end TIME,
  act_type_needed VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'filled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings (applications/requests from performers to gigs)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  performer_id UUID NOT NULL REFERENCES performer_profiles(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venue_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'confirmed', 'completed', 'declined', 'cancelled')),
  performer_rating NUMERIC(2, 1),
  performer_comment TEXT,
  performer_tags TEXT[],
  venue_rating NUMERIC(2, 1),
  venue_comment TEXT,
  venue_tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews (feedback records, separate from booking ratings)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  rating NUMERIC(2, 1) NOT NULL,
  comment TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_performer_profiles_user_id ON performer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_performer_profiles_verification ON performer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_user_id ON venue_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_verification ON venue_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_gigs_venue_id ON gigs(venue_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_bookings_performer_id ON bookings(performer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_gig_id ON bookings(gig_id);
CREATE INDEX IF NOT EXISTS idx_reviews_from_user_id ON reviews(from_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_to_user_id ON reviews(to_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
