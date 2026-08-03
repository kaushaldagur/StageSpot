-- Make the user_roles table the database source of truth for identifying
-- user type (performer / venue / admin), instead of relying on auth metadata.
--
-- Previously RLS was disabled on user_roles entirely (to break a policy
-- recursion), which left the table world-writable through the API — anyone
-- could have inserted themselves as admin. Re-enable RLS with simple,
-- non-recursive policies and route all admin checks through a
-- SECURITY DEFINER helper.

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Each user can read their own role row
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can self-register as performer or venue, never admin.
-- Admin rows are created server-side only (service key).
DROP POLICY IF EXISTS "Users can self-register non-admin role" ON user_roles;
CREATE POLICY "Users can self-register non-admin role"
  ON user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role IN ('performer', 'venue'));

-- No UPDATE/DELETE policies: role changes go through the service key only.

-- Admin check helper. SECURITY DEFINER reads user_roles without triggering
-- its RLS, so there is no recursion. Falls back to app_metadata for any
-- account granted admin the old way.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- Rewrite admin policies to use the helper (previously app_metadata only)
DROP POLICY IF EXISTS "Admin can view all performer profiles" ON performer_profiles;
CREATE POLICY "Admin can view all performer profiles"
  ON performer_profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can update any performer profile" ON performer_profiles;
CREATE POLICY "Admin can update any performer profile"
  ON performer_profiles FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admin can view all venue profiles" ON venue_profiles;
CREATE POLICY "Admin can view all venue profiles"
  ON venue_profiles FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can update any venue profile" ON venue_profiles;
CREATE POLICY "Admin can update any venue profile"
  ON venue_profiles FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admin can view all gigs" ON gigs;
CREATE POLICY "Admin can view all gigs"
  ON gigs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
CREATE POLICY "Admin can view all bookings"
  ON bookings FOR SELECT USING (is_admin());
