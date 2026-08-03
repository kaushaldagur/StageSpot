-- Profile picture storage (PRD Section 7: the profile picture is the only
-- direct file upload; everything else is stored as links).

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pictures', 'profile_pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view profile pictures (public bucket)
DROP POLICY IF EXISTS "Public read profile pictures" ON storage.objects;
CREATE POLICY "Public read profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_pictures');

-- Authenticated users can upload/replace their own pictures
DROP POLICY IF EXISTS "Authenticated upload profile pictures" ON storage.objects;
CREATE POLICY "Authenticated upload profile pictures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile_pictures' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update own profile pictures" ON storage.objects;
CREATE POLICY "Authenticated update own profile pictures"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile_pictures' AND auth.uid() = owner);
