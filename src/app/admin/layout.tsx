"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Menu, LogOut, User, Settings, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getInitials } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex min-h-screen bg-[#fffaf5] text-[#201717]">
        <aside className="hidden w-64 shrink-0 border-r border-[#31231f] bg-[#201717] md:block">
          <AdminSidebar />
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#ead8c5] bg-white/88 px-4 backdrop-blur-xl">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg size-9 hover:bg-muted hover:text-foreground transition-colors md:hidden">
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-[#31231f] bg-[#201717] p-0">
              <AdminSidebar onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white">
              <Shield className="size-3" />
              Admin
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Notifications unavailable in demo"
              disabled
              title="Notifications are planned after the demo"
            >
              <Bell className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center rounded-full size-7 hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Open admin account menu"
              >
                <Avatar size="sm">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "Admin"} />
                  <AvatarFallback>{getInitials(user?.full_name || "Admin")}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user?.full_name || "Admin"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </header>

          <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}
