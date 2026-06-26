"use client"

import { usePathname } from "next/navigation"
import { GlowPublicHeader } from "@/components/glow-ui"

export function TopNav() {
  const pathname = usePathname()
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/design") ||
    pathname.startsWith("/aurelia-preview")
  ) {
    return null
  }

  return <GlowPublicHeader />
}
