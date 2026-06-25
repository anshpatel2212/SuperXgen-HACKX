import {
  BadgeCheck,
  Clock,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Timer,
  WalletCards,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Salon, Service } from "@/types"

type TrustTone = "success" | "gold" | "info" | "neutral"

const toneClasses: Record<TrustTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  gold: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-violet-200 bg-violet-50 text-violet-700",
  neutral: "border-gray-200 bg-white text-gray-700",
}

function getTrustItems(salon?: Salon, service?: Service | null) {
  const hasReviews = (salon?.review_count || 0) > 0
  const hasGallery = Boolean((salon?.gallery?.length || 0) + (salon?.images?.length || 0) || salon?.cover_url || salon?.cover_image)
  const policy = salon?.cancellation_policy || "Policy shown before booking"
  const duration = service
    ? `${service.duration_minutes} min service${(service.buffer_before_minutes || service.buffer_after_minutes) ? " + buffer" : ""}`
    : "Service duration checked"

  return [
    {
      icon: BadgeCheck,
      label: salon?.verified ? "Demo verified owner" : "Verification under review",
      detail: salon?.verified ? "Owner and listing are approved in the demo catalog." : "Visible as a pending/non-public workspace draft.",
      tone: salon?.verified ? "success" as const : "gold" as const,
    },
    {
      icon: FileCheck2,
      label: salon?.status === "featured" ? "Admin featured" : "Business details submitted",
      detail: "Business profile, representative, and policy fields are captured during onboarding.",
      tone: "info" as const,
    },
    {
      icon: ShieldCheck,
      label: "Hygiene declaration",
      detail: salon?.hygiene_practices?.length ? salon.hygiene_practices.slice(0, 2).join(", ") : "Safety declaration required before verification.",
      tone: "success" as const,
    },
    {
      icon: Star,
      label: hasReviews ? "Reviews synced" : "Review confidence pending",
      detail: hasReviews ? `${salon?.review_count} demo reviews visible across customer, owner, and admin views.` : "New salon with review history still building.",
      tone: hasReviews ? "gold" as const : "neutral" as const,
    },
    {
      icon: WalletCards,
      label: "Price transparency",
      detail: salon?.price_range ? `${salon.price_range} shown before booking.` : "Service price shown before confirmation.",
      tone: "neutral" as const,
    },
    {
      icon: Timer,
      label: duration,
      detail: "GlowGo checks continuous availability and service buffers before showing bookable times.",
      tone: "info" as const,
    },
    {
      icon: Clock,
      label: "Late policy protected",
      detail: policy,
      tone: "gold" as const,
    },
    {
      icon: Sparkles,
      label: hasGallery ? "Portfolio available" : "Portfolio pending",
      detail: hasGallery ? "Salon media is available with safe image fallback." : "Gallery can be completed in owner onboarding.",
      tone: hasGallery ? "success" as const : "neutral" as const,
    },
  ]
}

export function TrustPassportMini({
  salon,
  className,
}: {
  salon?: Salon
  className?: string
}) {
  const chips = [
    salon?.verified ? "Demo verified" : "Under review",
    "Hygiene declared",
    "Policy-backed",
    (salon?.review_count || 0) > 0 ? "Reviews synced" : "New reviews",
  ]

  return (
    <div className={cn("flex gap-1.5 overflow-x-auto pb-1 scrollbar-none", className)}>
      {chips.map((chip, index) => (
        <Badge
          key={chip}
          variant="outline"
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            index === 0 ? toneClasses.success : "border-glowgo-border bg-white/80 text-gray-600"
          )}
        >
          {chip}
        </Badge>
      ))}
    </div>
  )
}

export function TrustPassport({
  salon,
  service,
  compact = false,
  className,
}: {
  salon?: Salon
  service?: Service | null
  compact?: boolean
  className?: string
}) {
  const items = getTrustItems(salon, service)
  const visibleItems = compact ? items.slice(0, 4) : items

  return (
    <Card className={cn("premium-card overflow-hidden", className)}>
      <CardContent className={cn("space-y-4", compact ? "p-4" : "p-5 sm:p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-2 border-0 bg-glowgo-gold/20 text-amber-700">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              GlowGo Trust Passport
            </Badge>
            <h3 className={cn("font-bold text-gray-950", compact ? "text-base" : "text-xl")}>
              Trust before booking.
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Demo verification, policy, review, and service-fit signals are shown before a customer commits.
            </p>
          </div>
          <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
            Demo-local status
          </div>
        </div>

        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={cn("rounded-xl border p-3", toneClasses[item.tone])}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.label}</p>
                    {!compact && <p className="mt-1 text-xs leading-relaxed opacity-80">{item.detail}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-2 border-t border-glowgo-border/70 pt-4 text-xs text-gray-500">
            <span className="rounded-full bg-white px-3 py-1">Admin-reviewed status</span>
            <span className="rounded-full bg-white px-3 py-1">Cancellation and late policy</span>
            <span className="rounded-full bg-white px-3 py-1">Capacity-aware booking</span>
            <span className="rounded-full bg-white px-3 py-1">Price visible before submit</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TrustPassportSection() {
  const items = [
    ["Verified owner", "Identity and listing status are visible before booking."],
    ["Document status", "Business details and verification fields are part of onboarding."],
    ["Hygiene declaration", "Safety declarations are captured for trust review."],
    ["Review confidence", "Reviews sync across customer, owner, and admin views."],
    ["Price transparency", "Customers review service price and offer discounts upfront."],
    ["Late/cancellation policy", "Policy expectations are shown before confirmation."],
  ]

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-3 border-0 bg-glowgo-gold/20 text-amber-700">GlowGo Trust Passport</Badge>
          <h2 className="text-2xl font-bold text-gray-950 sm:text-4xl">Trust before booking.</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
            GlowGo shows verification, policies, reviews, and service-fit signals before a customer commits.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([title, copy], index) => (
            <div key={title} className="premium-card p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  index % 3 === 0 && "bg-emerald-50 text-emerald-600",
                  index % 3 === 1 && "bg-violet-50 text-violet-600",
                  index % 3 === 2 && "bg-amber-50 text-amber-600"
                )}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{copy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PolicyNotice({ service }: { service?: Service | null }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <Tag className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold text-gray-950">You are booking a policy-backed salon.</p>
          <p className="mt-1 text-xs leading-relaxed">
            Please arrive within 10 minutes. Arrivals after 20 minutes may require rescheduling to protect later bookings.
            {service ? ` ${service.name} uses a ${service.duration_minutes}-minute service duration before buffers.` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
