-- StageSpot RLS (Row Level Security) Policies
-- Controls data access: owners can read/write own profiles, approved profiles visible to all

-- Enable RLS on all tables
ALTER TABLE performer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PERFORMER_PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile (for edit page)
CREATE POLICY "Users can view own performer profile"
  ON performer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Any authenticated user can view approved performer profiles (for discovery)
CREATE POLICY "Anyone can view approved performer profiles"
  ON performer_profiles
  FOR SELECT
  USING (verification_status = 'approved' AND auth.role() = 'authenticated');

-- Admin can view all profiles for verification queue
CREATE POLICY "Admin can view all performer profiles"
  ON performer_profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- Users can create their own profile
CREATE POLICY "Users can create own performer profile"
  ON performer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own performer profile"
  ON performer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can update any profile (for approval/rejection)
CREATE POLICY "Admin can update any performer profile"
  ON performer_profiles
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- ============================================================================
-- VENUE_PROFILES POLICIES (same as performer)
-- ============================================================================

CREATE POLICY "Users can view own venue profile"
  ON venue_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved venue profiles"
  ON venue_profiles
  FOR SELECT
  USING (verification_status = 'approved' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can view all venue profiles"
  ON venue_profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Users can create own venue profile"
  ON venue_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own venue profile"
  ON venue_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update any venue profile"
  ON venue_profiles
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- ============================================================================
-- GIGS POLICIES
-- ============================================================================

-- Venues can view and post their own gigs
CREATE POLICY "Venues can manage own gigs"
  ON gigs
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

-- Approved performers can view open gigs
CREATE POLICY "Approved performers can view open gigs"
  ON gigs
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'open'
    AND venue_id IN (
      SELECT id FROM venue_profiles WHERE verification_status = 'approved'
    )
  );

-- Admin can view all gigs
CREATE POLICY "Admin can view all gigs"
  ON gigs
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- ============================================================================
-- BOOKINGS POLICIES
-- ============================================================================

-- Only the performer and venue involved in a booking can view/update it
CREATE POLICY "Booking parties can manage bookings"
  ON bookings
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND (
      venue_id IN (SELECT id FROM venue_profiles WHERE user_id = auth.uid())
      OR
      performer_id IN (SELECT id FROM performer_profiles WHERE user_id = auth.uid())
    )
  );

-- Approved performers can create bookings (apply to gigs)
CREATE POLICY "Approved performers can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND performer_id IN (
      SELECT id FROM performer_profiles
      WHERE user_id = auth.uid() AND verification_status = 'approved'
    )
  );

-- Admin can view all bookings
CREATE POLICY "Admin can view all bookings"
  ON bookings
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Only booking parties can create reviews
CREATE POLICY "Booking parties can create reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      from_user_id = auth.uid()
      AND booking_id IN (
        SELECT id FROM bookings
        WHERE (
          performer_id IN (SELECT id FROM performer_profiles WHERE user_id = auth.uid())
          OR venue_id IN (SELECT id FROM venue_profiles WHERE user_id = auth.uid())
        )
        AND status = 'completed'
      )
    )
  );

-- Anyone can view reviews (they're public)
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- USER_ROLES POLICIES
-- ============================================================================

-- Users can view their own role
CREATE POLICY "Users can view own role"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only admin can manage roles
CREATE POLICY "Admin can manage all roles"
  ON user_roles
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
      OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
