"use client"

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { GlowAppShell, GlowCard } from "@/components/glow-ui"

export default function OnboardingPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) redirect("/login")
  if (user.role !== "owner") redirect("/")

  return (
    <GlowAppShell className="px-4 py-6">
      <div className="mx-auto mb-6 max-w-4xl">
        <GlowCard className="p-5 text-left sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8ccff] bg-[#f5f1ff] px-4 py-1.5 text-sm font-semibold text-[#6550a8]">
            Salon Autopilot setup
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#201717] md:text-4xl">
            Set up a verified Mumbai salon listing.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f5d56]">
            Complete business details, services, policies, safety declarations, and verification information. GlowGo calculates prices, trust score, and metrics automatically.
          </p>
        </GlowCard>
      </div>
      <OnboardingWizard />
    </GlowAppShell>
  )
}
