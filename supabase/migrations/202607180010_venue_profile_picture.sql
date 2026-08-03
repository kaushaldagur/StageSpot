-- PRD Section 7: profile picture is a direct upload for user profiles.
-- performer_profiles already has it; venues were missing it.
ALTER TABLE venue_profiles ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500);
