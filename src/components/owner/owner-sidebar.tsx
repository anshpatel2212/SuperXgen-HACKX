"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Store,
  Scissors,
  CalendarCheck,
  BarChart3,
  Clock,
  Tag,
  Sparkles,
  Lightbulb,
  Plus,
} from "lucide-react"

const navItems = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/salons", label: "My Salons", icon: Store },
  { href: "/owner/services", label: "Services", icon: Scissors },
  { href: "/owner/slots", label: "Availability", icon: Clock },
  { href: "/owner/offers", label: "Offers", icon: Tag },
  { href: "/owner/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/owner/ai-helper", label: "AI Content", icon: Sparkles },
  { href: "/owner/insights", label: "Insights", icon: Lightbulb },
  { href: "/owner/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/owner/onboarding", label: "Add Salon", icon: Plus },
]

interface OwnerSidebarProps {
  onNavClick?: () => void
}

export function OwnerSidebar({ onNavClick }: OwnerSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-1 py-4">
      <div className="mb-6 px-4">
        <Link href="/owner" onClick={onNavClick}>
          <h2 className="font-heading text-lg font-semibold">
            <span className="gradient-text">Salon Owner</span>
          </h2>
          <p className="text-[11px] text-muted-foreground">GlowGo Mumbai</p>
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/owner"
              ? pathname === "/owner"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-glowgo-pink/10 to-glowgo-lavender/10 text-glowgo-rose shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  isActive && "text-glowgo-rose"
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-glowgo-pink to-glowgo-lavender" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
