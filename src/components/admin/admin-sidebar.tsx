"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Store,
  FolderTree,
  MessageSquare,
  BarChart3,
  Users,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/salons", label: "Salons", icon: Store },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
]

interface AdminSidebarProps {
  onNavClick?: () => void
}

export function AdminSidebar({ onNavClick }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-1 bg-[#201717] py-4 text-[#fffaf5]">
      <div className="mb-6 px-4">
        <Link href="/admin" onClick={onNavClick}>
          <h2 className="font-heading text-lg font-semibold">Trust Command</h2>
          <p className="text-[11px] text-[#cbbab4]">GlowGo Mumbai</p>
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "group flex min-h-11 items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold transition-all",
                isActive
                  ? "bg-[#fff8dc] text-[#7d5b17] shadow-sm"
                  : "text-[#cbbab4] hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8f6b25]" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
