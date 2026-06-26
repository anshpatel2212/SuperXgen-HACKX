import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  FileCheck2,
  LayoutDashboard,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UserCheck,
} from "lucide-react"
import {
  GlowAppShell,
  GlowButton,
  GlowCard,
  GlowHero,
  GlowMetricCard,
  GlowSalonCard,
  GlowSection,
  GlowSmartCapacityPanel,
  GlowTrustBadge,
  GlowTrustPassport,
} from "@/components/glow-ui"
import { HomeSearch } from "@/components/home/home-search"
import { SALONS, SERVICES } from "@/data"
import { getPublicSalons } from "@/lib/public-salons"
import { formatPrice } from "@/lib/utils"

const publicSalons = getPublicSalons(SALONS, SERVICES)
const featuredSalons = publicSalons.filter((salon) => salon.featured)
const fallbackFeaturedSalons = [
  ...featuredSalons,
  ...publicSalons.filter((s) => !featuredSalons.some((fs) => fs.id === s.id)),
].slice(0, 4)
const trustSalon = fallbackFeaturedSalons[0]
const minPrice = Math.min(
  ...SERVICES.filter((service) => service.active && service.final_price > 0).map((service) => service.final_price)
)

export default function HomePage() {
  return (
    <GlowAppShell>
      <GlowHero
        badge="Verified salons · Smart booking · Mumbai"
        title="Book verified Mumbai salons with smart, conflict-aware scheduling."
        copy="Discover trusted salons, compare services, book available time blocks, and make every appointment fit real salon capacity."
        primaryHref="/explore"
        primaryLabel="Explore Salons"
        secondaryHref="/login"
        secondaryLabel="Try Demo Accounts"
        visual={<SmartBookingOrbit />}
      />

      <section className="relative -mt-8 z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3">
          <GlowMetricCard
            label="Verified demo salons"
            value={publicSalons.length}
            detail="Approved and complete listings only"
            icon={<BadgeCheck className="h-5 w-5" />}
            tone="green"
          />
          <GlowMetricCard
            label="Bookable services"
            value={SERVICES.filter((service) => service.active && service.final_price > 0).length}
            detail={`From ${Number.isFinite(minPrice) ? formatPrice(minPrice) : "transparent pricing"}`}
            icon={<Scissors className="h-5 w-5" />}
            tone="rose"
          />
          <GlowMetricCard
            label="Trust workflow"
            value="8 checks"
            detail="Owner, policy, hygiene, reviews"
            icon={<ShieldCheck className="h-5 w-5" />}
            tone="gold"
          />
        </div>
      </section>

      <GlowSection
        eyebrow="Search / explore"
        title="Start with service, area, or trust signal."
        copy="The same live demo catalog powers search, compare, booking, owner dashboards, and admin moderation."
        actions={<GlowButton href="/explore" icon={<ArrowRight className="h-4 w-4" />}>Open Explore</GlowButton>}
      >
        <GlowCard className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <HomeSearch />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {["Bandra bridal", "Powai spa", "Andheri grooming"].map((item) => (
              <Link
                key={item}
                href={`/explore?q=${encodeURIComponent(item)}`}
                className="flex min-h-12 items-center justify-between rounded-2xl border border-[#ead8c5] bg-[#fffdf9] px-4 text-sm font-semibold text-[#4b3a36] transition-colors hover:border-[#d7b982]"
              >
                {item}
                <ArrowRight className="h-4 w-4 text-[#8f6b25]" />
              </Link>
            ))}
          </div>
        </GlowCard>
      </GlowSection>

      <GlowSection
        eyebrow="Featured verified salons"
        title="Image-led cards with trust, pricing, and compare actions."
        copy="Only complete demo-verified public salons are shown. Draft or malformed owner listings stay out of public discovery."
        actions={<GlowButton href="/explore" variant="secondary">View all salons</GlowButton>}
        className="bg-[#fffdf9]"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackFeaturedSalons.map((salon) => (
            <GlowSalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      </GlowSection>

      <GlowSection
        eyebrow="Trust Passport"
        title="Trust is visible before the booking button."
        copy="GlowGo labels this demo honestly while showing the production-grade checks customers and salon teams expect."
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          {trustSalon && <GlowTrustPassport salon={trustSalon} />}
          <GlowCard className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <GlowTrustBadge label="Verified owner" tone="green" icon={<UserCheck className="h-4 w-4" />} />
              <GlowTrustBadge label="Document status" tone="gold" icon={<FileCheck2 className="h-4 w-4" />} />
              <GlowTrustBadge label="Reviews synced" tone="lavender" />
              <GlowTrustBadge label="Policy-backed booking" tone="green" icon={<CalendarCheck className="h-4 w-4" />} />
              <GlowTrustBadge label="Late policy protected" tone="neutral" icon={<Clock className="h-4 w-4" />} />
              <GlowTrustBadge label="Admin-reviewed status" tone="gold" />
            </div>
            <p className="mt-5 text-sm leading-6 text-[#6f5d56]">
              Public wording remains honest: demo-local salons show demo trust status, while incomplete owner-created salons are
              treated as drafts until verification and setup are complete.
            </p>
          </GlowCard>
        </div>
      </GlowSection>

      <GlowSection
        eyebrow="Smart Capacity"
        title="Bookings respect duration, buffers, chairs, and staff."
      >
        <GlowSmartCapacityPanel />
      </GlowSection>

      <GlowSection
        eyebrow="Operations"
        title="Salon Autopilot for owner teams."
        copy="Owner pages become a quiet cockpit for verification, today's bookings, slots, services, reviews, setup, and AI helper tasks."
        className="bg-[#fffdf9]"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <GlowCard className="overflow-hidden p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#201717] text-[#f4b740]">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[#201717]">Owner operations teaser</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5d56]">
                  View trust score, today&apos;s appointments, slot utilization, services, offers, and setup checklist without technical language.
                </p>
                <GlowButton href="/owner" className="mt-5" icon={<LayoutDashboard className="h-4 w-4" />}>
                  Open Owner Cockpit
                </GlowButton>
              </div>
            </div>
          </GlowCard>

          <GlowCard className="overflow-hidden p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff8dc] text-[#8f6b25]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[#201717]">Admin verification command center</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5d56]">
                  Review users by role, salon verification status, review moderation, offers, and platform stats in mobile-friendly cards.
                </p>
                <GlowButton href="/admin" variant="secondary" className="mt-5" icon={<ShieldCheck className="h-4 w-4" />}>
                  Open Admin
                </GlowButton>
              </div>
            </div>
          </GlowCard>
        </div>
      </GlowSection>
    </GlowAppShell>
  )
}

function SmartBookingOrbit() {
  const chips = [
    { label: "Verified owner", className: "left-2 top-8" },
    { label: "75 min service", className: "right-2 top-24" },
    { label: "2 chairs free", className: "left-4 bottom-24" },
    { label: "Reviews synced", className: "right-4 bottom-14" },
    { label: "Late policy protected", className: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" },
  ]

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22.25rem] overflow-hidden sm:max-w-[31rem]">
      <div className="absolute inset-6 rounded-full border border-[#d9bd79]/45" />
      <div className="absolute inset-16 rounded-full border border-dashed border-[#a78bfa]/45" />
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#201717] px-3 text-center text-xs font-semibold text-[#fff8dc] shadow-[0_30px_80px_rgba(32,23,23,0.28)] sm:h-28 sm:w-28 sm:text-sm">
        Smart Orbit
      </div>

      {chips.map((chip) => (
        <div
          key={chip.label}
          className={`absolute max-w-[9.5rem] rounded-2xl border border-white/80 bg-white/88 px-2.5 py-2 text-[11px] font-semibold leading-tight text-[#4b3a36] shadow-[0_18px_45px_rgba(45,29,24,0.10)] backdrop-blur sm:max-w-none sm:px-3 sm:text-xs ${chip.className}`}
        >
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#db2777]" />
          {chip.label}
        </div>
      ))}

      <GlowCard className="absolute bottom-4 left-1/2 w-[84%] -translate-x-1/2 p-3 sm:w-[76%] sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8f6b25]">Today 4:30 PM</p>
            <p className="mt-1 text-xs font-semibold text-[#201717] sm:text-sm">Facial + buffer</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            Available
          </span>
        </div>
      </GlowCard>

      <div className="absolute right-10 top-2 rounded-full bg-[#fff8dc] px-3 py-1 text-xs font-semibold text-[#7d5b17] shadow-sm">
        <Star className="mr-1 inline h-3 w-3 fill-current" />
        4.8 trust
      </div>
    </div>
  )
}
