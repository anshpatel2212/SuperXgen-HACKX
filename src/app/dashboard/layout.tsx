"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"
import { DashboardSidebar, DashboardMobileToggle } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { getInitials } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const userName = user?.full_name || "Customer"

  return (
    <RoleGuard requiredRole="customer">
      <div className="min-h-screen bg-background">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          userName={userName}
          userAvatar={user?.avatar_url}
        />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="flex items-center gap-3">
                <DashboardMobileToggle onClick={() => setSidebarOpen(true)} />
                <div className="hidden sm:flex items-center text-xs text-gray-400">
                  <span className="text-gray-600">Dashboard</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled
                  aria-label="Notifications unavailable in demo"
                  title="Notifications are planned after the demo"
                >
                  <Bell className="w-4 h-4 text-gray-600" />
                </Button>
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user?.avatar_url || ""} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white text-[10px]">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
