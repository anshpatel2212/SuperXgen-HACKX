# GlowGo Mumbai Project Audit

Audit date: June 22, 2026

Priority definitions:

- **High:** can break, misrepresent, or materially weaken the live demo.
- **Medium:** important quality, maintainability, accessibility, or production-readiness issue.
- **Low:** cleanup or polish with limited demo risk.

Effort estimates are relative to this repository:

- **Small:** a focused change, usually under half a day.
- **Medium:** coordinated changes across a feature.
- **Large:** architectural work or migration requiring explicit approval.

## Authentication, Authorization, and Security

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| `src/lib/auth-context.tsx` | Security | Stores passwords and full sessions in browser `localStorage` | Any script running on the origin can read credentials; no server trust boundary exists | Replace with Supabase Auth and secure server session handling; label current mode as demo until migrated | High | Large |
| `src/lib/auth-context.tsx` | Demo blocker | No seeded demo users exist in a fresh browser | README credentials fail during a clean judging session | Add centralized, deterministic demo accounts now; remove them when production auth is enabled | High | Small |
| `src/lib/auth-context.tsx` | Data integrity | Random signup user IDs do not match demo salon owner IDs | Newly registered owners cannot manage existing salons | Use coherent seeded IDs in demo mode; use database ownership relations in production | High | Small |
| `src/app/(auth)/login/page.tsx` | Broken flow | Every role redirects to `/dashboard` | Owners and admins land in the wrong product area | Redirect by user role | High | Small |
| `src/app/(auth)/signup/page.tsx` | Broken flow | Owner signup redirects to the customer dashboard | Onboarding is hidden and the owner journey appears incomplete | Redirect owners to onboarding and customers to dashboard | High | Small |
| `src/app/dashboard/layout.tsx` | Authorization | Customer dashboard has no route guard | Anonymous users can open private-looking screens | Add an auth/loading guard and role-appropriate redirect | High | Small |
| `src/app/owner/layout.tsx` | Authorization | Owner layout has no reliable owner-role guard | Anonymous/customer users can inspect owner screens | Add centralized role guard and stable loading state | High | Small |
| `src/app/admin/layout.tsx` | Authorization | Admin area is publicly accessible | Anyone can view and operate administrative UI | Require an authenticated admin role at the layout/server boundary | High | Small |
| `src/app/api/**/route.ts` | API security | Routes trust body/query user IDs and have no authentication | Users can read or mutate another user's records | Resolve identity from a server session and enforce ownership/role checks | High | Large |
| `src/app/api/ai/**/route.ts` | Abuse protection | AI endpoints have no auth, validation, or rate limits | Production provider integration would be easy to abuse | Add schema validation, request limits, and server-side quotas | Medium | Medium |
| `src/app/(auth)/callback/route.ts` | Auth correctness | Does not exchange a Supabase auth code and accepts an arbitrary `next` path | OAuth cannot complete safely; redirect behavior may be abused | Use Supabase SSR callback exchange and restrict redirects to same-origin known paths | High | Medium |
| `src/app/(auth)/forgot-password/page.tsx` | Fake functionality | Uses a timeout instead of a reset workflow | UI reports an action that never sends a reset email | Integrate provider reset flow or explicitly mark as demo | Medium | Medium |
| `.env.local.example`, `README.md` | Configuration | AI and Supabase environment variable documentation is inconsistent | Setup is confusing and may encourage incorrect secret placement | Define one canonical environment contract and document public versus server-only variables | Medium | Small |
| `next.config.ts` | Security | No explicit security headers or CSP | Production deployment lacks basic browser hardening | Add a tested header policy appropriate for remote images and scripts | Medium | Medium |

## Data Flow, APIs, and Persistence

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| `src/data/index.ts` | Hardcoded data | Acts as the main database for salons, services, reviews, and offers | Updates are not durable and scale poorly | Centralize as a versioned demo seed now; migrate to Supabase repository later | High | Large |
| `src/lib/store.ts` | Volatile state | Mutable module arrays disappear on restart and vary by server instance | Serverless/multi-instance behavior is inconsistent | Use a durable repository; for demo mode use one explicit client persistence layer | High | Large |
| `src/lib/data-service.ts` | Duplicated logic | Mutates imported arrays separately from API route stores | UI and API can disagree about the same entity | Introduce a single repository interface used by all feature services | High | Medium |
| `src/app/api/bookings/route.ts`, `src/app/booking/[id]/page.tsx` | Contract bug | UI sends `start_time`, `is_home_service`, and `home_address`; API expects different names | Confirmed details are silently replaced with defaults | Define and validate one booking request schema shared by client and server | High | Small |
| `src/app/api/bookings/route.ts` | Data integrity | Does not validate salon/service relationships, slot capacity, or duplicate bookings | Invalid and overlapping bookings can be created | Validate foreign relationships and reserve a real slot transactionally | High | Large |
| `src/app/api/bookings/route.ts` | Incomplete persistence | Coupon, discount, final amount, slot, and end time are not persisted | Receipt and analytics cannot match the UI | Persist calculated booking snapshot and applied-offer fields | High | Medium |
| `src/app/api/bookings/route.ts` | Status handling | PATCH omits notes and status timestamps | Booking history and audit data are inaccurate | Validate transitions and set confirmed/completed/cancelled timestamps | Medium | Small |
| `src/lib/data-service.ts`, `src/app/api/salons/[id]/route.ts` | Contract bug | Client expects composite salon data and PATCH support that the route does not provide | Calls will fail or return an unexpected shape | Align typed route responses and implement or remove unsupported mutations | High | Medium |
| `src/lib/data-service.ts`, `src/app/api/salons/route.ts` | Incomplete search | Client sends `q`, API ignores it | Search behaves differently depending on access path | Share filtering/search logic and validate parameters | Medium | Small |
| `src/app/api/favorites/route.ts` | Authorization | Accepts arbitrary `user_id` values | Any caller can alter another user's favorites | Use authenticated identity and a unique user/salon constraint | High | Medium |
| `src/app/api/reviews/route.ts`, `src/lib/store.ts` | Initialization bug | Review state depends on an unrelated module side effect | API data can differ based on import order | Initialize the repository explicitly and deterministically | Medium | Small |
| `src/app/api/ai/recommend/route.ts` | Global mutation | Sorts the imported `SALONS` array in place | Later requests can see changed catalog ordering | Sort a copied array | Medium | Small |
| `src/lib/supabase.ts` | Unused integration | Supabase client exists but no feature uses it | Gives a false impression of connected persistence and adds dependency weight | Either implement the repository with Supabase or remove until migration | Medium | Large |
| `src/app/api/**/route.ts` | Validation | Write routes rely on TypeScript casts rather than runtime schemas | Malformed input can enter stores or crash handlers | Add Zod schemas and normalized error responses | High | Medium |
| `src/app/api/**/route.ts` | Error handling | Errors are mostly unstructured console output | Debugging and UI recovery are difficult | Add typed error responses, request IDs, and appropriate status codes | Medium | Medium |

## Customer Discovery, Salon, and Booking

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| `src/app/page.tsx` | Dead form | Hero city and search inputs are ignored | Primary call to action does not perform the entered search | Submit values as validated Explore query parameters | High | Small |
| `src/app/explore/page.tsx` | Broken navigation | Does not read URL category/search parameters | Home category links appear to work but do not filter | Initialize and synchronize filters from `searchParams` | High | Small |
| `src/app/explore/page.tsx` | Incorrect filtering | Service filter checks salon descriptions instead of service records | Valid salons can be excluded or irrelevant salons included | Join salon IDs to the service dataset for filtering | High | Small |
| `src/app/explore/page.tsx` | Incomplete UI | Map view only toggles an icon; no map is rendered | A visible feature control does not work | Hide/disable with explanation or implement an actual map | High | Small/Large |
| `src/app/explore/page.tsx` | Loading state | `isLoading` never represents an async operation | Skeleton/loading UI is misleading | Remove fake loading or connect it to real data fetching | Medium | Small |
| `src/app/explore/page.tsx` | Filter logic | Price overlap and gender rules are inconsistent, including unisex handling | Users miss relevant salons | Normalize range-overlap and inclusive gender behavior | Medium | Small |
| `src/app/salon/[id]/page.tsx` | Dead actions | Share and multiple Book Now controls have no behavior | Prominent calls to action fail during a demo | Implement Web Share/copy fallback and route all booking buttons correctly | High | Small |
| `src/app/salon/[id]/page.tsx` | Persistence | Favorite state is local-only | Saved salons disappear and dashboard cannot reflect them | Connect to the shared favorite repository and require login where needed | High | Medium |
| `src/app/salon/[id]/page.tsx` | Pricing display | Original and discounted prices are visually reversed in places | Users can misunderstand the actual charge | Standardize a reusable price display component | High | Small |
| `src/app/salon/[id]/page.tsx` | Review bug | Creating a review can append it twice, while props do not update | Duplicate or invisible submissions undermine trust | Use one mutation path and refresh/update one source of truth | High | Small |
| `src/app/salon/[id]/page.tsx` | Dead review controls | Photo upload, helpful, and report controls do nothing | UI promises unsupported actions | Implement, disable with explanation, or remove from demo | Medium | Small |
| `src/app/salon/[id]/page.tsx` | Availability | Displays a fixed time list unrelated to owner slots | Customers can book unavailable times | Query shared availability and disable unavailable/full slots | High | Large |
| `src/app/booking/[id]/page.tsx` | Auth UX | Confirm silently returns when no user exists | Users receive no explanation or route to login | Show login requirement and preserve return URL/booking draft | High | Small |
| `src/app/booking/[id]/page.tsx` | Validation | Home-service address is not required | Invalid bookings can be submitted | Add mode-dependent schema validation and inline errors | High | Small |
| `src/app/booking/[id]/page.tsx` | Offer validation | Coupon logic does not enforce validity dates consistently | Expired discounts may be applied | Validate active flag and date interval in one service | High | Small |
| `src/app/booking/[id]/page.tsx` | Status mismatch | Completion UI says confirmed while API creates pending | Customer sees a false booking state | Use one status definition and accurate confirmation copy | High | Small |
| `src/data/index.ts` | Stale content | Current offers expired in 2025 | Offer cards and coupons are invalid on June 22, 2026 | Use relative demo dates or current valid seed records | High | Small |
| `src/components/shared/footer.tsx` | Broken links | Several links use `#` or target missing `/booking`, `/terms`, and `/privacy` routes | Footer navigation produces dead ends and 404s | Add routes or remove/replace unsupported links | High | Small |

## Dashboard, Owner, and Admin

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| `src/app/dashboard/**` | Fake user data | Hardcodes “Priya Sharma,” avatar initials, counts, bookings, and favorites | Logged-in identity and activity are misleading | Derive all display state from the authenticated user and repository | High | Medium |
| `src/app/dashboard/**` | Silent fallback | Failed/empty requests fall back to populated mock records | Broken data access looks successful | Show explicit empty and error states; use labeled demo seed only | High | Small |
| `src/app/dashboard/bookings/page.tsx` | Dead actions | Cancel and review actions only log to the console | Core customer management flow is nonfunctional | Connect status mutation and review routing/dialog | High | Medium |
| `src/components/dashboard/dashboard-sidebar.tsx` | Dead navigation | Logout does nothing and Settings points home | Basic account navigation fails | Wire logout and route to actual preferences/profile settings | High | Small |
| `src/app/dashboard/profile/page.tsx` | Validation/UI | Weak validation and dead photo controls | Invalid details appear saved and controls mislead users | Add schema validation and remove/implement upload controls | Medium | Medium |
| `src/app/dashboard/preferences/page.tsx` | Data usage | Saves unversioned preferences that AI does not consume | Personalized recommendation claim is not true | Version/validate preferences and use them in recommendation ranking | Medium | Medium |
| `src/app/owner/page.tsx` | Loading bug | Loading can remain forever for absent/non-owner users | Demo can stall on a blank spinner | Resolve auth state explicitly and redirect/show onboarding | High | Small |
| `src/app/owner/salons/page.tsx`, `src/app/owner/services/page.tsx` | Hydration bug | State initializes before auth and does not reliably resynchronize | Existing owners can see empty records | Derive data after auth or synchronize from a shared repository/context | High | Small |
| `src/app/owner/layout.tsx` | State fragmentation | Salon selector state is not shared with child pages | Navigation selection does not control displayed salon | Add owner workspace context or URL-based salon selection | Medium | Medium |
| `src/app/owner/layout.tsx` | Dead UI | Bell, profile, and settings actions do nothing | Visible dashboard controls fail | Route or remove unsupported controls | Medium | Small |
| `src/components/owner/owner-sidebar.tsx` | Broken route | Links to nonexistent `/owner/salons/new` | Primary create action returns 404 | Route to onboarding or add the page | High | Small |
| `src/app/owner/salons/[id]/edit/page.tsx` | Fake save | Waits and redirects without updating the salon | User loses edits while seeing apparent success | Call validated update repository and surface errors | High | Medium |
| `src/app/owner/salons/[id]/edit/page.tsx` | Dead media controls | Upload areas are nonfunctional | Form appears more complete than it is | Integrate storage or clearly disable for demo | Medium | Small/Large |
| `src/components/owner/service-form-dialog.tsx` | Stale state | Form does not reliably reset when edit target changes | One service's data can appear in another edit | Reset on open/entity ID and validate with a schema | High | Small |
| `src/app/owner/bookings/page.tsx` | Disconnected data | Uses a separate hardcoded booking list | Customer bookings never reach the owner | Read and mutate the shared booking repository | High | Medium |
| `src/app/owner/analytics/page.tsx` | Fake analytics | Uses random/hardcoded chart data; range/export controls do nothing | Values change between renders and are not credible | Calculate deterministic metrics; implement or remove controls | High | Medium |
| `src/app/owner/offers/page.tsx` | Validation | Missing robust date/order/value validation and safe deletion | Invalid offers can be created accidentally | Add schema validation and confirmation | Medium | Small |
| `src/app/owner/slots/page.tsx` | Data integrity | No service/date/time/overlap validation | Owners can create unusable or conflicting slots | Validate intervals and capacity against bookings | High | Medium |
| `src/components/onboarding/OnboardingWizard.tsx` | Incomplete validation | Can launch without services and drops collected pincode | New salon data is incomplete | Validate every step and persist every collected field | High | Medium |
| `src/app/admin/**` | Volatile management | Approvals, categories, and moderation are local-only | Admin actions disappear on refresh | Connect to the shared repository/database | High | Large |
| `src/components/admin/admin-sidebar.tsx` | Broken route | Links to missing `/admin/users` | Admin navigation has a visible 404 | Add a users page or remove the link | High | Small |
| `src/app/admin/analytics/page.tsx` | Fake analytics | Random/static metrics and dead export | Dashboard cannot be defended as live data | Derive deterministic metrics and label seed data accurately | High | Medium |
| `src/app/admin/**` | Dead actions | Profile, settings, signout, notifications, view, and export actions are incomplete | Admin shell feels unfinished during interaction | Wire supported actions and hide unsupported ones | Medium | Medium |

## AI and Calculation Logic

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| `src/services/ai.ts` | Misleading capability | “AI” is deterministic keyword matching over local arrays | Product claims can be challenged by judges | Label it as a recommendation engine or integrate a server-side model | High | Small/Large |
| `src/services/ai.ts` | Personalization | `getPersonalizedRecommendations(userId)` ignores the user ID | Personalized results are not personalized | Incorporate validated preferences, favorites, and history | Medium | Medium |
| `src/components/ai/recommendation-card.tsx` | Broken links | Uses salon slug for an ID route and links booking to nonexistent `/booking?salon=` | Both primary actions can fail | Generate canonical salon and booking URLs from salon ID | High | Small |
| `src/app/ai-assistant/page.tsx`, `src/components/ai/chat-message.tsx` | Duplicate UI | Recommendations can render in both message and page sections | Cards repeat and clutter results | Choose one rendering owner | Medium | Small |
| `src/components/ai/chat-message.tsx` | Rendering | Displays markdown markers as plain text | Responses look unfinished | Render a constrained safe message format or generate plain text | Medium | Small |
| `src/app/ai-assistant/page.tsx` | Trust/copy | Claims current/live/verified results while source data is static and stale | Overpromising damages credibility | Use accurate “demo catalog” wording until live integrations exist | High | Small |
| `src/services/calculations.ts` | Scoring bug | Rating reaches maximum trust contribution around 2.5 stars | Low-rated salons can receive excessive trust score | Scale rating against the full five-star range | High | Small |
| `src/services/calculations.ts` | Scoring bug | Review count normalization requires an unexpectedly high count for full points | Score weights do not match apparent intent | Define explicit threshold and add tests | Medium | Small |
| `src/services/calculations.ts` | Edge case | No confirmations can produce zero response time and “Lightning Fast” | Missing data is rewarded as perfect performance | Represent unavailable response time separately | High | Small |
| `src/services/calculations.ts` | Date logic | Slot utilization targets next Monday rather than the displayed/current period | Owner availability metrics can be wrong | Pass an explicit date range into calculations | Medium | Small |
| `src/services/calculations.ts` | Offer logic | Active offer count includes expired records | Dashboard reports invalid promotions | Apply current-date validity checks | High | Small |
| `src/services/calculations.ts` | Stability | Metrics IDs/timestamps can be regenerated during rendering | Causes non-deterministic output and potential hydration issues | Generate stable IDs at persistence time, not calculation/render time | Medium | Small |

## Supabase Schema and Database Readiness

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/schema.sql` | Migration ordering | Tables/triggers reference `salons`, `bookings`, or `offers` before creation | Schema execution fails | Split into ordered, idempotent migrations | High | Medium |
| `supabase/schema.sql` | Trigger bug | Booking metric trigger uses `NEW.salon_id` for DELETE operations | DELETE has no `NEW` row and can fail | Use `COALESCE(NEW.salon_id, OLD.salon_id)` with operation-aware logic | High | Small |
| `supabase/seed.sql` | Invalid data | IDs such as `s100`, `sv...`, and `r...` are inserted into UUID columns | Seed execution fails immediately | Use valid deterministic UUIDs | High | Small |
| `supabase/seed.sql` | Auth dependency | Public users reference `auth.users` records that the seed does not create | Foreign-key inserts fail | Use a supported local seed workflow or separate auth fixture setup | High | Medium |
| `supabase/schema.sql` | RLS coverage | Some tables/policies are missing or do not permit required user actions | Features fail or expose unintended records | Define role/ownership matrix for every operation and table | High | Large |
| `supabase/schema.sql` | RLS performance | Policies repeatedly call `auth.uid()` and use admin subqueries per row | Queries degrade as data grows | Use `(select auth.uid())`, indexed ownership columns, and security-definer helpers where appropriate | Medium | Medium |
| `supabase/schema.sql` | Public data policy | Broad read policies can expose inactive services or unapproved salons | Moderation status is bypassed | Scope public reads through approved/active parent records | High | Small |
| `supabase/schema.sql` | Missing indexes | Several foreign-key/filter columns lack covering indexes | Booking, review, favorite, and availability queries will slow down | Add indexes based on actual query patterns | Medium | Small |
| `supabase/schema.sql` | Missing constraints | Status transitions, date intervals, capacities, and price relationships are weakly enforced | Invalid data remains possible despite UI validation | Add check/unique constraints and transaction-safe booking rules | High | Medium |
| `src/data/index.ts`, `supabase/seed.sql` | Seed divergence | TypeScript and SQL contain unrelated demo datasets | Switching data sources changes the entire demo | Establish one canonical seed and generate/import it consistently | Medium | Medium |

## Code Quality, UX, Accessibility, and Operations

| File path | Issue type | Current problem | Why it is bad | Suggested fix | Priority | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| Repository-wide | Lint | 50 lint errors and 175 warnings | Hides real regressions and weakens confidence in changes | Fix errors first, then warnings by feature; enforce in CI | High | Medium |
| Repository-wide | Tests | No unit, integration, or end-to-end tests | Critical booking and metric regressions are undetected | Add calculation tests and happy-path auth/booking tests | High | Medium |
| `src/app` | Error UX | No `error.tsx`, `loading.tsx`, `not-found.tsx`, or global error boundary | Failures produce generic or abrupt behavior | Add branded boundaries for primary route groups | Medium | Small |
| `src/app/layout.tsx`, nested layouts | Layout architecture | Public nav/footer wrap dashboard, owner, and admin shells | Duplicated navigation and spacing can appear | Use route groups with separate public and application shells | Medium | Medium |
| `src/app/**`, `src/components/**` | Client bundle | Approximately 62 files opt into `"use client"` | More JavaScript, hydration work, and client-side data coupling | Move static/read-only composition to Server Components incrementally | Medium | Large |
| Repository-wide | Images | 14 native `<img>` usages | Misses Next.js image sizing and optimization; can cause layout shift | Use `next/image` with configured remote patterns where appropriate | Medium | Medium |
| `src/app/layout.tsx` | Build determinism | Google font is fetched during clean builds | Network-restricted CI/builds fail | Self-host the font or ensure controlled build caching | Medium | Small |
| Chart pages | Rendering | Recharts logs `width(-1)`/`height(-1)` during prerender | Indicates unstable responsive container sizing | Render after measured mount or provide stable minimum dimensions | Medium | Small |
| Owner/admin analytics | Hydration | Random values are generated during rendering | Server/client output can differ and values change on refresh | Remove randomness from render and use deterministic data | High | Small |
| Native icon buttons | Accessibility | Many icon-only controls lack accessible names | Keyboard and screen-reader use is impaired | Add labels, focus states, and semantic controls | Medium | Medium |
| Forms repository-wide | Validation | Installed React Hook Form/Zod are not used; many forms validate ad hoc | Errors are inconsistent and invalid data slips through | Adopt shared Zod schemas and accessible inline feedback | High | Medium |
| Repository-wide | Dead code | Multiple components/services and default assets appear unused | Increases maintenance burden and search noise | Confirm via references, then remove in small commits | Low | Small |
| `package.json` | Dependencies | Several installed packages appear unused | Larger install surface and more audit exposure | Remove only after reference and build verification | Low | Small |
| `README.md` | Documentation | Claims Supabase/live AI/full-stack behavior not present at runtime | Judges and contributors receive inaccurate expectations | Document demo mode, actual architecture, and production roadmap | High | Small |
| `README.md` | Compatibility | Says Node.js 18+ while Next.js requires `>=20.9.0` | Local setup can fail | Require Node.js 20.9+ or 22 LTS | Medium | Small |
| `Dockerfile` | Deployment size | Runtime image installs full dependencies and app is not configured for standalone output | Image is larger and contains unnecessary tooling | Enable standalone output and copy minimal runtime artifacts | Low | Medium |
| Dependency tree | Vulnerabilities | `npm audit` reports two moderate issues through Next.js/PostCSS | Known dependency risk remains | Track the upstream fixed release and upgrade after compatibility verification | Medium | Small |

## Baseline Verification Results

- `npm run lint`: failed with 225 findings (50 errors, 175 warnings).
- `npm run build`: passed when network access was available.
- Generated routes: 38.
- Build warnings: four Recharts responsive-container dimension warnings.
- `npm audit --json`: two moderate findings, no high or critical findings.
- Runtime checks:
  - `/admin`: HTTP 200 without authentication.
  - `/owner`: HTTP 200 without authentication.
  - `/admin/users`: HTTP 404.
  - `/owner/salons/new`: HTTP 404.
  - `/booking`: HTTP 404.
  - `/terms`: HTTP 404.
  - `/privacy`: HTTP 404.
- Booking API verification confirmed the UI/API field mismatch: submitted time, service mode, and address were replaced by route defaults.
