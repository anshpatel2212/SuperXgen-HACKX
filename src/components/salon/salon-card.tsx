"use client"

import { GlowSalonCard } from "@/components/glow-ui"
import type { Salon } from "@/types"

interface SalonCardProps {
  salon: Salon
  variant?: "default" | "compact"
  compareSelected?: boolean
  onCompare?: (salon: Salon) => void
}

export function SalonCard(props: SalonCardProps) {
  return <GlowSalonCard {...props} />
}
