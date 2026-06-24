"use client"

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"

export default function OnboardingPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) redirect("/login")
  if (user.role !== "owner") redirect("/")

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          🚀 Launch Your Salon on GlowGo Mumbai
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome to GlowGo Mumbai
        </h1>
        <p className="text-gray-500">
          Set up your salon in minutes. We&apos;ll calculate your prices, trust score, and metrics automatically.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  )
}
