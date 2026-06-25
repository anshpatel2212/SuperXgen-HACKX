# GlowGo Mumbai

**AI-powered salon marketplace and operations demo for Mumbai**

GlowGo Mumbai is a hackathon-ready multi-role salon marketplace built for customers, salon owners, and admins. Customers can discover verified salons, book available services, apply offers, and submit reviews. Salon owners can manage services, availability, offers, bookings, reviews, and verification-aware onboarding. Admins can review users, salons, reviews, and platform activity.

This submission build is **production-aware but demo-local**. Key judging flows use browser-local persistence and in-memory demo repositories to keep the demo fast, reliable, and easy to run. Supabase schema and seed files are included, but full Supabase Auth, Postgres persistence, Storage, RLS, server-side authorization, and production verification workflows remain roadmap work.

---

## Submission Links

**Live Demo:** https://superxgen-hackx.vercel.app
**GitHub Repo:** https://github.com/anshpatel2212/SuperXgen-HACKX

---

## Demo Accounts

This project uses local demo authentication for hackathon flows. These accounts are seeded in the browser for a fresh demo session.

| Role     | Email                                               | Password | Landing      |
| -------- | --------------------------------------------------- | -------- | ------------ |
| Customer | [customer@glowgo.demo](mailto:customer@glowgo.demo) | demo123  | `/dashboard` |
| Owner    | [owner@glowgo.demo](mailto:owner@glowgo.demo)       | demo123  | `/owner`     |
| Admin    | [admin@glowgo.demo](mailto:admin@glowgo.demo)       | demo123  | `/admin`     |

This is browser-local demo authentication. It is not production security. Supabase Auth, server sessions, API authorization, and RLS are planned for production.

Google and Facebook sign-in buttons are intentionally disabled in this submission build. They are not fake OAuth flows.

---

## Tech Stack

| Area                   | Technology                                                 |
| ---------------------- | ---------------------------------------------------------- |
| Framework              | Next.js 16.2.9, App Router                                 |
| Language               | TypeScript                                                 |
| Styling                | Tailwind CSS v4                                            |
| Components             | shadcn/ui, base-nova style                                 |
| Icons                  | Lucide React                                               |
| Charts                 | Recharts                                                   |
| Data in Demo           | In-memory demo repositories + browser-local persistence    |
| Production Data Target | Supabase PostgreSQL, Auth, Storage, RLS                    |
| AI in Demo             | Deterministic/rule-based recommendation and insight engine |
| Deployment             | Vercel                                                     |

---

## What GlowGo Does

GlowGo is designed as more than a simple salon booking app. It focuses on three real marketplace problems:

1. **Customer convenience** — finding salons, comparing services, booking available slots, applying offers, and reviewing experiences.
2. **Salon owner operations** — managing availability, services, verification, offers, reviews, and booking capacity without needing a technical person.
3. **Marketplace trust** — verification-aware onboarding, admin moderation, review visibility, and honest status handling.

---

## Premium UI Identity

The current UI pass introduces the **Mumbai Afterglow** visual system: warm ivory surfaces, deep charcoal text, blush primary actions, lavender accents, soft trust-gold highlights, frosted cards, and mobile-first spacing.

Presentation-layer additions include:

* Premium mobile-first homepage hero around verified Mumbai salons and conflict-aware scheduling.
* Smart Booking Orbit visual for duration, capacity, verification, offers, reviews, and policies.
* GlowGo Trust Passport surfaces on homepage, salon cards, salon detail, and booking review.
* Mobile bottom navigation for customer, owner, and admin demo areas where it does not conflict with booking CTAs.
* Explore area chips for demo-safe nearby discovery.
* 2-3 salon compare flow with trust score, rating, pricing, services, offers, and Trust Passport highlights.
* Improved `next/image` usage and fallback strategy for salon and review imagery.

These are UI/UX upgrades only. They do not change the demo-local security, persistence, payment, maps, or Supabase production roadmap limitations.

---

## Key Features

### For Customers

* Salon discovery and filtering by city, area, services, price, rating, and categories.
* Mobile-first Explore surface with area chips and a safe 2-3 salon compare flow.
* Salon detail pages with services, offers, reviews, location, gallery, and contact information.
* GlowGo Trust Passport visibility before booking.
* Slot-aware booking flow with date/time selection.
* Offer-aware pricing and booking summaries.
* Review submission that persists across customer, owner, and admin views.
* Customer dashboard with bookings, favorites, profile, preferences, and review activity.
* Request-based group booking details for party size and extra service needs.
* Late-arrival policy copy to reduce booking disputes.
* AI-style salon recommendations grounded in demo data.

### For Salon Owners

* Multi-step onboarding wizard.
* Verification-aware salon submission flow.
* Required business and compliance details.
* Document placeholder capture for demo verification.
* Policy acceptance before salon submission.
* Owner dashboard with calculated metrics.
* Service management with validation for duration, pricing, category, and service details.
* Availability slot management.
* Recurring/bulk slot creation for 1, 2, or 4 weeks.
* Offers and promotions management.
* Booking and review visibility.
* AI content helper for salon descriptions, taglines, SEO copy, and service descriptions.
* Demo business insights based on rule-based analysis.

### For Admins

* Admin dashboard for platform overview.
* Users grouped by customers, salon owners/representatives, and admins.
* Salon verification and approval-ready workflows.
* Review moderation-ready views.
* Platform analytics and metrics overview.
* Visibility into demo-local marketplace activity.

---

## Verification-Aware Salon Onboarding

GlowGo does not treat salon listing as a simple public form. New salon submissions are designed around a verification workflow.

The onboarding flow collects:

* Business identity
* Owner or authorized representative identity
* Address and location details
* Shops & Establishments registration/intimation details
* Conditional BMC trade/health license details
* Conditional GSTIN details
* Safety and hygiene declarations
* Document placeholders
* Listing policy acceptance
* Verification timeline acknowledgement

### Verification Timeline

The product copy communicates:

* Verification usually takes **3–5 business days** after all required documents are submitted.
* Complex, incomplete, or mismatched submissions may take **7–10 business days**.
* Government license processing happens outside GlowGo and may take longer.

In this hackathon build, document uploads capture file names locally. Production would require secure storage, server-side admin review, audit logs, and role-based access control.

---

## GlowGo Smart Capacity Engine

Most booking apps treat every service as a fixed one-hour slot. Real salon operations are more complex. A haircut, facial, hair color, and bridal makeup all require different durations, buffers, staff capacity, and resources.

GlowGo includes a demo-safe **Smart Capacity Engine** that makes booking more realistic.

It considers:

* Service duration
* Prep and cleanup buffer time
* Slot capacity
* Continuous availability
* Long-service timing requirements
* Group booking confirmation needs
* Late-arrival policy

### Example

A bridal makeup service may require 3–4 continuous hours, while a haircut may need 30–45 minutes. GlowGo can show different available times based on whether the selected service actually fits into the available schedule.

### Demo Scope

In this submission build, the Smart Capacity Engine checks duration, buffers, continuous slot availability, and capacity. Full named staff assignment, room/chair-level inventory, transactional multi-slot locking, and advanced group optimization are production roadmap items.

---

## Booking and Late Arrival Policy

GlowGo includes production-aware booking policy copy.

Late arrival guidance:

* **0–10 minutes late:** grace period.
* **10–20 minutes late:** service may be shortened if possible.
* **20+ minutes late:** salon may reschedule or mark the booking as no-show.
* Long services may require rescheduling if delay affects later appointments.

Group bookings are request-based in the demo. They require salon confirmation because staff, chairs, rooms, and service durations must be checked.

---

## AI Assistant Capabilities

The AI assistant is a deterministic demo engine grounded in stored demo data. It does not invent unavailable salons, fake offers, fake ratings, or fake prices.

It supports:

* Natural language salon search intent extraction.
* Salon recommendation ranking.
* “Why this salon” explanations.
* Review summarization from stored reviews.
* Beauty profile insights.
* Owner-facing salon description generation.
* Rule-based business improvement suggestions.

For production, this can be upgraded with OpenAI, Anthropic, or another LLM provider using server-side keys, structured prompts, rate limits, and safety controls.

---

## What Works in the Demo

* Customer discovery and filtering.
* Mobile-first premium UI surfaces for home, Explore, salon detail, booking, login, and role dashboards.
* Trust Passport UI for verification, policy, review, and service-fit confidence.
* Compare salons from Explore.
* Demo-safe area-based nearby discovery chips.
* Salon detail pages.
* Offer-aware booking.
* Slot-aware booking.
* Smart duration and buffer checks for booking availability.
* Browser-local booking persistence.
* Owner availability management.
* Bulk/recurring slot creation.
* Review persistence across customer, owner, admin, API, AI summaries, and calculations.
* Verification-aware owner onboarding.
* Demo-local admin/user/review/salon management.
* Policy pages:

  * `/terms`
  * `/privacy`
  * `/verification-policy`
  * `/cancellation-policy`
* Role-aware demo login and route guards.
* Customer, owner, and admin demo accounts.
* Vercel deployment.

---

## Getting Started

### Prerequisites

* Node.js 20.9+ or Node.js 22 LTS
* npm
* Supabase account only if continuing production migration work
* OpenAI/Anthropic API key only if replacing the deterministic AI demo engine

### Local Setup

Clone the repository:

```bash
git clone https://github.com/anshpatel2212/SuperXgen-HACKX.git
cd SuperXgen-HACKX
```

Install dependencies:

```bash
npm install
```

Set up environment variables:

```bash
cp .env.local.example .env.local
```

For the current demo, placeholder Supabase values are enough because runtime data is demo-local.

For production migration work, configure real credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
```

Start the local development server.

```bash
npm run build
```

Create a production build.

```bash
npm run lint
```

Run lint checks.

```bash
npx tsc --noEmit
```

Run TypeScript type checking.

---

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, signup, callback, forgot password
│   ├── admin/              # Admin dashboard, users, salons, reviews, analytics
│   ├── ai-assistant/       # AI beauty assistant chat
│   ├── booking/            # Booking flow
│   ├── dashboard/          # Customer dashboard, profile, favorites, preferences
│   ├── explore/            # Salon search and filters
│   ├── owner/              # Owner dashboard, onboarding, slots, offers, AI, insights
│   └── salon/              # Salon detail pages
├── components/             # Reusable components
│   ├── admin/              # Admin-specific components
│   ├── ai/                 # AI chat and recommendation components
│   ├── booking/            # Booking flow components
│   ├── dashboard/          # Customer dashboard components
│   ├── home/               # Home page search and sections
│   ├── onboarding/         # Multi-step owner onboarding wizard
│   ├── owner/              # Owner-specific components
│   ├── salon/              # Salon cards, gallery, reviews, service displays
│   ├── shared/             # Shared UI, trust passport, mobile nav, empty/loading/status states
│   └── ui/                 # shadcn/ui primitives
├── data/                   # Seed/demo data
├── lib/                    # Demo repositories, auth helpers, utilities
├── services/               # AI service and calculation engine
└── types/                  # TypeScript type definitions

supabase/
├── schema.sql              # Production-target database schema draft
└── seed.sql                # Production-target seed draft
```

---

## Demo Data and Persistence

The submission build uses a demo-local architecture:

* Static seed data for initial salon marketplace records.
* In-memory stores for runtime behavior.
* Browser-local persistence for important judging flows such as:

  * demo auth
  * bookings
  * reviews
  * offers
  * slots
  * owner availability
  * selected demo activity

This makes the demo easy to run without requiring a live database.

Production would move these records into Supabase/Postgres with server-side APIs, transactions, RLS, and audit logs.

---

## Auto-Calculation System

GlowGo calculates derived marketplace metrics from available demo data.

| Metric                | Source                                                           | Display                        |
| --------------------- | ---------------------------------------------------------------- | ------------------------------ |
| Final price           | Base price minus discount                                        | Service cards, booking         |
| Min/max/average price | Active services                                                  | Salon cards and detail pages   |
| Trust score           | Verification, rating, review count, completion, response signals | Salon cards and owner insights |
| Slot utilization      | Booked count vs capacity                                         | Owner dashboard                |
| Revenue               | Completed/confirmed bookings                                     | Owner/admin dashboards         |
| Average response time | Booking created to confirmed time                                | Salon badges                   |
| Top service/category  | Booking and service data                                         | Owner insights                 |
| Effective price       | Base price minus best applicable offer                           | Booking and service display    |

See:

```text
src/services/calculations.ts
```

---

## Key Design Decisions

* **Demo-local persistence:** Used for reliable judging without requiring external setup.
* **Verification-first onboarding:** New salons are treated as pending/under review, not instantly verified.
* **Public listing gate:** Public discovery and booking surfaces should show verified/bookable salons.
* **Service-aware scheduling:** Booking availability considers service duration and buffers instead of assuming every service fits into one hour.
* **Rule-based AI demo:** The AI assistant explains, ranks, and summarizes using stored demo data.
* **Role-aware access:** Customer, owner, and admin areas are separated through demo route guards.
* **Honest production roadmap:** Supabase, real OAuth, secure storage, maps, payments, and transactional scheduling are documented as future work unless fully implemented.

---

## Known Limitations

* Some data resets when browser storage or server memory is cleared.
* Authentication is browser-local demo auth, not production security.
* Document uploads capture file names only; files are not uploaded to secure storage.
* Google and Facebook OAuth are disabled in this submission build.
* Payments are not enabled.
* Real Google Maps embeds are not enabled.
* Supabase files exist, but the running app is not fully production-backed by Supabase yet.
* Group bookings are request-based and require salon confirmation.
* Smart Capacity Engine is demo-safe; it does not yet reserve every underlying continuous slot with database transactions.
* Named staff assignment, chair/room inventory calendars, payment holds, and no-show penalties are production roadmap features.

---

## Production Roadmap

* Supabase Auth with secure server sessions.
* Role-aware API authorization.
* Postgres persistence for users, salons, services, slots, bookings, offers, reviews, verification records, and AI logs.
* Row Level Security policies for customers, owners, admins, and service-role workflows.
* Supabase Storage or equivalent secure storage for verification documents.
* Server-side salon verification workflow with approvals, rejection reasons, resubmissions, and audit logs.
* Transactional booking writes with multi-slot reservation and booking holds.
* Staff assignment and resource-aware calendars.
* Group booking conflict resolution.
* Payment processing, refunds, deposits, and no-show policy enforcement.
* Real notification pipeline for booking updates and verification decisions.
* Real Google Maps integration.
* Real OAuth providers after secure callback and environment setup.
* Optional production LLM provider for AI recommendations and business insights.

---

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Manual Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable                        | Required for Demo | Required for Production | Description                     |
| ------------------------------- | ----------------: | ----------------------: | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |  Placeholder only |                     Yes | Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |  Placeholder only |                     Yes | Supabase anonymous key          |
| `SUPABASE_SERVICE_ROLE_KEY`     |                No |                     Yes | Server-side admin operations    |
| `OPENAI_API_KEY`                |                No |                Optional | Future LLM-backed AI features   |
| `ANTHROPIC_API_KEY`             |                No |                Optional | Alternative future LLM provider |

---

## Hackathon Submission Summary

GlowGo Mumbai is a multi-role salon marketplace and operations demo. It supports customer discovery, booking, offers, reviews, owner availability management, verification-aware onboarding, admin moderation-ready views, and a demo-safe Smart Capacity Engine for service-aware scheduling.

The project is intentionally honest about what is demo-local and what belongs in production. The current version focuses on a reliable hackathon judging flow while documenting the path toward Supabase-backed production architecture.

---

## License

MIT
