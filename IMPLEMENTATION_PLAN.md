# GlowGo Mumbai Implementation Plan

Plan date: June 22, 2026

## Delivery Strategy

The recommended approach has two tracks:

1. **Demo-hardening track:** safe, incremental changes that make the existing product coherent, deterministic, and reliable without replacing the entire architecture.
2. **Production migration track:** Supabase Auth, Postgres persistence, server authorization, real AI, media, maps, and payments. This is a large rewrite boundary and requires approval before implementation.

No feature should claim live persistence, live AI, or production security until the production migration track is complete.

## 1. Critical Demo Blockers

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Add deterministic customer, owner, and admin demo accounts | `src/lib/auth-context.tsx`, new demo config, `README.md` | Fresh-browser login works reliably | Low | Yes |
| Add role-aware login/signup redirects | Auth pages and auth helpers | Each persona reaches the correct product area | Low | Yes |
| Guard dashboard, owner, and admin layouts | Three role layouts, auth helper/component | Prevents judges opening privileged screens anonymously | Medium | Yes |
| Fix booking client/API field contract | Booking page, booking route, shared schema/types | Time, mode, address, and amount remain correct | Medium | Yes |
| Repair prominent broken routes and dead CTAs | Salon page, AI cards, footer, owner/admin nav | Removes obvious 404s and nonresponsive buttons | Low | Yes |
| Replace or refresh expired offers | Canonical demo seed | Coupon and offer demo works on current dates | Low | Yes |
| Remove misleading random/live labels | AI, owner/admin analytics, dashboard copy | Makes the demo defensible and repeatable | Low | Yes |

Recommended first batch: demo auth, role routing/guards, and canonical route fixes. These are contained changes and establish reliable entry points before data work.

## 2. Broken Functionality

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Connect home search/category selections to Explore URL state | Home and Explore pages | Discovery happy path becomes real | Low | Yes |
| Correct service, range, and gender filters | Explore page and shared selectors | Search results match user choices | Low | Yes |
| Implement salon share, save, and all booking links | Salon page and favorite service | Major detail-page controls work | Low/Medium | Yes |
| Fix review creation and immediate UI update | Salon page, review form/service | Review submission no longer duplicates/disappears | Medium | Yes |
| Add login prompt and return flow to booking | Booking and login pages | Logged-out users can recover without losing intent | Medium | Yes |
| Validate home address, offer dates, and booking status copy | Booking page/schema | Prevents invalid or misleading confirmation | Low | Yes |
| Connect customer cancel/review actions | Dashboard bookings and repository/API | Dashboard manages real demo activity | Medium | After repository decision |
| Connect owner booking list to customer booking source | Owner bookings and repository | End-to-end booking appears in both personas | Medium | After repository decision |
| Persist owner salon edit instead of timeout success | Owner edit and repository | Owner changes are credible | Medium | After repository decision |
| Repair AI recommendation and booking links | AI card/message/page | AI journey reaches valid pages | Low | Yes |
| Add or remove missing user/legal/settings routes | Navigation and new simple routes | Eliminates 404s | Low | Yes |

## 3. Hardcoded and Mock Data Cleanup

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Create one canonical, versioned demo seed/config | `src/data`, new `src/config`/repository files | Makes hardcoded data explicit and internally consistent | Medium | Yes |
| Replace silent mock fallbacks with labeled empty/error states | Dashboard and feature data hooks | Failures no longer masquerade as success | Low | Yes |
| Derive dashboard identity and counts from current user/data | Dashboard pages/components | Customer persona is consistent | Low | Yes |
| Derive owner/admin metrics from canonical records | Calculation service and analytics pages | Values are stable and explainable | Medium | Yes |
| Centralize cities, categories, service modes, statuses, and URLs | Config/constants modules | Removes repeated strings and prevents drift | Low | Yes |
| Consolidate remote image metadata | Canonical seed and image config | Easier image optimization and replacement | Low | Yes |
| Remove unsupported marketing totals or label them as demo targets | Home/footer/admin copy | Prevents credibility challenges | Low | Yes |
| Move all durable records to Supabase | Repository, API/server code, schema/migrations | Real persistence and multi-user consistency | High | No—large rewrite |

For the demo-hardening track, a versioned local demo repository is acceptable only if the interface makes it replaceable and the UI does not call it live production data.

## 4. UI/UX Improvements

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Add branded loading, empty, error, and not-found states | App route groups and feature pages | Avoids blank/spinner-only failure modes | Low | Yes |
| Standardize original/final price presentation | Salon/service/booking components | Pricing is immediately understandable | Low | Yes |
| Add inline validation and submission feedback | Auth, booking, profile, owner forms | Forms feel complete and prevent errors | Medium | Yes |
| Disable or hide map/upload/export controls until implemented | Explore, owner, admin pages | Removes dead UI during the demo | Low | Yes |
| Correct nested navigation and page spacing | Root and role layouts | Prevents double navigation/padding | Medium | Yes |
| Complete mobile checks for filters, dialogs, tables, and sidebars | Feature layouts/components | Safer phone/tablet judging | Medium | Yes |
| Add confirmations for destructive actions | Owner/admin/customer dialogs | Prevents accidental demo data loss | Low | Yes |
| Run accessibility pass on icon controls and forms | Components and pages | Improves keyboard/screen-reader quality | Medium | Yes |

## 5. Code Quality Improvements

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Fix 50 lint errors before warning cleanup | Files reported by ESLint | Creates a trustworthy baseline | Medium | Yes, by feature |
| Remove unnecessary console logs and dead handlers | Dashboard, owner, API, utility files | Cleaner behavior and diagnostics | Low | Yes |
| Add shared Zod schemas for write operations | New schema modules, forms, API routes | Client/server validation stays aligned | Medium | Yes |
| Consolidate duplicated CRUD and AI description logic | Data/API/services | Prevents divergent behavior | Medium | Yes |
| Add calculation unit tests | Calculation service and test setup | Protects trust/revenue/offer fixes | Low | Yes |
| Add auth/booking happy-path integration tests | Test setup and key pages/routes | Protects the live demo journey | Medium | Yes |
| Confirm and remove unused components/dependencies | Referenced files, `package.json` | Reduces repository noise | Low | Yes, incrementally |
| Add CI for lint, type check, tests, and build | Workflow configuration | Prevents last-minute regressions | Low | Yes |

## 6. Performance Improvements

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Replace native images with `next/image` where appropriate | 14 current usages, Next config | Reduces layout shift and improves loading | Medium | Yes, incrementally |
| Remove render-time randomness and unstable timestamps | Analytics and calculations | Prevents hydration mismatch and visual changes | Low | Yes |
| Fix Recharts responsive-container prerender warnings | Chart components | Cleaner builds and stable chart rendering | Low | Yes |
| Self-host the primary font | Root layout and local font asset | Network-independent builds | Low | Yes |
| Move static composition out of client components | Public/role pages | Reduces client JavaScript | Medium/High | Later, incrementally |
| Enable Next.js standalone Docker output | Next config and Dockerfile | Smaller, safer runtime image | Low | Yes |

## 7. Security and Environment Variable Fixes

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Document current demo auth limitations explicitly | README and architecture docs | Prevents false production claims | Low | Yes |
| Keep all provider secrets server-only and validate startup config | Environment helper and server routes | Prevents accidental key exposure | Low | Yes |
| Add security headers and safe redirect handling | Next config and auth callback | Removes obvious web security defects | Medium | Yes |
| Repair SQL into ordered migrations and valid seeds | `supabase/` migrations/seeds | Makes production database reproducible | Medium | Yes as isolated groundwork |
| Define complete RLS/role ownership matrix | Supabase migrations and tests | Enforces data access at the database | High | No—part of migration |
| Add constraints and query-driven indexes | Supabase migrations | Protects integrity and performance | Medium | With migration approval |
| Upgrade vulnerable framework dependency safely | `package.json`, lockfile | Resolves moderate advisories | Medium | After compatible release verification |

## 8. Nice-to-Have Improvements

| Change | Files likely touched | Demo value | Risk | Safe now |
| --- | --- | --- | --- | --- |
| Real LLM recommendations with structured output | Server AI routes/services | Stronger AI narrative | High | No—requires provider and quota choice |
| Maps, geocoding, and distance search | Explore, database, external provider | Visually impressive discovery | High | No—provider/architecture decision |
| Media upload and moderation | Owner/review UI, storage, database | Completes owner content workflow | High | No—requires storage/security design |
| Payments and refunds | Booking, webhooks, database | Completes transaction flow | High | No—requires payment architecture |
| Notifications/email | Booking lifecycle and provider | Improves end-to-end realism | Medium | Later |
| PWA/offline behavior | App manifest/service worker | Extra demo polish | Medium | Later |
| Observability and product analytics | Server/app instrumentation | Production operations readiness | Medium | Later |

## Proposed Safe Implementation Sequence

### Batch 1: Reliable persona entry

- Seed deterministic demo users.
- Redirect by role.
- Guard role layouts.
- Fix logout/settings navigation.
- Verify clean-browser customer, owner, and admin entry.

### Batch 2: Customer happy path

- Wire home search into Explore.
- Correct filters and salon CTAs.
- Fix AI links.
- Fix booking contract, validation, offers, and confirmation.
- Verify discovery → salon → booking → dashboard.

### Batch 3: Coherent demo repository

- Introduce a versioned repository interface and canonical seed.
- Migrate favorites, reviews, bookings, owner data, and admin changes to it.
- Remove silent mock fallbacks and duplicate stores.
- Verify refresh behavior and cross-role consistency.

### Batch 4: Owner/admin credibility

- Connect owner bookings and metrics.
- Persist salon/services/offers/slots consistently.
- Replace random admin/owner analytics.
- Repair dead actions and missing navigation.

### Batch 5: Quality and polish

- Resolve lint errors, then warnings in touched features.
- Add calculation and critical-flow tests.
- Add error/loading/not-found states.
- Fix images, charts, accessibility, font builds, and Docker output.

### Batch 6: Production migration, after approval

- Repair Supabase migrations and seed.
- Implement Supabase Auth and server sessions.
- Replace demo repository with Postgres.
- Add server authorization and RLS tests.
- Introduce real AI/storage/maps/payments as separately scoped integrations.

## Large Rewrites Requiring Approval

The following will not be started without explicit confirmation because each changes the architecture, deployment requirements, or external-service scope:

- Full Supabase Auth and database migration.
- Replacement of all demo/local stores with a server repository.
- Real LLM provider integration.
- Real maps/geocoding.
- Media upload/storage and moderation.
- Payment processing.
- Major route-group/layout restructuring if it affects all screens.

## Verification Standard for Every Batch

After each meaningful change:

1. Run lint and isolate new findings from the existing baseline.
2. Run a production build when routing, types, configuration, or shared components change.
3. Exercise the affected user journey at runtime.
4. Review the scoped Git diff and preserve unrelated user changes.
5. Report exactly what changed, what was verified, and what remains.

No commits or pushes will be made without the requested workflow. If commits are requested, they will be small and atomic, and `git add .` will not be used.
