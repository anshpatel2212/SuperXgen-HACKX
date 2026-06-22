# GlowGo Mumbai Project Walkthrough

Audit date: June 22, 2026

## Executive Summary

GlowGo Mumbai is a polished hackathon prototype for salon discovery, booking, owner operations, administration, and AI-assisted recommendations. Its visual coverage is broad and the repository contains enough domain modeling to support a strong demo.

The current implementation is not yet a production full-stack application. Most runtime data comes from TypeScript arrays, browser `localStorage`, or process-memory stores. Supabase packages, schema files, and environment variables exist, but the application does not use Supabase for authentication or persistence. The AI experience is a deterministic keyword/rules engine rather than an external model integration.

The safest near-term objective is to make the demo internally consistent, remove broken paths and misleading states, and establish one coherent data flow. Migrating all authentication and persistence to Supabase is a valuable follow-up, but it is a larger architectural change that should be approved separately.

## 1. What This Project Is

GlowGo Mumbai is a multi-role beauty marketplace focused on Mumbai. It provides:

- Customer salon discovery, filtering, detail pages, booking, favorites, reviews, and an AI assistant.
- Salon-owner onboarding, salon/service management, slots, offers, bookings, analytics, and AI content helpers.
- Administrative dashboards for platform metrics, salons, categories, reviews, and analytics.
- A domain calculation layer for prices, trust scores, booking metrics, revenue, and platform summaries.

The project is currently best described as a feature-rich interactive prototype. It has production-oriented concepts, but its authentication, persistence, authorization, data integrity, and operational behavior are still demo implementations.

## 2. Main Features Currently Present

### Customer experience

- Marketing home page with featured salons, categories, testimonials, and search presentation.
- Salon exploration with city, category, price, rating, service, gender, and sorting controls.
- Salon detail pages with services, offers, reviews, amenities, staff, gallery, and booking entry points.
- Multi-step booking UI for service, date/time, service mode, address, coupon, and confirmation.
- Customer dashboard pages for overview, bookings, favorites, profile, preferences, and recommendations.
- Rule-based AI chat and salon recommendations.

### Owner experience

- Multi-step salon onboarding.
- Owner dashboard with operational metrics.
- Salon profile and service management.
- Availability slot and offer management.
- Booking list and status controls.
- Analytics, insights, and AI-generated content screens.

### Admin experience

- Platform overview.
- Salon approval presentation.
- Category management presentation.
- Review moderation presentation.
- Analytics and charts.

### Platform/domain layer

- Salon, service, offer, review, booking, slot, and user TypeScript models.
- Derived metrics and pricing calculations.
- API route prototypes for salons, bookings, favorites, reviews, and AI operations.
- Supabase SQL schema and seed artifacts.

## 3. Tech Stack Used

| Area | Technology |
| --- | --- |
| Framework | Next.js 16.2.9, App Router |
| Language | TypeScript |
| UI | React 19.2.4 |
| Styling | Tailwind CSS v4, CSS variables using `oklch()` |
| Components | shadcn/ui base-nova style, Base UI primitives |
| Charts | Recharts |
| Icons | Lucide React |
| Forms installed | React Hook Form and Zod, currently unused |
| Data currently used | TypeScript arrays, `localStorage`, in-memory module stores |
| Database packages | Supabase JS and Supabase SSR, not connected to runtime flows |
| AI currently used | Local deterministic rule-based service |
| Containerization | Docker and Docker Compose |

Important compatibility note: the installed Next.js package requires Node.js `>=20.9.0`, while the README currently says Node.js 18+.

## 4. Folder-by-Folder Explanation

### `src/app`

Contains all App Router pages, layouts, and route handlers.

- Public routes: home, explore, salon details, booking, authentication, and AI assistant.
- Customer routes: `/dashboard/*`.
- Owner routes: `/owner/*`.
- Admin routes: `/admin/*`.
- API routes: `/api/salons`, `/api/bookings`, `/api/favorites`, `/api/reviews`, and `/api/ai/*`.

The root layout always renders the public top navigation and footer. Nested dashboard layouts then add their own navigation, which creates duplicated navigation and spacing on authenticated screens.

### `src/components`

Feature and UI components grouped by role or domain:

- `admin`: admin navigation and management views.
- `ai`: chat messages, recommendation cards, and prompt UI.
- `booking`: booking progress and summary components.
- `dashboard`: customer dashboard navigation.
- `onboarding`: owner onboarding wizard and steps.
- `owner`: owner navigation, cards, dialogs, and forms.
- `salon`: salon cards, reviews, offers, and service displays.
- `shared`: cross-feature components such as navigation and branding.
- `ui`: shadcn-style component primitives.

Several feature components are no longer referenced and should be confirmed and removed or reused.

### `src/data`

`src/data/index.ts` is the primary dataset. It contains the salon marketplace catalog and supporting entities:

- 8 salons
- 26 services
- 10 reviews
- 5 offers
- categories, testimonials, and related display content

This file is currently the effective application database for many public screens.

### `src/lib`

- `auth-context.tsx`: browser-only authentication and user storage.
- `data-service.ts`: CRUD-like helpers that mutate imported arrays or in-memory stores.
- `store.ts`: process-memory bookings, favorites, slots, reviews, and AI history.
- `supabase.ts`: Supabase client creation, currently unused by application features.
- General utilities and shared helpers.

### `src/services`

- `calculations.ts`: derives pricing, trust scores, revenue, booking metrics, offer metrics, and platform metrics.
- `ai.ts`: rule-based AI response and recommendation logic.
- `ai-prompt-templates.ts`: prompt-related code that appears unused.

### `supabase`

Contains SQL schema and seed files intended for a production database. They are not currently migrations and cannot be executed successfully in their present order and data form.

### `public`

Static assets, including default framework SVGs. Salon and content imagery is primarily loaded from remote URLs rather than this folder.

### Root configuration

- `package.json`: dependencies and dev/build/lint scripts.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript and `@/*` alias configuration.
- `components.json`: shadcn/ui configuration.
- `Dockerfile` and `docker-compose.yml`: container build and local orchestration.
- `.env.local.example`: Supabase and optional AI variable examples.
- `README.md`: setup and feature overview, currently inconsistent with runtime behavior.

## 5. Important Files and What They Do

| File | Responsibility | Current concern |
| --- | --- | --- |
| `src/types/index.ts` | Core domain interfaces | Types do not enforce runtime validation |
| `src/data/index.ts` | Main salon catalog and demo records | Large hardcoded database substitute |
| `src/services/calculations.ts` | Derived marketplace metrics | Several scoring/date edge cases are incorrect |
| `src/services/ai.ts` | AI chat and recommendation behavior | Local rules only; some claims imply live AI |
| `src/lib/auth-context.tsx` | Login, signup, session, and user persistence | Plaintext browser passwords and no server security |
| `src/lib/data-service.ts` | Client data access and mutation helpers | Duplicates API logic and mutates static data |
| `src/lib/store.ts` | In-memory mutable records | Data disappears on restart and differs by process |
| `src/lib/supabase.ts` | Supabase browser client | Not used |
| `src/app/api/bookings/route.ts` | Booking API prototype | Contract differs from booking UI and lacks auth |
| `src/app/explore/page.tsx` | Discovery and filtering | Ignores URL filters and has incomplete map/loading behavior |
| `src/app/salon/[id]/page.tsx` | Salon detail and reviews | Dead actions and incorrect review/favorite behavior |
| `src/app/booking/[id]/page.tsx` | Booking flow | Fixed slots and incomplete persistence |
| `src/components/onboarding/OnboardingWizard.tsx` | Owner salon setup | Partial validation and volatile persistence |
| `src/app/owner/layout.tsx` | Owner navigation shell | No reliable route guard or shared salon context |
| `src/app/admin/layout.tsx` | Admin navigation shell | Publicly accessible |
| `supabase/schema.sql` | Intended relational schema | Ordering, trigger, RLS, and index defects |
| `supabase/seed.sql` | Intended database seed | Invalid UUIDs and unresolved auth user dependencies |

## 6. Current User Flow

### Customer

1. User lands on the home page.
2. User browses featured salons or opens Explore.
3. Explore filters the local salon array.
4. User opens a salon by ID.
5. User selects a service and enters the booking page.
6. Booking UI collects date, time, mode, address, and optional coupon.
7. The client posts to the booking API, which stores a different subset of fields in process memory.
8. Customer dashboard displays API data or falls back to mock records.

Current breakpoints:

- Home search values are not carried into Explore.
- Category links do not apply URL filters.
- Several salon Book buttons do nothing.
- Booking silently stops for logged-out users.
- The UI/API field mismatch changes submitted booking details.
- Dashboard mock fallback can hide failed or empty data.

### Owner

1. User signs up or logs in.
2. All roles currently redirect to the customer dashboard.
3. Owner manually navigates to `/owner`.
4. Existing owner data is matched by hardcoded owner IDs.
5. A newly registered owner usually has no matching salon and must find onboarding manually.
6. Onboarding and owner CRUD mutate local runtime data, which does not survive a refresh or server restart.

Current breakpoints:

- Auth hydration can leave owner pages permanently loading or empty.
- New owners cannot inherit demo salon data.
- Salon edits present success but do not persist.
- Owner bookings and analytics are separate mock datasets.
- Navigation includes a missing `/owner/salons/new` route.

### Admin

1. Anyone can directly open `/admin`.
2. Dashboard and management screens display static or locally mutated data.
3. Changes disappear on refresh.

Current breakpoints:

- No authentication or role authorization.
- `/admin/users` is linked but does not exist.
- Analytics are random/hardcoded and exports do nothing.

### AI assistant

1. User enters a natural-language salon request.
2. Client-side keyword rules search current arrays.
3. The interface renders text and recommendation cards.

Current breakpoints:

- Recommendation links use slugs while salon pages resolve IDs.
- Booking recommendation links target a nonexistent route.
- Cards can be rendered twice.
- Markdown-like output is shown as raw punctuation.
- “Live” and “verified” wording overstates the source quality.

## 7. What Works

- Production build completes successfully when network access is available for Google font retrieval.
- All 38 existing application routes compile.
- Public salon catalog pages render from the static dataset.
- Core filtering, sorting, and salon detail lookup work for common cases.
- Calculation helpers generate many useful derived values.
- API route prototypes can create and retrieve process-memory records.
- Main layouts and UI components provide a consistent visual language.
- Owner onboarding, service, offers, and slots screens contain substantial interaction design.
- Admin and analytics screens are visually demoable.
- TypeScript models cover the main marketplace entities.
- Docker uses Node.js 22, which satisfies the installed Next.js requirement.

## 8. What Does Not Work or Is Incomplete

### Functional

- Authentication is not secure or server-backed.
- Admin and customer dashboard routes have no effective authorization.
- Owner route protection is inconsistent.
- Fresh browsers cannot use the README demo credentials.
- Role-based redirects are missing.
- Booking request fields do not match API fields.
- Real availability, capacity, overbooking prevention, and payment are absent.
- Favorite and review behavior is inconsistent across pages and stores.
- Multiple visible buttons and links have no action or target missing routes.
- Owner/admin edits are not durable.
- Search URL state and map view are incomplete.
- AI recommendation links are broken.

### Operational

- `npm run lint` reports 225 issues: 50 errors and 175 warnings.
- There are no automated tests.
- There are no route-level loading, error, or not-found boundaries.
- Build output reports Recharts dimensions of `-1` during prerendering.
- Google font retrieval makes clean builds depend on network availability.
- `npm audit` reports two moderate vulnerabilities through Next.js's bundled PostCSS dependency.

### Database

- Supabase is not used by runtime flows.
- Schema and seed files are not safely runnable.
- Row-level security coverage and permissions are incomplete.
- Important foreign-key indexes and constraints are missing.

## 9. What Looks Hardcoded

- The full salon, service, review, offer, category, and testimonial catalog.
- Dashboard names, avatars, counts, bookings, and favorites.
- Owner booking records and many owner metrics.
- Admin analytics and random chart values.
- Fixed booking time slots.
- Mumbai cities/areas and service/category options.
- Marketing claims such as “500+ salons” and “10,000+ customers,” despite an 8-salon dataset.
- Expired 2025 offers displayed in 2026.
- Remote image URLs distributed across data and components.
- Rule-based AI responses and prompt matching.
- Timeout-based forgot-password and salon-edit success.
- Settings/profile links and empty actions.

Hardcoded demo seed data is acceptable when it is centralized, labeled, internally consistent, and replaceable. The current issue is that hardcoded data is spread across several independent stores and presented as live state.

## 10. What Is Missing for Demo Readiness

Highest-value demo hardening:

- Working seeded demo accounts for customer, owner, and admin roles.
- Role-aware login redirects and route guards.
- One coherent, persistent demo data source.
- Correct booking payload, confirmation state, coupon handling, and address validation.
- Working salon, favorite, review, and AI recommendation links.
- Removal or repair of dead buttons and missing routes.
- Honest labels for demo analytics and AI-generated content.
- Deterministic metrics instead of random values.
- Loading, error, and empty states for primary flows.
- Removal of current lint errors in demo-critical files.
- A rehearsed happy path that survives refresh and repeated use.

## 11. Biggest Risks Before the Demo

1. **Unauthorized access:** judges can open admin and owner pages directly.
2. **Booking data corruption:** submitted time, mode, and address can be stored incorrectly.
3. **Broken navigation:** prominent AI, owner, footer, and booking links lead to 404s or do nothing.
4. **Fresh-session failure:** documented demo accounts do not exist until users create them locally.
5. **Data disappearance:** owner/admin edits and API records vanish on refresh, restart, or another deployment instance.
6. **Misleading output:** “live” AI/data labels, random analytics, and inflated statistics may undermine credibility.
7. **Stale dates:** all current offers are expired as of June 22, 2026.
8. **Live-demo instability:** owner auth hydration bugs can leave screens empty or loading forever.
9. **Quality signal:** 50 lint errors and no tests make last-minute changes risky.
10. **Database migration risk:** attempting a full Supabase switch immediately could destabilize the existing demo.

## 12. Recommended Improvement Roadmap

### Stage 1: Stabilize the demo

- Add coherent seeded demo roles and role-based navigation.
- Protect dashboard, owner, and admin routes.
- Fix broken routes, links, buttons, and booking contracts.
- Centralize and version demo persistence.
- Make empty/loading/error states explicit.
- Replace random and expired display values with deterministic current demo data.

### Stage 2: Unify application behavior

- Establish a repository/service boundary used by pages and APIs.
- Remove duplicate mutable stores and silent mock fallbacks.
- Validate every write with Zod.
- Connect offers, slots, favorites, reviews, bookings, and analytics to the same source.
- Add unit tests for calculations and integration tests for the main demo journeys.

### Stage 3: Production data and auth

- Repair and convert SQL into ordered Supabase migrations.
- Implement Supabase Auth and server-side session checks.
- Add role and ownership authorization in middleware/server code and RLS.
- Move catalog and transactional records into Postgres.
- Add required constraints, indexes, audit fields, and idempotent seeds.

This is a large rewrite boundary and should be approved before implementation.

### Stage 4: Production integrations

- Connect a real AI provider with server-only keys, structured responses, safety controls, and rate limiting.
- Add object storage for salon/review media.
- Add maps/geocoding and proximity search.
- Add payment or payment-intent workflow.
- Add observability, structured logs, analytics, backups, and deployment health checks.

### Stage 5: Polish and scale

- Convert suitable screens to Server Components.
- Optimize images and fonts.
- Add route metadata, accessibility review, security headers, and performance budgets.
- Complete responsive and browser testing.
- Establish CI for lint, type checks, tests, build, and dependency review.
