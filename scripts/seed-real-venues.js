#!/usr/bin/env node

/**
 * Seeds the real Delhi venues from the provided asset
 * `stagespot-seed-data-template.xlsx` (PRD Section 9: initial venue data
 * entered by hand, real local cafes/restaurants in the launch region).
 *
 * Creates one auth account per venue (venue4..venue9@stagespot.test,
 * password TestPassword123!), a `user_roles` row, and the venue profile.
 * Idempotent: re-running skips users and profiles that already exist.
 *
 * Usage: node --env-file=.env scripts/seed-real-venues.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Run with: node --env-file=.env scripts/seed-real-venues.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PASSWORD = 'TestPassword123!';

// Rows from stagespot-seed-data-template.xlsx (the "The Wren Cafe" row is the
// template's example row and is not seeded). Coordinates are locality-level,
// matching src/utils/delhiLocalities.ts.
// The two venues whose template notes say "confirm/verify before adding"
// (Unplugged Courtyard, The Social House) are seeded as `pending` so they sit
// in the admin verification queue; the rest are approved per Section 9
// (hand-entered, real, verified venues).
const REAL_VENUES = [
  {
    email: 'venue4@stagespot.test',
    name: 'Unplugged Courtyard',
    full_address: 'L Block 23/7, Ground Floor, Middle Circle, near Odeon Cinema, Connaught Place, New Delhi 110001',
    locality: 'Connaught Place',
    coordinates: '(28.6315, 77.2167)',
    act_types_wanted: ['Music'],
    verification_status: 'pending', // template note: confirm current status before adding
  },
  {
    email: 'venue5@stagespot.test',
    name: 'Depot48',
    full_address: 'Second Floor, M9 M Block Market, Greater Kailash II, New Delhi',
    locality: 'Greater Kailash II',
    coordinates: '(28.5344, 77.2434)',
    act_types_wanted: ['Music'],
    verification_status: 'approved',
  },
  {
    email: 'venue6@stagespot.test',
    name: 'Light Room',
    full_address: 'Second Floor, 12A Hauz Khas Tank, Hauz Khas Village, Deer Park, New Delhi 110016',
    locality: 'Hauz Khas Village',
    coordinates: '(28.5535, 77.1943)',
    act_types_wanted: ['Comedy'],
    verification_status: 'approved',
  },
  {
    email: 'venue7@stagespot.test',
    name: 'The Piano Man Jazz Club',
    full_address: 'B 6-7/22, Safdarjung Enclave Market, Opp Deer Park, New Delhi 110029',
    locality: 'Safdarjung Enclave',
    coordinates: '(28.5690, 77.1946)',
    act_types_wanted: ['Music'],
    verification_status: 'approved',
  },
  {
    email: 'venue8@stagespot.test',
    name: 'Buddy On Stage',
    full_address: 'L-11 Basement, Malviya Nagar, New Delhi 110017',
    locality: 'Malviya Nagar',
    coordinates: '(28.5324, 77.2011)',
    act_types_wanted: ['Music', 'Poetry', 'Comedy', 'Storytelling'],
    verification_status: 'approved',
  },
  {
    email: 'venue9@stagespot.test',
    name: 'The Social House',
    full_address: 'Near Tilak Nagar metro station, Tilak Nagar, New Delhi',
    locality: 'Tilak Nagar',
    coordinates: '(28.6414, 77.0967)',
    act_types_wanted: ['Poetry', 'Comedy'],
    verification_status: 'pending', // template note: exact street address not confirmed, verify before adding
  },
];

async function findUserByEmail(email) {
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email === email);
    if (match) return match;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function seedRealVenues() {
  console.log('🌱 Seeding real venues from stagespot-seed-data-template.xlsx\n');

  for (const venue of REAL_VENUES) {
    let user = await findUserByEmail(venue.email);
    if (user) {
      console.log(`  • ${venue.email} already exists`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: venue.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name: venue.name },
      });
      if (error) throw error;
      user = data.user;
      console.log(`  ✓ Created auth user ${venue.email}`);
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'venue' }, { onConflict: 'user_id' });
    if (roleError) throw roleError;

    const { data: existing } = await supabase
      .from('venue_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      console.log(`  • Profile "${venue.name}" already exists\n`);
      continue;
    }

    const { error: profileError } = await supabase.from('venue_profiles').insert([
      {
        user_id: user.id,
        name: venue.name,
        full_address: venue.full_address,
        locality: venue.locality,
        city: 'Delhi',
        state: 'Delhi',
        coordinates: venue.coordinates,
        act_types_wanted: venue.act_types_wanted,
        venue_photos: [],
        social_media_links: null,
        verification_status: venue.verification_status,
        // Section 9: proof reviewed by hand from public listings before entry
        proof_of_business_link: null,
        rating: 0,
        total_gigs_hosted: 0,
      },
    ]);
    if (profileError) throw profileError;
    console.log(`  ✓ Seeded "${venue.name}" (${venue.locality}, ${venue.verification_status})\n`);
  }

  console.log('✅ Real venue seeding complete.');
  console.log(`   Accounts venue4..venue9@stagespot.test, password: ${PASSWORD}`);
}

seedRealVenues().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
