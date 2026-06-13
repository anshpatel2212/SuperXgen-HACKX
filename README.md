# GlowGo Mumbai 🏙️✨

**AI-Powered Beauty Salon Marketplace for Mumbai**

GlowGo Mumbai is a full-stack production-style MVP for a city-based AI beauty salon marketplace. Salon owners onboard their business by entering structured data, the system automatically calculates all derived metrics, and an AI assistant is connected to live owner data to power discovery and recommendations.

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (base-nova)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth (with localStorage fallback for demo)
- **AI:** OpenAI / Anthropic API (configurable)

## Features

### For Customers
- Browse salons with real-time calculated metrics (trust scores, price ranges, response times)
- AI-powered search & recommendations grounded in live data
- Salon detail pages with services, offers, reviews, and calculated pricing
- Booking flow with availability, date/slot selection, and price calculation
- Personalized beauty profile and dashboard
- Favorite salons and booking history

### For Salon Owners
- **Multi-step Onboarding Wizard** — Guided form collecting: basic info, branding, categories, working hours, services, policies
- **Auto-Calculation Engine** — System computes: final prices (after discounts), min/max/avg prices, trust scores, slot utilization, revenue metrics, top services/categories, response times
- **Owner Dashboard** — Real calculated metrics: bookings, revenue, ratings, trust score, slot utilization
- **Availability Slot Management** — Weekly calendar with capacity tracking
- **Offers & Promotions Management** — Create/activate/expire offers with dynamic pricing
- **AI Content Studio** — Generate salon descriptions, taglines, service descriptions, and SEO copy from raw inputs
- **AI Business Insights** — AI-driven analysis of strengths, weaknesses, pricing advice, and recommended next actions

### For Admins
- Platform-wide analytics dashboard
- Salon approval and verification management
- User management
- Platform metrics overview

### AI Assistant Capabilities
1. Natural language search intent extraction
2. AI recommendation engine ranking by trust score & relevance
3. Live database context — never invents data
4. Review summarization from real stored reviews
5. Beauty profile insights
6. "Why this salon" explanations with live attributes
7. Salon description generation for owners
8. Personalized improvement suggestions for owners

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account (free tier works)
- OpenAI API key (optional, for AI features)

### Local Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

3. **Run database migrations:**
Connect to your Supabase project and run the SQL in `supabase/schema.sql` to create all tables, indexes, and RLS policies.

4. **Seed sample data:**
Run `supabase/seed.sql` in your Supabase SQL editor to populate sample salons, services, reviews, offers, and metrics.

5. **Start the development server:**
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding, use these accounts:
- **Customer:** riya.sharma@example.com (password: any)
- **Owner:** neha@glowandglam.com (password: any)
- **Admin:** admin@glowgo.com (password: any)

> Note: The demo uses localStorage-based auth. For production, switch to Supabase Auth.

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

For production, replace the rule-based engine with LLM calls using the prompt templates in `src/services/ai-prompt-templates.ts`.

## Key Design Decisions

- **In-memory data layer**: For hackathon demo, data is in-memory with localStorage fallback. Swap to Supabase queries in production.
- **Calculations on read**: Metrics are computed on-the-fly from raw data, ensuring they're always up-to-date.
- **Client-side auth**: localStorage-based for demo. Use Supabase Auth in production with proper session management.
- **Mobile-first**: All pages are responsive with mobile-first Tailwind breakpoints.
- **Brand colors**: Blush pink (#db2777), lavender (#a78bfa), cream (#fef3c7), white, black accents.

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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | For admin operations |
| `OPENAI_API_KEY` | No | For AI features |
| `ANTHROPIC_API_KEY` | No | Alternative AI provider |

## License

MIT
