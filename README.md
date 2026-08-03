# StageSpot

StageSpot is a full-stack web platform that connects performers with cafés, restaurants, and venues looking to host live performances. It enables venues to post gigs, performers to apply, and both parties to manage bookings, profiles, and feedback through a secure and intuitive workflow.

---

## Features

### Authentication & Authorization

- Secure email/password authentication using Supabase Auth
- Email verification
- Forgot password and password reset
- Role-based registration (Performer or Venue)
- Terms & Conditions acceptance during signup

### Performer & Venue Profiles

- Create and manage performer or venue profiles
- Portfolio links and social media integration
- Verification workflow with approval and rejection status
- Public profile pages with ratings and reviews
- Performance history and verification badges

### Gig Management

- Venues can create and manage performance opportunities
- Performers can browse and apply for gigs
- Booking lifecycle including:
  - Requested
  - Accepted
  - Confirmed
  - Completed
  - Declined
  - Cancelled
- Automatic completion of bookings after the event date

### Privacy Controls

- Venue contact information and address remain hidden until a booking is confirmed
- Secure access to sensitive information using Row Level Security (RLS)

### Reviews & Ratings

- Two-way review system between performers and venues
- 1–5 star ratings
- Written feedback
- Reputation tags
- Automatic profile rating updates using PostgreSQL triggers

### Search & Discovery

- Browse performers and gigs
- Filter opportunities by category and locality
- Distance-based search using the Haversine formula
- Natural language performer search with optional Gemini AI support and keyword-based fallback

### Administration

- Admin dashboard for profile verification
- Manage performers and venues
- Review gigs and bookings
- Moderate platform activity

### Responsive Design

- Mobile-first responsive interface
- Optimized layouts for tablets and desktop devices

---

# Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- Supabase

### Database

- PostgreSQL
- Row Level Security (RLS)

### Authentication

- Supabase Auth

### Storage

- Supabase Storage

### AI Integration

- Google Gemini API (optional)
- Automatic keyword-based fallback when no API key is configured

### Deployment

- Vercel

---

# Installation

Clone the repository

```bash
git clone https://github.com/your-username/stagespot.git

cd stagespot
```

Install dependencies

```bash
npm install
```

Copy the environment file

```bash
cp .env.example .env.local
```

Update the environment variables.

Run database migrations

```bash
supabase db push
```

(Optional) Seed demo data

```bash
node scripts/seed-database.js
```

Start the development server

```bash
npm run dev
```

The application will be available at

```
http://localhost:3000
```

---

# Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SECRET_KEY=

SUPABASE_JWKS_URL=

NEXT_PUBLIC_API_URL=

GEMINI_API_KEY=

ANTHROPIC_API_KEY=
```

---

# Project Structure

```
src
│
├── app
│   ├── auth
│   ├── admin
│   ├── api
│   └── app
│
├── components
│
├── utils
│
└── styles

supabase
│
└── migrations

scripts
```

---

# Demo Accounts

The project includes sample accounts for testing.

| Role | Email |
|-------|-----------------------------|
| Admin | admin@stagespot.test |
| Performer | performer1@stagespot.test |
| Performer | performer2@stagespot.test |
| Venue | venue1@stagespot.test |
| Venue | venue2@stagespot.test |

Password

```
TestPassword123!
```

---

# Database

The database schema is managed using Supabase migrations.

```bash
supabase db push
```

Optional sample data can be inserted using

```bash
node scripts/seed-database.js
```

---

# Future Improvements

- Direct venue invitations for performers
- Enhanced recommendation system
- Real-time notifications
- Calendar integration
- Location autocomplete using Maps APIs
- Custom email provider for production

---

# License

This project is intended for educational and portfolio purposes.
