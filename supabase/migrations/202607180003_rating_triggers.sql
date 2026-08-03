-- StageSpot Rating Aggregation Triggers
-- Automatically updates performer and venue rating averages + counts when reviews are created/updated

-- ============================================================================
-- FUNCTION: Update performer profile rating and total performances
-- ============================================================================

CREATE OR REPLACE FUNCTION update_performer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performer_profiles
  SET
    rating = (
      SELECT COALESCE(AVG(CAST(rating AS NUMERIC)), 0)
      FROM reviews
      WHERE to_user_id = (
        SELECT user_id FROM performer_profiles WHERE id = NEW.performer_id
      )
    )::numeric(3,1),
    total_performances = (
      SELECT COUNT(*)
      FROM bookings
      WHERE performer_id = NEW.performer_id AND status = 'completed'
    )
  WHERE id = NEW.performer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Update venue profile rating and total gigs hosted
-- ============================================================================

CREATE OR REPLACE FUNCTION update_venue_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE venue_profiles
  SET
    rating = (
      SELECT COALESCE(AVG(CAST(rating AS NUMERIC)), 0)
      FROM reviews
      WHERE to_user_id = (
        SELECT user_id FROM venue_profiles WHERE id = NEW.venue_id
      )
    )::numeric(3,1),
    total_gigs_hosted = (
      SELECT COUNT(*)
      FROM bookings
      WHERE venue_id = NEW.venue_id AND status = 'completed'
    )
  WHERE id = NEW.venue_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: Fire when a review is created or updated
-- ============================================================================

DROP TRIGGER IF EXISTS trg_update_performer_rating ON reviews;
CREATE TRIGGER trg_update_performer_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_performer_rating();

DROP TRIGGER IF EXISTS trg_update_venue_rating ON reviews;
CREATE TRIGGER trg_update_venue_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_venue_rating();

-- ============================================================================
-- FUNCTION: Update total_performances when a booking completes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_total_performances_on_booking_complete()
RETURNS TRIGGER AS $$
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

DROP TRIGGER IF EXISTS trg_update_counts_on_booking_complete ON bookings;
CREATE TRIGGER trg_update_counts_on_booking_complete
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_total_performances_on_booking_complete();
