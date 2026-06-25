"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, CalendarDays, Compass, Home, LayoutDashboard, MessageSquare, MoreHorizontal, Scissors, Settings, ShieldCheck, Store, UserRound } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const customerItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/ai-assistant", label: "AI Stylist", icon: Bot },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
]

const ownerItems = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/owner/slots", label: "Slots", icon: Store },
  { href: "/owner/services", label: "Services", icon: Scissors },
  { href: "/owner/onboarding", label: "More", icon: MoreHorizontal },
]

const adminItems = [
  { href: "/admin", label: "Dashboard", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: UserRound },
  { href: "/admin/salons", label: "Salons", icon: Store },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/analytics", label: "More", icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/salon/") ||
    pathname.startsWith("/owner/onboarding")
  ) {
    return null
  }

  const items =
    user?.role === "owner" ? ownerItems :
    user?.role === "admin" ? adminItems :
    customerItems

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-glowgo-border bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 shadow-[0_-12px_35px_rgba(17,24,39,0.10)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-medium transition-colors",
                active ? "bg-glowgo-soft text-glowgo-pink" : "text-gray-500"
              )}
            >
              <Icon className="mb-0.5 h-4 w-4" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
