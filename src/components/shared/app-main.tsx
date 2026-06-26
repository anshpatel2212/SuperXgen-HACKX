"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function usesPrivateShell(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  )
}

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <main className={cn("flex-1", usesPrivateShell(pathname) ? "" : "pt-16")}>
      {children}
    </main>
  )
}
