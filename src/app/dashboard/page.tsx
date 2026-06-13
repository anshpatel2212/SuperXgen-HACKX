"use client"

import Link from "next/link"
import { Calendar, Heart, MessageSquare, Sparkles, ArrowRight, Star, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn, formatDate, formatTime, formatPrice, getInitials, getStatusColor } from "@/lib/utils"
import { SALONS, SERVICES } from "@/data"

const MOCK_BOOKINGS = [
  {
    id: "b1",
    salonId: "1",
    serviceId: "s1",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    status: "confirmed" as const,
    amount: 800,
  },
  {
    id: "b2",
    salonId: "4",
    serviceId: "s12",
    date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    time: "14:30",
    status: "confirmed" as const,
    amount: 2500,
  },
  {
    id: "b3",
    salonId: "2",
    serviceId: "s6",
    date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    time: "11:00",
    status: "completed" as const,
    amount: 20000,
  },
  {
    id: "b4",
    salonId: "7",
    serviceId: "s21",
    date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    time: "16:00",
    status: "completed" as const,
    amount: 999,
  },
  {
    id: "b5",
    salonId: "5",
    serviceId: "s15",
    date: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    time: "15:00",
    status: "cancelled" as const,
    amount: 999,
  },
]

export default function DashboardOverview() {
  const upcomingBookings = MOCK_BOOKINGS.filter((b) => b.status === "confirmed").length
  const completedBookings = MOCK_BOOKINGS.filter((b) => b.status === "completed").length
  const recentBookings = MOCK_BOOKINGS.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Priya!</h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your beauty journey.</p>
        </div>
        <Link href="/booking/1">
          <Button className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Book a Salon
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Calendar}
          label="Total Bookings"
          value={MOCK_BOOKINGS.length}
          iconBg="bg-glowgo-pink/10"
          iconColor="text-glowgo-pink"
          trend={{ value: "+2 this month", positive: true }}
        />
        <StatCard
          icon={Calendar}
          label="Upcoming"
          value={upcomingBookings}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          icon={Heart}
          label="Favorites"
          value={8}
          iconBg="bg-red-50"
          iconColor="text-red-400"
          trend={{ value: "+3 this week", positive: true }}
        />
        <StatCard
          icon={MessageSquare}
          label="Reviews Written"
          value={completedBookings}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm" className="text-xs text-glowgo-pink">
                    View All
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.map((booking) => {
                const salon = SALONS.find((s) => s.id === booking.salonId)
                const service = SERVICES.find((s) => s.id === booking.serviceId)
                const statusColor = getStatusColor(booking.status)
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={salon?.logo_url || ""} alt={salon?.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(salon?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{salon?.name}</p>
                      <p className="text-xs text-gray-500">{service?.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(booking.date)} at {formatTime(booking.time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("text-[10px] capitalize", statusColor)}>
                        {booking.status}
                      </Badge>
                      <p className="text-xs font-medium text-gray-900 mt-1">{formatPrice(booking.amount)}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/booking/1">
                <Button variant="outline" className="w-full justify-start h-9 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-glowgo-pink" />
                  Book a Salon
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full justify-start h-9 text-sm">
                  <Bot className="w-4 h-4 mr-2 text-glowgo-lavender" />
                  Explore AI Assistant
                </Button>
              </Link>
              <Link href="/dashboard/preferences">
                <Button variant="outline" className="w-full justify-start h-9 text-sm">
                  <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                  Update Preferences
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="w-full justify-start h-9 text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  Discover Salons
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-gray-100 mt-4 bg-gradient-to-br from-glowgo-pink/5 to-glowgo-lavender/5">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-glowgo-pink to-glowgo-lavender">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">GlowGo Pro</h3>
              <p className="text-xs text-gray-500 mt-1">Unlock premium features & exclusive offers</p>
              <Button
                size="sm"
                className="mt-3 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm text-xs h-7"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
