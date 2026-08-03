-- PRD 5.4: location structure is State, City, Locality, coordinates.
-- Launch region is Delhi, so existing rows default to 'Delhi'.
ALTER TABLE venue_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Delhi';
