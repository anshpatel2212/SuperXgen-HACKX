"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Calendar, Heart, User, Sparkles,
  LogOut, Settings, ChevronLeft, Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { cn, getInitials } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/preferences", label: "Beauty Preferences", icon: Sparkles },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
  userName?: string
  userAvatar?: string
}

export function DashboardSidebar({ isOpen, onToggle, userName = "Priya Sharma", userAvatar }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#31231f] bg-[#201717] text-[#fffaf5] transition-transform duration-300 lg:static lg:min-h-screen lg:h-auto lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff8dc] text-[#8f6b25]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold">
              GlowGo
            </span>
          </Link>
          <Button variant="ghost" size="icon-xs" onClick={onToggle} className="lg:hidden">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={userAvatar || ""} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-[#cbbab4]">Customer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle()
                }}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#fff8dc] text-[#7d5b17]"
                    : "text-[#cbbab4] hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/dashboard/settings"
            className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-[#cbbab4] transition-all hover:bg-white/10 hover:text-white"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-[#cbbab4] transition-all hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export function DashboardMobileToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} className="lg:hidden">
      <Menu className="w-5 h-5" />
    </Button>
  )
}
