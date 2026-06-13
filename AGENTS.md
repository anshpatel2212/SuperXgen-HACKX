# GlowGo Mumbai — AI-Powered Salon Marketplace

## Project Overview
GlowGo Mumbai is a full-stack beauty salon marketplace with AI-powered discovery, auto-calculated metrics, and a multi-step owner onboarding system. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, and Supabase.

## Architecture
- **Frontend**: Next.js 16 App Router with client components ("use client")
- **UI Library**: shadcn/ui with base-nova style and @base-ui/react primitives
- **Styling**: Tailwind CSS v4 with CSS custom properties in oklch() color space
- **Data Layer**: In-memory arrays (src/data/index.ts) with local storage fallback
- **Calculations Engine**: src/services/calculations.ts — computes all derived metrics
- **Auth**: localStorage-based (src/lib/auth-context.tsx) — uses AuthUser interface
- **AI Service**: src/services/ai.ts — rule-based engine connected to live data

## Key Patterns
- All pages use "use client" directive
- Components use shadcn/ui base-nova style (CVA + data-slot + CSS custom properties)
- Brand colors: glowgo-pink (#db2777), glowgo-lavender (#a78bfa), glowgo-cream (#fef3c7)
- Currency: Indian Rupee (₹) formatting via Intl.NumberFormat('en-IN')
- Path alias: @/ maps to ./src/*

## Critical Files
- `src/types/index.ts` — All TypeScript interfaces including SalonMetrics, PlatformMetrics
- `src/services/calculations.ts` — Auto-calculation engine (final_price, trust_score, revenue, etc.)
- `src/services/ai.ts` — AI service with live data context
- `src/lib/data-service.ts` — CRUD operations with auto-calculation integration
- `src/lib/store.ts` — In-memory stores (bookings, favorites, slots, reviews)
- `src/components/onboarding/OnboardingWizard.tsx` — Multi-step owner onboarding

## Owner Pages (New)
- `/owner/onboarding` — Multi-step wizard for salon setup
- `/owner/slots` — Availability slot management with weekly calendar
- `/owner/offers` — Offers & promotions CRUD
- `/owner/ai-helper` — AI content generation (descriptions, taglines, SEO)
- `/owner/insights` — AI-driven business analysis and recommendations

## Build & Run
```bash
npm run dev    # Development
npm run build  # Production build
npm run start  # Start production server
```
