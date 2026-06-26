import { Tag } from "lucide-react"
import { GlowTrustBadge, GlowTrustPassport as GlowTrustPassportCard } from "@/components/glow-ui"
import { cn } from "@/lib/utils"
import type { Salon, Service } from "@/types"

export function TrustPassportMini({
  salon,
  className,
}: {
  salon?: Salon
  className?: string
}) {
  const verifiedLabel = salon?.verified ? "Demo verified" : "Draft / incomplete"

  return (
    <div className={cn("flex gap-1.5 overflow-x-auto pb-1 scrollbar-none", className)}>
      <GlowTrustBadge label={verifiedLabel} tone={salon?.verified ? "green" : "neutral"} />
      <GlowTrustBadge label="Hygiene declared" tone="gold" />
      <GlowTrustBadge label="Policy-backed" tone="lavender" />
      <GlowTrustBadge label={(salon?.review_count || 0) > 0 ? "Reviews synced" : "Review status demo"} tone="neutral" />
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
  return <GlowTrustPassportCard salon={salon} service={service} compact={compact} className={className} />
}

export function TrustPassportSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlowTrustPassportCard />
      </div>
    </section>
  )
}

export function PolicyNotice({ service }: { service?: Service | null }) {
  return (
    <div className="rounded-2xl border border-[#e3c87b] bg-[#fff8dc] p-4 text-sm text-[#6f5d17]">
      <div className="flex items-start gap-3">
        <Tag className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold text-[#201717]">Policy-backed booking</p>
          <p className="mt-1 text-xs leading-relaxed">
            Please arrive within 10 minutes. Arrivals after 20 minutes may require rescheduling to protect later bookings.
            {service ? ` ${service.name} uses a ${service.duration_minutes}-minute service duration before buffers.` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
