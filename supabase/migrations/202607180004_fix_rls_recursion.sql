-- Fix RLS infinite recursion issue
-- The admin check policies were creating infinite loops by checking user_roles

-- Disable RLS on user_roles (we use app_metadata instead)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Drop old problematic admin policies
DROP POLICY IF EXISTS "Admin can view all performer profiles" ON performer_profiles;
DROP POLICY IF EXISTS "Admin can update any performer profile" ON performer_profiles;
DROP POLICY IF EXISTS "Admin can view all venue profiles" ON venue_profiles;
DROP POLICY IF EXISTS "Admin can update any venue profile" ON venue_profiles;
DROP POLICY IF EXISTS "Admin can view all gigs" ON gigs;
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage all roles" ON user_roles;

-- New admin policies using app_metadata (no recursion)
CREATE POLICY "Admin can view all performer profiles"
  ON performer_profiles
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update any performer profile"
  ON performer_profiles
  FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can view all venue profiles"
  ON venue_profiles
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update any venue profile"
  ON venue_profiles
  FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can view all gigs"
  ON gigs
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can view all bookings"
  ON bookings
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Fix gig visibility
DROP POLICY IF EXISTS "Approved performers can view open gigs" ON gigs;
CREATE POLICY "Approved performers can view open gigs"
  ON gigs
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'open'
  );

-- Fix booking visibility
DROP POLICY IF EXISTS "Booking parties can manage bookings" ON bookings;
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

-- Fix reviews visibility
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Booking parties can create reviews" ON reviews;
CREATE POLICY "Booking parties can create reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND from_user_id = auth.uid()
  );
