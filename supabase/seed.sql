-- StageSpot Seed Data
-- Test users, profiles, gigs, bookings, and reviews for development

-- ============================================================================
-- TEST USERS (created via Supabase Auth)
-- These are references - actual auth users created via API
-- ============================================================================

-- Admin user (to be created via Supabase Auth with app_metadata.role = 'admin')
-- Email: admin@stagespot.test
-- Password: TestPassword123!

-- Performer 1 - Approved
-- Email: performer1@stagespot.test
-- Password: TestPassword123!

-- Performer 2 - Pending
-- Email: performer2@stagespot.test
-- Password: TestPassword123!

-- Performer 3 - Rejected
-- Email: performer3@stagespot.test
-- Password: TestPassword123!

-- Venue 1 - Approved (Cafe in Connaught Place)
-- Email: venue1@stagespot.test
-- Password: TestPassword123!

-- Venue 2 - Approved (Bar in Hauz Khas)
-- Email: venue2@stagespot.test
-- Password: TestPassword123!

-- Venue 3 - Pending (Restaurant in Indiranagar)
-- Email: venue3@stagespot.test
-- Password: TestPassword123!

-- ============================================================================
-- INSERT PERFORMER PROFILES (linked to auth users by UUID)
-- ============================================================================

-- Note: Replace these UUIDs with actual user IDs from auth.users table
-- For now, using sample UUIDs that will be replaced with real ones

-- Approved Performer 1 - Jazz Musician
INSERT INTO performer_profiles (
  id, user_id, name, act_type, bio, social_media_links,
  portfolio_links, first_time_performing, verification_status,
  proof_of_work_link, rating, total_performances
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'Arjun Sharma',
  'Music',
  'Jazz saxophonist with 8 years of experience. Love playing fusion jazz and smooth jazz in intimate venues.',
  '{"instagram": "@arjun_sax", "other": "https://soundcloud.com/arjun-sax"}',
  ARRAY['https://youtube.com/watch?v=arjun1', 'https://soundcloud.com/arjun-sax/track1'],
  false,
  'approved',
  'https://stagespot-proof.s3.amazonaws.com/arjun_music_cert.pdf',
  4.8,
  12
);

-- Approved Performer 2 - Stand-up Comedian
INSERT INTO performer_profiles (
  id, user_id, name, act_type, bio, social_media_links,
  portfolio_links, first_time_performing, verification_status,
  proof_of_work_link, rating, total_performances
) VALUES (
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'Priya Patel',
  'Comedy',
  'Stand-up comedian specializing in observational humor about Delhi life. Regular at open mics.',
  '{"instagram": "@priya_comedy", "twitter": "@priya_patel"}',
  ARRAY['https://youtube.com/watch?v=priya_standup', 'https://youtube.com/watch?v=priya_standup2'],
  false,
  'approved',
  'https://stagespot-proof.s3.amazonaws.com/priya_comedy_cert.pdf',
  4.5,
  8
);

-- Approved Performer 3 - Poet (First-timer)
INSERT INTO performer_profiles (
  id, user_id, name, act_type, bio, social_media_links,
  portfolio_links, first_time_performing, verification_status,
  proof_of_work_link, rating, total_performances
) VALUES (
  'a0000000-0000-0000-0000-000000000003'::uuid,
  'b0000000-0000-0000-0000-000000000003'::uuid,
  'Vikram Gupta',
  'Poetry',
  'Spoken word poet writing about urban life, relationships, and social issues. Looking for my first performance!',
  '{"instagram": "@vikram_poetry", "other": "https://blog.vikram-poetry.com"}',
  ARRAY['https://blog.vikram-poetry.com/portfolio'],
  true,
  'approved',
  'https://stagespot-proof.s3.amazonaws.com/vikram_poetry_cert.pdf',
  0,
  0
);

-- Pending Performer 4 - Musician (awaiting approval)
INSERT INTO performer_profiles (
  id, user_id, name, act_type, bio, social_media_links,
  portfolio_links, first_time_performing, verification_status,
  proof_of_work_link, rating, total_performances
) VALUES (
  'a0000000-0000-0000-0000-000000000004'::uuid,
  'b0000000-0000-0000-0000-000000000004'::uuid,
  'Neha Singh',
  'Music',
  'Classical Indian vocalist trained in Hindustani music. Available for concerts and intimate performances.',
  '{"instagram": "@neha_classical", "other": "https://nehasingh.music"}',
  ARRAY['https://youtube.com/watch?v=neha_classical'],
  false,
  'pending',
  'https://stagespot-proof.s3.amazonaws.com/neha_music_cert.pdf',
  0,
  0
);

-- Rejected Performer 5 - Needs re-submission
INSERT INTO performer_profiles (
  id, user_id, name, act_type, bio, social_media_links,
  portfolio_links, first_time_performing, verification_status,
  proof_of_work_link, rejection_reason, rating, total_performances
) VALUES (
  'a0000000-0000-0000-0000-000000000005'::uuid,
  'b0000000-0000-0000-0000-000000000005'::uuid,
  'Rajesh Kumar',
  'Music',
  'Guitar player interested in performing at cafes.',
  '{"instagram": "@rajesh_guitar"}',
  ARRAY[]::text[],
  false,
  'rejected',
  '',
  'Please provide valid proof of experience (certificate, recording, or past performance documentation)',
  0,
  0
);

-- ============================================================================
-- INSERT VENUE PROFILES
-- ============================================================================

-- Approved Venue 1 - Cafe in Connaught Place
INSERT INTO venue_profiles (
  id, user_id, name, full_address, locality, city, coordinates,
  act_types_wanted, social_media_links, verification_status,
  proof_of_business_link, rating, total_gigs_hosted
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000011'::uuid,
  'The Coffee Lounge',
  '45 Connaught Place, New Delhi 110001',
  'Connaught Place',
  'New Delhi',
  '(28.6329, 77.1197)'::point,
  ARRAY['Music', 'Poetry'],
  '{"instagram": "@coffeeLoungeCP", "phone": "+91-9876543210"}',
  'approved',
  'https://stagespot-proof.s3.amazonaws.com/coffee_lounge_gst.pdf',
  4.7,
  6
);

-- Approved Venue 2 - Bar/Lounge in Hauz Khas
INSERT INTO venue_profiles (
  id, user_id, name, full_address, locality, city, coordinates,
  act_types_wanted, social_media_links, verification_status,
  proof_of_business_link, rating, total_gigs_hosted
) VALUES (
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000012'::uuid,
  'The Stage Hauz Khas',
  '123 Hauz Khas Village Lane, New Delhi 110016',
  'Hauz Khas',
  'New Delhi',
  '(28.5244, 77.1996)'::point,
  ARRAY['Music', 'Comedy', 'Poetry'],
  '{"instagram": "@stageHauzKhas", "website": "www.stagehavzkas.com", "phone": "+91-9876543211"}',
  'approved',
  'https://stagespot-proof.s3.amazonaws.com/stage_hk_license.pdf',
  4.6,
  9
);

-- Pending Venue 3 - Restaurant in Karol Bagh
INSERT INTO venue_profiles (
  id, user_id, name, full_address, locality, city, coordinates,
  act_types_wanted, social_media_links, verification_status,
  proof_of_business_link, rating, total_gigs_hosted
) VALUES (
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'b0000000-0000-0000-0000-000000000013'::uuid,
  'Dil Se Restaurant',
  '78 Karol Bagh, New Delhi 110005',
  'Karol Bagh',
  'New Delhi',
  '(28.6500, 77.1800)'::point,
  ARRAY['Music', 'Comedy'],
  '{"instagram": "@dilseRestaurant", "phone": "+91-9876543212"}',
  'pending',
  'https://stagespot-proof.s3.amazonaws.com/dilse_reg.pdf',
  0,
  0
);

-- ============================================================================
-- INSERT GIGS (Performance opportunities)
-- ============================================================================

-- Open Gig 1 - Jazz night at Coffee Lounge
INSERT INTO gigs (
  venue_id, date, time_start, time_end, act_type_needed, notes, status
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  '2026-08-05',
  '19:00:00',
  '21:00:00',
  'Music',
  'Looking for a smooth jazz or acoustic artist. Intimate audience of 20-30 people. Light refreshments provided.',
  'open'
);

-- Open Gig 2 - Comedy night at The Stage Hauz Khas
INSERT INTO gigs (
  venue_id, date, time_start, time_end, act_type_needed, notes, status
) VALUES (
  'c0000000-0000-0000-0000-000000000002'::uuid,
  '2026-08-08',
  '20:00:00',
  '22:00:00',
  'Comedy',
  'Stand-up comedy night. 30-45 minutes of material. Full bar available.',
  'open'
);

-- Open Gig 3 - Poetry evening at Coffee Lounge
INSERT INTO gigs (
  venue_id, date, time_start, time_end, act_type_needed, notes, status
) VALUES (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  '2026-08-12',
  '18:00:00',
  '20:00:00',
  'Poetry',
  'Spoken word poetry night. Casual, intimate setting. Maximum 10 poets.',
  'open'
);

-- Filled Gig 1 - Past Jazz night (for demo booking)
INSERT INTO gigs (
  venue_id, date, time_start, time_end, act_type_needed, notes, status
) VALUES (
  'c0000000-0000-0000-0000-000000000002'::uuid,
  '2026-07-20',
  '19:00:00',
  '21:00:00',
  'Music',
  'Jazz night featuring local musicians.',
  'filled'
);

-- ============================================================================
-- INSERT BOOKINGS (Applications/Reservations)
-- ============================================================================

-- Booking 1 - Confirmed booking (Arjun applied to jazz night)
INSERT INTO bookings (
  id, gig_id, performer_id, venue_id, status,
  performer_rating, performer_comment, performer_tags,
  venue_rating, venue_comment, venue_tags
) VALUES (
  'd0000000-0000-0000-0000-000000000001'::uuid,
  (SELECT id FROM gigs WHERE act_type_needed = 'Music' AND date = '2026-07-20' LIMIT 1),
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'confirmed',
  5,
  'Great venue, wonderful audience energy!',
  ARRAY['professional', 'great energy', 'would work with again'],
  5,
  'Arjun was amazing! His saxophone playing was perfect for our venue.',
  ARRAY['professional', 'followed through', 'would invite again']
);

-- Booking 2 - Completed booking (Past performance)
INSERT INTO bookings (
  id, gig_id, performer_id, venue_id, status,
  performer_rating, performer_comment, performer_tags,
  venue_rating, venue_comment, venue_tags
) VALUES (
  'd0000000-0000-0000-0000-000000000002'::uuid,
  (SELECT id FROM gigs WHERE act_type_needed = 'Music' AND date = '2026-07-20' LIMIT 1),
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'completed',
  4,
  'Fun crowd, will come back!',
  ARRAY['respectful', 'great energy'],
  4,
  'Priya kept the audience laughing. Very professional.',
  ARRAY['professional', 'followed through']
);

-- Booking 3 - Requested booking (Pending application)
INSERT INTO bookings (
  gig_id, performer_id, venue_id, status
) VALUES (
  (SELECT id FROM gigs WHERE act_type_needed = 'Music' AND date = '2026-08-05' LIMIT 1),
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'requested'
);

-- Booking 4 - Accepted booking
INSERT INTO bookings (
  gig_id, performer_id, venue_id, status
) VALUES (
  (SELECT id FROM gigs WHERE act_type_needed = 'Poetry' AND date = '2026-08-12' LIMIT 1),
  'a0000000-0000-0000-0000-000000000003'::uuid,
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'accepted'
);

-- Booking 5 - Declined booking
INSERT INTO bookings (
  gig_id, performer_id, venue_id, status
) VALUES (
  (SELECT id FROM gigs WHERE act_type_needed = 'Comedy' AND date = '2026-08-08' LIMIT 1),
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'declined'
);

-- ============================================================================
-- INSERT REVIEWS (Feedback from completed bookings)
-- ============================================================================

-- Review 1 - Performer reviewing venue
INSERT INTO reviews (
  booking_id, from_user_id, to_user_id, rating, comment, tags
) VALUES (
  'd0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000012'::uuid,
  5,
  'Amazing venue! Perfect sound system, supportive audience, and the staff was very helpful.',
  ARRAY['great sound', 'wonderful audience', 'professional']
);

-- Review 2 - Venue reviewing performer
INSERT INTO reviews (
  booking_id, from_user_id, to_user_id, rating, comment, tags
) VALUES (
  'd0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000012'::uuid,
  'b0000000-0000-0000-0000-000000000001'::uuid,
  5,
  'Arjun was punctual, professional, and absolutely captivated our audience. Highly recommend!',
  ARRAY['punctual', 'professional', 'captivating']
);

-- Review 3 - Performer reviewing venue
INSERT INTO reviews (
  booking_id, from_user_id, to_user_id, rating, comment, tags
) VALUES (
  'd0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000012'::uuid,
  4,
  'Good venue with fun atmosphere. Would love to perform here again.',
  ARRAY['good atmosphere', 'fun crowd']
);

-- Review 4 - Venue reviewing performer
INSERT INTO reviews (
  booking_id, from_user_id, to_user_id, rating, comment, tags
) VALUES (
  'd0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000012'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  4,
  'Priya brought great energy to the show. Our guests loved her comedy.',
  ARRAY['great energy', 'funny', 'professional']
);

-- ============================================================================
-- INSERT USER ROLES (tracking performer/venue/admin roles)
-- ============================================================================

-- Admin user role
-- INSERT INTO user_roles (user_id, role) VALUES (
--   'b0000000-0000-0000-0000-000000000099'::uuid,
--   'admin'
-- );

-- Performer roles
INSERT INTO user_roles (user_id, role) VALUES
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'performer'),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 'performer'),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'performer'),
  ('b0000000-0000-0000-0000-000000000004'::uuid, 'performer'),
  ('b0000000-0000-0000-0000-000000000005'::uuid, 'performer');

-- Venue roles
INSERT INTO user_roles (user_id, role) VALUES
  ('b0000000-0000-0000-0000-000000000011'::uuid, 'venue'),
  ('b0000000-0000-0000-0000-000000000012'::uuid, 'venue'),
  ('b0000000-0000-0000-0000-000000000013'::uuid, 'venue');
