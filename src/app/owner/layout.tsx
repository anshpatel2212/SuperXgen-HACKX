"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/auth/role-guard"
import { useAuth } from "@/lib/auth-context"
import { OwnerSidebar } from "@/components/owner/owner-sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Menu, LogOut, User, Settings } from "lucide-react"
import { SALONS } from "@/data"
import { getInitials } from "@/lib/utils"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const ownerSalons = SALONS.filter((s) => s.owner_id === (user?.id || ""))
  const [selectedSalon, setSelectedSalon] = useState("")
  const activeSalon = selectedSalon || ownerSalons[0]?.id || ""

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-glowgo-cream/30">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-glowgo-pink" />
      </div>
    )
  }

  return (
    <RoleGuard requiredRole="owner">
      <div className="flex min-h-screen bg-glowgo-cream/30">
        <aside className="hidden w-60 shrink-0 border-r bg-background md:block">
          <OwnerSidebar />
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg size-7 hover:bg-muted hover:text-foreground transition-colors">
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <OwnerSidebar onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block">
            {ownerSalons.length > 0 ? (
              <Select value={activeSalon} onValueChange={(v) => v && setSelectedSalon(v)}>
                <SelectTrigger size="sm" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ownerSalons.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-xs text-muted-foreground">No salons yet. Create your first salon.</span>
            )}
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
                aria-label="Open owner account menu"
              >
                <Avatar size="sm">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "Owner"} />
                  <AvatarFallback>{user?.full_name ? getInitials(user.full_name) : "OW"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user?.full_name || "Owner"}</DropdownMenuLabel>
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

          <main className="flex-1 px-4 pb-4 pt-4 md:px-6 md:pb-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}
