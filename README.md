# StageSpot — Get Your First Stage

A hyperlocal web platform connecting first-time and hobbyist performers (musicians, poets, comedians) with small cafes and restaurants hosting live open-mic-style performances. Launching in the Delhi region.

## Features

- **Authentication** — email/password via Supabase Auth with email verification, forgot/reset password, role selection (Performer or Venue) at sign-up, required Terms & Conditions acceptance
- **Admin verification** — every performer and venue profile is reviewed by an admin (proof links, portfolio, social presence, address) and approved or rejected with a reason before they can post or apply to gigs
- **Profiles** — public performer/venue pages with unique IDs, ratings, performance history, reviews, "Already worked with" indicators, and verification badges
- **Gigs & bookings** — venues post gigs; performers apply; bookings move through `requested → accepted → confirmed → completed` with `declined`/`cancelled` branches; bookings auto-complete once the gig date passes
- **Privacy gating** — the venue's exact address and contact information stay hidden until a booking is **confirmed**
- **Feedback** — after completion both sides leave a 1–5 star rating, written comment, and reputation tags; profile averages update automatically via database triggers
- **Area-based filtering** — Haversine distance filtering/sorting of gigs from the user's venue location or geolocation (Delhi localities)
- **AI-assisted search** — describe the vibe in plain text ("moody, acoustic, late-night energy"); the system expands it into act types/keywords and returns matching verified performers. Uses Google Gemini when `GEMINI_API_KEY` is set (falls back to the Anthropic API via `ANTHROPIC_API_KEY`, then to a built-in keyword/category heuristic — the feature works with no key at all)
- **Admin dashboard** — verification queue plus platform-wide views of all gigs, bookings, and reviews
- **Responsive** — mobile-first per the provided wireframes; on desktop (≥1024px) navigation moves into the header, feeds become multi-column grids, the Explore masonry gains columns, and the AI search sheet becomes a centered dialog

## Tech stack

Next.js (App Router) + Tailwind CSS · Supabase (Postgres, Auth, Storage, RLS) · Vercel-ready

## Prerequisites

- Node.js 18+
- A Supabase project (with the new-style API keys: publishable + secret)
- Supabase CLI (for applying migrations): `brew install supabase/tap/supabase`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env       # then fill in the values (see below)

# 3. Apply database migrations (schema, RLS, triggers, storage bucket)
supabase link --project-ref <your-project-ref>
supabase db push --include-all

# 4. Seed sample data (optional — see Database seeding below)
node scripts/seed-database.js

# 5. Run locally
npm run dev                # http://localhost:3000
```

## Environment variables (see `.env.example`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`), safe for the browser |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_…`), server-side only — used by API routes and scripts |
| `SUPABASE_JWKS_URL` | JWKS endpoint for token verification |
| `NEXT_PUBLIC_API_URL` | Base URL of the app |
| `ANTHROPIC_API_KEY` | Optional — enables Claude-powered AI search expansion |

## Project structure

```
src/
  app/
    page.tsx                     # Landing page
    terms/                       # Terms and Conditions
    auth/                        # signup, login, verify-email, forgot/reset password
    app/                         # signed-in app (mobile-first, desktop-adaptive)
      home/                      # feed with Performers/Gigs toggle + AI search FAB
      explore/                   # masonry grid, category + distance filters
      gigs/new, gigs/[id]        # post a gig (verified venues), gig detail/apply
      performer/[id], venue/[id] # public profiles
      bookings/                  # status tracker, [id]/confirm (lifecycle actions), [id]/feedback
      profile/                   # my profile + setup/performer, setup/venue
    admin/dashboard/             # verification queue + all gigs/bookings/reviews
    api/search/                  # AI-assisted search endpoint
    api/preview/                 # landing-page "This week nearby" data
  components/                    # UI building blocks (SegmentedControl, FeedCard, ImageUpload, …)
  utils/db.ts                    # data layer (all Supabase queries)
  utils/auth.ts, geo.ts          # auth helpers, Haversine distance
supabase/migrations/             # schema, RLS policies, rating triggers, storage bucket
scripts/seed-database.js         # sample data seeder
scripts/set-admin.js             # grant/revoke admin for an account
```

## Pages ↔ PRD Section 6

All 18 screens are implemented: Landing, Home, Explore, Sign Up, Login, Email Verification, Performer Setup, Venue Setup, Performer Profile, Venue Profile, Post a Gig, Gig/Performer Detail, My Bookings, Booking Confirmation, Feedback & Rating, My Profile (edit), Admin Dashboard, Terms & Conditions — plus `/auth/reset-password` for the password-reset flow.

## Test credentials

All test accounts use the password `TestPassword123!`

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@stagespot.test` | Lands on the admin dashboard after login |
| Performer (approved) | `performer1@stagespot.test` | Arjun Sharma — has ratings/reviews |
| Performer (approved) | `performer2@stagespot.test` | Priya Patel — comedy |
| Performer (pending) | `performer4@stagespot.test` | Neha Singh — in the admin queue |
| Performer (rejected) | `performer5@stagespot.test` | Rajesh Kumar — with rejection reason |
| Venue (approved) | `venue1@stagespot.test` | The Coffee Lounge |
| Venue (approved) | `venue2@stagespot.test` | The Stage Hauz Khas |
| Venue (pending) | `venue3@stagespot.test` | Dil Se Restaurant — in the admin queue |
| Venue (real, approved) | `venue5..venue8@stagespot.test` | Depot48, Light Room, The Piano Man Jazz Club, Buddy On Stage |
| Venue (real, pending) | `venue4`, `venue9@stagespot.test` | Unplugged Courtyard, The Social House — in the admin queue |

To grant admin to another account: `node scripts/set-admin.js <email>` (roles live in the `user_roles` table — the database source of truth; admin rows can only be created server-side).

## Database seeding

`node scripts/seed-database.js` creates 5 performers, 3 venues, 4 gigs, bookings in all six lifecycle states, and reviews. Auth users must exist first (create them in the Supabase dashboard or with the emails above).

`node --env-file=.env scripts/seed-real-venues.js` seeds the six real Delhi venues from the provided `stagespot-seed-data-template.xlsx` (PRD Section 9: hand-entered launch venues). It creates the auth accounts itself and is safe to re-run. The two venues whose template notes ask for verification before adding are seeded as `pending` for the admin queue.

## Known limitations & next steps

- **Performer location**: the PRD's performer profile has no address field, so "performers near a venue" ranking has no data to rank on; distance filtering applies to gigs (venues have coordinates). Adding an optional locality to performer profiles would enable it.
- **Venue → performer direct invite** creates no special flow; the Invite button routes the venue to gig posting, and performers apply from there.
- **AI search** runs on a keyword/category heuristic until an `ANTHROPIC_API_KEY` is provided.
- **Email delivery** uses Supabase's built-in sender; configure a custom SMTP provider for production volumes.
- **Address→coordinate conversion** uses a curated Delhi-locality lookup rather than a geocoding API (per launch scope).
