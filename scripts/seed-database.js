#!/usr/bin/env node

/**
 * StageSpot Database Seeding Script
 *
 * Usage:
 * 1. First, create all auth users in Supabase dashboard (see SETUP_GUIDE.md)
 * 2. Get the UUIDs from Supabase Auth dashboard
 * 3. Run: node scripts/seed-database.js <performer1_uuid> <performer2_uuid> ... <venue1_uuid> ...
 *
 * Or set environment variables:
 * PERFORMER1_UUID, PERFORMER2_UUID, ..., VENUE1_UUID, VENUE2_UUID, VENUE3_UUID
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test UUIDs - replace with actual user IDs from Supabase Auth
const TEST_UUIDS = {
  // Performers
  performer1: process.argv[2] || process.env.PERFORMER1_UUID || 'b0000000-0000-0000-0000-000000000001',
  performer2: process.argv[3] || process.env.PERFORMER2_UUID || 'b0000000-0000-0000-0000-000000000002',
  performer3: process.argv[4] || process.env.PERFORMER3_UUID || 'b0000000-0000-0000-0000-000000000003',
  performer4: process.argv[5] || process.env.PERFORMER4_UUID || 'b0000000-0000-0000-0000-000000000004',
  performer5: process.argv[6] || process.env.PERFORMER5_UUID || 'b0000000-0000-0000-0000-000000000005',
  // Venues
  venue1: process.argv[7] || process.env.VENUE1_UUID || 'b0000000-0000-0000-0000-000000000011',
  venue2: process.argv[8] || process.env.VENUE2_UUID || 'b0000000-0000-0000-0000-000000000012',
  venue3: process.argv[9] || process.env.VENUE3_UUID || 'b0000000-0000-0000-0000-000000000013',
};

console.log('🌱 StageSpot Database Seeding');
console.log('================================\n');

async function seedDatabase() {
  try {
    // Seed Performer Profiles
    console.log('📝 Seeding Performer Profiles...');
    const performerProfiles = [
      {
        user_id: TEST_UUIDS.performer1,
        name: 'Arjun Sharma',
        act_type: 'Music',
        bio: 'Jazz saxophonist with 8 years of experience. Love playing fusion jazz and smooth jazz in intimate venues.',
        social_media_links: { instagram: '@arjun_sax', other: 'https://soundcloud.com/arjun-sax' },
        portfolio_links: ['https://youtube.com/watch?v=arjun1', 'https://soundcloud.com/arjun-sax/track1'],
        first_time_performing: false,
        verification_status: 'approved',
        proof_of_work_link: 'https://stagespot-proof.s3.amazonaws.com/arjun_music_cert.pdf',
        rating: 4.8,
        total_performances: 12,
      },
      {
        user_id: TEST_UUIDS.performer2,
        name: 'Priya Patel',
        act_type: 'Comedy',
        bio: 'Stand-up comedian specializing in observational humor about Delhi life. Regular at open mics.',
        social_media_links: { instagram: '@priya_comedy', twitter: '@priya_patel' },
        portfolio_links: ['https://youtube.com/watch?v=priya_standup', 'https://youtube.com/watch?v=priya_standup2'],
        first_time_performing: false,
        verification_status: 'approved',
        proof_of_work_link: 'https://stagespot-proof.s3.amazonaws.com/priya_comedy_cert.pdf',
        rating: 4.5,
        total_performances: 8,
      },
      {
        user_id: TEST_UUIDS.performer3,
        name: 'Vikram Gupta',
        act_type: 'Poetry',
        bio: 'Spoken word poet writing about urban life, relationships, and social issues. Looking for my first performance!',
        social_media_links: { instagram: '@vikram_poetry', other: 'https://blog.vikram-poetry.com' },
        portfolio_links: ['https://blog.vikram-poetry.com/portfolio'],
        first_time_performing: true,
        verification_status: 'approved',
        proof_of_work_link: 'https://stagespot-proof.s3.amazonaws.com/vikram_poetry_cert.pdf',
        rating: 0,
        total_performances: 0,
      },
      {
        user_id: TEST_UUIDS.performer4,
        name: 'Neha Singh',
        act_type: 'Music',
        bio: 'Classical Indian vocalist trained in Hindustani music. Available for concerts and intimate performances.',
        social_media_links: { instagram: '@neha_classical', other: 'https://nehasingh.music' },
        portfolio_links: ['https://youtube.com/watch?v=neha_classical'],
        first_time_performing: false,
        verification_status: 'pending',
        proof_of_work_link: 'https://stagespot-proof.s3.amazonaws.com/neha_music_cert.pdf',
        rating: 0,
        total_performances: 0,
      },
      {
        user_id: TEST_UUIDS.performer5,
        name: 'Rajesh Kumar',
        act_type: 'Music',
        bio: 'Guitar player interested in performing at cafes.',
        social_media_links: { instagram: '@rajesh_guitar' },
        portfolio_links: [],
        first_time_performing: false,
        verification_status: 'rejected',
        rejection_reason: 'Please provide valid proof of experience (certificate, recording, or past performance documentation)',
        proof_of_work_link: '',
        rating: 0,
        total_performances: 0,
      },
    ];

    for (const profile of performerProfiles) {
      const { error } = await supabase
        .from('performer_profiles')
        .insert([profile]);
      if (error) throw error;
      console.log(`  ✓ ${profile.name}`);
    }

    // Seed Venue Profiles
    console.log('\n📍 Seeding Venue Profiles...');
    const venueProfiles = [
      {
        user_id: TEST_UUIDS.venue1,
        name: 'The Coffee Lounge',
        full_address: '45 Connaught Place, New Delhi 110001',
        locality: 'Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        coordinates: '(28.6329, 77.2167)',
        act_types_wanted: ['Music', 'Poetry'],
        social_media_links: { instagram: '@coffeeLoungeCP', phone: '+91-9876543210' },
        verification_status: 'approved',
        proof_of_business_link: 'https://stagespot-proof.s3.amazonaws.com/coffee_lounge_gst.pdf',
        rating: 4.7,
        total_gigs_hosted: 6,
      },
      {
        user_id: TEST_UUIDS.venue2,
        name: 'The Stage Hauz Khas',
        full_address: '123 Hauz Khas Village Lane, New Delhi 110016',
        locality: 'Hauz Khas',
        city: 'New Delhi',
        state: 'Delhi',
        coordinates: '(28.5494, 77.2001)',
        act_types_wanted: ['Music', 'Comedy', 'Poetry'],
        social_media_links: { instagram: '@stageHauzKhas', website: 'www.stagehavzkas.com', phone: '+91-9876543211' },
        verification_status: 'approved',
        proof_of_business_link: 'https://stagespot-proof.s3.amazonaws.com/stage_hk_license.pdf',
        rating: 4.6,
        total_gigs_hosted: 9,
      },
      {
        user_id: TEST_UUIDS.venue3,
        name: 'Dil Se Restaurant',
        full_address: '78 Karol Bagh, New Delhi 110005',
        locality: 'Karol Bagh',
        city: 'New Delhi',
        state: 'Delhi',
        coordinates: '(28.6505, 77.1819)',
        act_types_wanted: ['Music', 'Comedy'],
        social_media_links: { instagram: '@dilseRestaurant', phone: '+91-9876543212' },
        verification_status: 'pending',
        proof_of_business_link: 'https://stagespot-proof.s3.amazonaws.com/dilse_reg.pdf',
        rating: 0,
        total_gigs_hosted: 0,
      },
    ];

    for (const profile of venueProfiles) {
      const { error } = await supabase
        .from('venue_profiles')
        .insert([profile]);
      if (error) throw error;
      console.log(`  ✓ ${profile.name}`);
    }

    // Get profile IDs for gigs/bookings (will fetch after insert)
    const { data: performerProfs } = await supabase
      .from('performer_profiles')
      .select('id, user_id');
    const { data: venueProfs } = await supabase
      .from('venue_profiles')
      .select('id, user_id');

    const performerMap = Object.fromEntries(
      performerProfs.map(p => [p.user_id, p.id])
    );
    const venueMap = Object.fromEntries(
      venueProfs.map(v => [v.user_id, v.id])
    );

    // Seed Gigs
    console.log('\n🎤 Seeding Gigs...');
    const gigs = [
      {
        venue_id: venueMap[TEST_UUIDS.venue1],
        date: '2026-08-05',
        time_start: '19:00:00',
        time_end: '21:00:00',
        act_type_needed: 'Music',
        notes: 'Looking for a smooth jazz or acoustic artist. Intimate audience of 20-30 people. Light refreshments provided.',
        status: 'open',
      },
      {
        venue_id: venueMap[TEST_UUIDS.venue2],
        date: '2026-08-08',
        time_start: '20:00:00',
        time_end: '22:00:00',
        act_type_needed: 'Comedy',
        notes: 'Stand-up comedy night. 30-45 minutes of material. Full bar available.',
        status: 'open',
      },
      {
        venue_id: venueMap[TEST_UUIDS.venue1],
        date: '2026-08-12',
        time_start: '18:00:00',
        time_end: '20:00:00',
        act_type_needed: 'Poetry',
        notes: 'Spoken word poetry night. Casual, intimate setting. Maximum 10 poets.',
        status: 'open',
      },
      {
        venue_id: venueMap[TEST_UUIDS.venue2],
        date: '2026-07-20',
        time_start: '19:00:00',
        time_end: '21:00:00',
        act_type_needed: 'Music',
        notes: 'Jazz night featuring local musicians.',
        status: 'filled',
      },
    ];

    let gigIds = [];
    for (const gig of gigs) {
      const { data, error } = await supabase
        .from('gigs')
        .insert([gig])
        .select();
      if (error) throw error;
      gigIds.push(data[0].id);
      console.log(`  ✓ Gig on ${gig.date} at ${gig.time_start}`);
    }

    // Seed Bookings
    console.log('\n📅 Seeding Bookings...');
    const bookings = [
      {
        gig_id: gigIds[3], // Past filled gig
        performer_id: performerMap[TEST_UUIDS.performer1],
        venue_id: venueMap[TEST_UUIDS.venue2],
        status: 'confirmed',
        performer_rating: 5,
        performer_comment: 'Great venue, wonderful audience energy!',
        performer_tags: ['professional', 'great energy', 'would work with again'],
        venue_rating: 5,
        venue_comment: 'Arjun was amazing! His saxophone playing was perfect for our venue.',
        venue_tags: ['professional', 'followed through', 'would invite again'],
      },
      {
        gig_id: gigIds[3],
        performer_id: performerMap[TEST_UUIDS.performer2],
        venue_id: venueMap[TEST_UUIDS.venue2],
        status: 'completed',
        performer_rating: 4,
        performer_comment: 'Fun crowd, will come back!',
        performer_tags: ['respectful', 'great energy'],
        venue_rating: 4,
        venue_comment: 'Priya kept the audience laughing. Very professional.',
        venue_tags: ['professional', 'followed through'],
      },
      {
        gig_id: gigIds[0],
        performer_id: performerMap[TEST_UUIDS.performer1],
        venue_id: venueMap[TEST_UUIDS.venue1],
        status: 'requested',
      },
      {
        gig_id: gigIds[2],
        performer_id: performerMap[TEST_UUIDS.performer3],
        venue_id: venueMap[TEST_UUIDS.venue1],
        status: 'accepted',
      },
      {
        gig_id: gigIds[1],
        performer_id: performerMap[TEST_UUIDS.performer2],
        venue_id: venueMap[TEST_UUIDS.venue2],
        status: 'declined',
      },
    ];

    let bookingIds = [];
    for (const booking of bookings) {
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select();
      if (error) throw error;
      bookingIds.push(data[0].id);
      console.log(`  ✓ Booking with status: ${booking.status}`);
    }

    // Seed Reviews (only for completed bookings)
    console.log('\n⭐ Seeding Reviews...');
    const reviews = [
      {
        booking_id: bookingIds[0], // Confirmed booking - can be reviewed
        from_user_id: TEST_UUIDS.performer1,
        to_user_id: TEST_UUIDS.venue2,
        rating: 5,
        comment: 'Amazing venue! Perfect sound system, supportive audience, and the staff was very helpful.',
        tags: ['great sound', 'wonderful audience', 'professional'],
      },
      {
        booking_id: bookingIds[0],
        from_user_id: TEST_UUIDS.venue2,
        to_user_id: TEST_UUIDS.performer1,
        rating: 5,
        comment: 'Arjun was punctual, professional, and absolutely captivated our audience. Highly recommend!',
        tags: ['punctual', 'professional', 'captivating'],
      },
      {
        booking_id: bookingIds[1], // Completed booking
        from_user_id: TEST_UUIDS.performer2,
        to_user_id: TEST_UUIDS.venue2,
        rating: 4,
        comment: 'Good venue with fun atmosphere. Would love to perform here again.',
        tags: ['good atmosphere', 'fun crowd'],
      },
      {
        booking_id: bookingIds[1],
        from_user_id: TEST_UUIDS.venue2,
        to_user_id: TEST_UUIDS.performer2,
        rating: 4,
        comment: 'Priya brought great energy to the show. Our guests loved her comedy.',
        tags: ['great energy', 'funny', 'professional'],
      },
    ];

    for (const review of reviews) {
      const { error } = await supabase
        .from('reviews')
        .insert([review]);
      if (error) throw error;
      console.log(`  ✓ Review created (${review.rating} stars)`);
    }

    // Seed User Roles
    console.log('\n👥 Seeding User Roles...');
    const userRoles = [
      { user_id: TEST_UUIDS.performer1, role: 'performer' },
      { user_id: TEST_UUIDS.performer2, role: 'performer' },
      { user_id: TEST_UUIDS.performer3, role: 'performer' },
      { user_id: TEST_UUIDS.performer4, role: 'performer' },
      { user_id: TEST_UUIDS.performer5, role: 'performer' },
      { user_id: TEST_UUIDS.venue1, role: 'venue' },
      { user_id: TEST_UUIDS.venue2, role: 'venue' },
      { user_id: TEST_UUIDS.venue3, role: 'venue' },
    ];

    for (const role of userRoles) {
      const { error } = await supabase
        .from('user_roles')
        .insert([role])
        .select()
        .catch(() => {}); // Ignore if already exists
    }
    console.log(`  ✓ User roles created (${userRoles.length} total)`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`  • 5 Performer profiles`);
    console.log(`  • 3 Venue profiles`);
    console.log(`  • 4 Gigs`);
    console.log(`  • 5 Bookings (various statuses)`);
    console.log(`  • 4 Reviews with ratings`);
    console.log(`  • 8 User roles\n`);
    console.log('🚀 Ready to test! Login with any of the test accounts:\n');
    console.log('  Performer (Approved):');
    console.log('    Email: performer1@stagespot.test');
    console.log('    Password: TestPassword123!\n');
    console.log('  Venue (Approved):');
    console.log('    Email: venue1@stagespot.test');
    console.log('    Password: TestPassword123!\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
