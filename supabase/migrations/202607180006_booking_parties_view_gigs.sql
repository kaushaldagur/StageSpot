-- Booking parties must be able to read the gig behind their booking even
-- after it leaves 'open' status (filled/closed). Without this, a performer's
-- completed booking cannot resolve its gig: My Bookings and the booking
-- detail page fail wholesale.

DROP POLICY IF EXISTS "Booking parties can view their gigs" ON gigs;
CREATE POLICY "Booking parties can view their gigs"
  ON gigs
  FOR SELECT
  USING (
    id IN (
      SELECT gig_id FROM bookings
      WHERE performer_id IN (SELECT id FROM performer_profiles WHERE user_id = auth.uid())
         OR venue_id IN (SELECT id FROM venue_profiles WHERE user_id = auth.uid())
    )
  );
