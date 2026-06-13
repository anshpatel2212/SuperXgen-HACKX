"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { DashboardSidebar, DashboardMobileToggle } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userName="Priya Sharma"
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
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-glowgo-rose" />
              </Button>
              <Avatar className="w-7 h-7 cursor-pointer">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white text-[10px]">
                  PS
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
