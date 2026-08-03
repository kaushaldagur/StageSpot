-- Fix review rating triggers
--
-- The previous trigger functions were attached to the reviews table but
-- referenced NEW.performer_id / NEW.venue_id, columns that do not exist on
-- reviews. Every review INSERT failed with:
--   record "new" has no field "performer_id"
--
-- They are replaced with a single function keyed on reviews.to_user_id.
-- Both functions run as SECURITY DEFINER: the reviewer updates the OTHER
-- party's profile aggregates, which their own RLS permissions would block.

DROP TRIGGER IF EXISTS trg_update_performer_rating ON reviews;
DROP TRIGGER IF EXISTS trg_update_venue_rating ON reviews;
DROP FUNCTION IF EXISTS update_performer_rating();
DROP FUNCTION IF EXISTS update_venue_rating();

CREATE OR REPLACE FUNCTION update_profile_rating_from_review()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE performer_profiles
  SET rating = (
    SELECT COALESCE(AVG(CAST(rating AS NUMERIC)), 0)
    FROM reviews
    WHERE to_user_id = NEW.to_user_id
  )::numeric(3,1)
  WHERE user_id = NEW.to_user_id;

  UPDATE venue_profiles
  SET rating = (
    SELECT COALESCE(AVG(CAST(rating AS NUMERIC)), 0)
    FROM reviews
    WHERE to_user_id = NEW.to_user_id
  )::numeric(3,1)
  WHERE user_id = NEW.to_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_profile_rating_from_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating_from_review();

-- The booking-completion counter trigger also updates both parties' profiles,
-- so it needs SECURITY DEFINER as well (previously the update to the other
-- party's row was silently blocked by RLS).
CREATE OR REPLACE FUNCTION update_total_performances_on_booking_complete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE performer_profiles
    SET total_performances = (
      SELECT COUNT(*)
      FROM bookings
      WHERE performer_id = NEW.performer_id AND status = 'completed'
    )
    WHERE id = NEW.performer_id;

    UPDATE venue_profiles
    SET total_gigs_hosted = (
      SELECT COUNT(*)
      FROM bookings
      WHERE venue_id = NEW.venue_id AND status = 'completed'
    )
    WHERE id = NEW.venue_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
