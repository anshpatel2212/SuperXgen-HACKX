# GlowGo Mumbai
**AI-Powered Beauty Salon Marketplace for Mumbai**

GlowGo Mumbai is a hackathon-ready multi-role salon marketplace demo for Mumbai. Customers discover salons, request bookings, use offers, and write reviews. Salon owners manage services, slots, offers, bookings, reviews, and verification-aware onboarding. Admins review users, salons, reviews, and platform activity.

The current submission build is production-aware but demo-local: many workflows use in-memory data plus browser localStorage so the judging flow stays fast and reliable. Supabase schema/seed files are included, but full Supabase Auth, Postgres persistence, Storage, RLS, and server-side verification remain production roadmap work.

## Submission Links

- **Live demo:** `TODO: add Vercel deployment URL`
- **GitHub repo:** `TODO: add GitHub repository URL`

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (base-nova)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Data:** In-memory demo repositories with browser-local persistence for key judging flows
- **Production data target:** Supabase PostgreSQL, Auth, Storage, RLS, and server-side workflows
- **Auth:** Browser-local demo authentication; Supabase Auth is a production roadmap item
- **AI:** Deterministic/rule-based demo engine grounded in live demo data; LLM providers are roadmap/configurable

## Features

### For Customers
- Browse salons with real-time calculated metrics (trust scores, price ranges, response times)
- AI-style search & deterministic recommendations grounded in demo data
- Salon detail pages with services, offers, reviews, and calculated pricing
- Booking flow with availability, date/slot selection, and price calculation
- Request-based group booking details for party size and extra services
- Personalized beauty profile and dashboard
- Favorite salons and booking history

### For Salon Owners
- **Multi-step Onboarding Wizard** — Guided form collecting basic info, branding, categories, working hours, services, policies, and verification/compliance details
- **Verification-aware submission** — Requires business identity, representative identity, address proof, Shops & Establishments details, document placeholders, safety declarations, and policy acceptance
- **Auto-Calculation Engine** — System computes: final prices (after discounts), min/max/avg prices, trust scores, slot utilization, revenue metrics, top services/categories, response times
- **Owner Dashboard** — Real calculated metrics: bookings, revenue, ratings, trust score, slot utilization
- **Availability Slot Management** — Weekly calendar with capacity tracking
- **GlowGo Smart Capacity Engine** — Demo-safe service-aware scheduling checks service duration, prep/cleanup buffers, slot capacity, and continuous availability before showing customer times
- **Offers & Promotions Management** — Create/activate/expire offers with dynamic pricing
- **AI Content Studio** — Generate salon descriptions, taglines, service descriptions, and SEO copy from raw inputs
- **Demo Business Insights** — Rule-based analysis of strengths, weaknesses, pricing advice, and recommended next actions

### For Admins
- Platform-wide analytics dashboard
- Browser-local salon approval and verification status management
- Demo users grouped by customers, salon owners/representatives, and admins
- Platform metrics overview

### AI Assistant Capabilities
1. Natural language search intent extraction
2. AI recommendation engine ranking by trust score & relevance
3. Live demo data context — never invents data
4. Review summarization from real stored reviews
5. Beauty profile insights
6. "Why this salon" explanations with live attributes
7. Salon description generation for owners
8. Personalized improvement suggestions for owners

## What Works in the Demo

- Customer discovery, salon detail, offers, slot-aware booking requests, favorites, reviews, and dashboards.
- Owner onboarding with validation and verification/compliance step.
- Owner slots, offers, bookings, services, reviews, AI helper, and insights pages.
- Admin users, salons, reviews, analytics, and moderation pages.
- Public Home, Explore, booking, API, and recommendation surfaces only expose verified/bookable salons.
- Owner recurring slot creation can generate 1, 2, or 4 weeks of availability while skipping duplicates.
- Service-aware booking times use duration plus prep/cleanup buffers and hide starts that cannot fit into continuous availability.
- Late-arrival policy copy explains the 10-minute grace period, 10-20 minute shortening risk, and 20+ minute reschedule/no-show risk.
- Policy pages: `/terms`, `/privacy`, `/verification-policy`, and `/cancellation-policy`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account only if you want to continue the production migration work
- OpenAI/Anthropic API key only if you replace the deterministic AI demo engine

### Local Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```
For the current demo, placeholder Supabase values are enough because runtime data is demo-local. For production migration work, edit `.env.local` with real credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

3. **Optional Supabase migration work:**
Connect to your Supabase project and review `supabase/schema.sql` and `supabase/seed.sql`. Do not treat these as a completed production runtime migration yet.

4. **Start the development server:**
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

This project currently uses local demo authentication for hackathon flows. These accounts are seeded in the browser for a fresh demo session.

| Role | Email | Password | Landing |
|---|---|---|---|
| Customer | `customer@glowgo.demo` | `demo123` | `/dashboard` |
| Owner | `owner@glowgo.demo` | `demo123` | `/owner` |
| Admin | `admin@glowgo.demo` | `demo123` | `/admin` |

> This is demo-local authentication stored in the browser. It is not production security. Supabase Auth, server sessions, API authorization, and RLS remain production roadmap work.

Google and Facebook sign-in buttons are intentionally disabled in the submission build. They are not fake OAuth flows.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, signup, forgot password
│   ├── admin/             # Admin dashboard, salons, users, analytics
│   ├── ai-assistant/      # AI beauty assistant chat
│   ├── booking/           # Booking flow
│   ├── dashboard/         # User dashboard, profile, favorites
│   ├── explore/           # Salon search & filters
│   ├── owner/             # Owner dashboard, onboarding, slots, offers, AI helper, insights
│   └── salon/             # Salon detail pages
├── components/            # Reusable components
│   ├── admin/             # Admin-specific components
│   ├── ai/                # AI chat components
│   ├── booking/           # Booking flow components
│   ├── dashboard/         # Dashboard components
│   ├── onboarding/        # Multi-step onboarding wizard
│   ├── owner/             # Owner-specific components
│   ├── salon/             # Salon card, hero, gallery, info
│   ├── shared/            # Empty states, loading skeletons, status badges
│   └── ui/                # shadcn/ui components
├── data/                  # Mock data (fallback when no DB connected)
├── lib/                   # Utilities, auth context, data service, store
├── services/              # AI service, calculation engine
└── types/                 # TypeScript type definitions
supabase/
├── schema.sql             # Full PostgreSQL schema
└── seed.sql               # Sample data with calculated metrics
```

## Auto-Calculation System

The system automatically computes these derived values from owner-provided data:

| Metric | Source | Display |
|--------|--------|---------|
| `final_price` | price - (price × discount_percent / 100) | Service cards, booking |
| `min_price` / `max_price` / `avg_price` | From active services | Salon cards, detail pages |
| `trust_score` | Weighted: verification(20) + rating(25) + reviews(15) + response time(15) + completion rate(25) | Badges on cards, detail |
| `slot_utilization_percent` | booked_count / capacity for current week | Owner dashboard |
| `revenue_total/week/month` | From completed bookings | Owner dashboard, admin |
| `avg_response_time_minutes` | Time from booking creation to confirmation | Salon badges |
| `top_service` / `top_category` | Most booked service/category | Owner insights |
| `effective_price` | Base price - best applicable offer | Live service pricing |

See `src/services/calculations.ts` for the full implementation.

## AI Service Architecture

The AI service (`src/services/ai.ts`) operates on live data only:

1. **Intent Extraction** — Parses natural language queries into structured `AIIntent` objects
2. **Live Context Building** — Queries in-memory data (or DB) for matching salons, services, offers, reviews, metrics
3. **Ranking** — Sorts results by trust score and relevance to intent
4. **Response Generation** — Returns structured JSON or natural language grounded in live data
5. **Conversation Logging** — All conversations stored in `aiConversationsStore`

The AI never invents:
- ❌ Fake salons, prices, ratings, offers, addresses, reviews, or availability
- ✅ Only interprets intent, summarizes, personalizes, ranks, and explains based on live data

For production, replace or augment the rule-based engine with LLM calls using the prompt templates in `src/services/ai-prompt-templates.ts`.

## Verification Policy Summary

Salon onboarding asks for business identity, owner/representative identity, address proof, Shops & Establishments details, conditional BMC trade/health license details, conditional GSTIN, document placeholders, safety declarations, and policy acceptance.

Review copy shown in the product:

- Verification usually takes 3-5 business days after all required documents are submitted.
- Complex, incomplete, or mismatched submissions may take 7-10 business days.
- Government license processing is handled outside GlowGo and may take longer.
- The hackathon demo captures document file names locally; production requires secure storage and admin audit logs.

## Key Design Decisions

- **In-memory data layer**: For hackathon demo, data is in-memory with localStorage fallback for key flows. Swap to Supabase queries in production.
- **Calculations on read**: Metrics are computed on-the-fly from raw data, ensuring they're always up-to-date.
- **Client-side auth**: localStorage-based for demo. Use Supabase Auth in production with proper session management.
- **Verification-first onboarding**: New salon submissions are treated as pending/under review rather than instantly verified.
- **Public listing gate**: Public discovery and booking surfaces require verified/approved salons with at least one valid bookable service.
- **Mobile-first**: All pages are responsive with mobile-first Tailwind breakpoints.
- **Brand colors**: Blush pink (#db2777), lavender (#a78bfa), cream (#fef3c7), white, black accents.

## Known Limitations

- Some data resets when browser storage or server memory is cleared.
- Demo auth is browser-local and not production security.
- Document uploads capture file names only; files are not uploaded.
- Google/Facebook OAuth, real payments, real Google Maps embeds, and secure document storage are not enabled.
- Group bookings are request-based notes and require salon confirmation; full parallel staff/resource optimization is production roadmap work.
- Smart Capacity Engine is demo-safe: it checks service duration, buffers, contiguous slots, and slot capacity, but it does not yet reserve every underlying contiguous slot or assign named staff/resources.
- Supabase files exist, but the running app is not fully production-backed by Supabase yet.

## Production Roadmap

- Supabase Auth with secure server sessions and role-aware API authorization.
- Postgres persistence for salons, services, slots, bookings, offers, reviews, users, and AI logs.
- RLS policies for customers, owners, admins, and service-role workflows.
- Supabase Storage or equivalent secure storage for verification documents with retention policy.
- Server-side salon verification workflow with admin approvals, rejection reasons, resubmission, and audit logs.
- Transactional booking writes with multi-slot reservation, named staff assignment, resource calendars, booking holds, and conflict-aware group/multi-service scheduling.
- Real notification pipeline for booking confirmations, cancellations, document changes, and admin decisions.
- Optional real Google Maps integration and real OAuth providers after environment/callback setup is complete.

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Manual Build
```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Placeholder for demo, real for production migration | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Placeholder for demo, real for production migration | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | For admin operations |
| `OPENAI_API_KEY` | No | Optional future LLM-backed AI features |
| `ANTHROPIC_API_KEY` | No | Optional alternative LLM provider |

## License

MIT
