"use client"

import Link from "next/link"
import { Calendar, Heart, MessageSquare, Sparkles, ArrowRight, Star, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn, formatDate, formatTime, formatPrice, getInitials, getStatusColor } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useDemoBookings } from "@/lib/demo-bookings"
import { useDemoFavorites } from "@/lib/demo-favorites"
import { useDemoReviews } from "@/lib/use-demo-reviews"

export default function DashboardOverview() {
  const { user } = useAuth()
  const { favoriteIds } = useDemoFavorites(user?.id)
  const { bookings } = useDemoBookings({ userId: user?.id })
  const { reviews: userReviews } = useDemoReviews({ userId: user?.id || "no-user" })

  const upcomingBookings = bookings.filter((booking) =>
    ["pending", "confirmed", "rescheduled"].includes(booking.status)
  ).length
  const reviewCount = userReviews.length
  const recentBookings = bookings.slice(0, 5)
  const firstName = user?.full_name.split(" ")[0] || "there"

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="premium-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="mb-3 border-0 bg-glowgo-gold/20 text-amber-700">Customer Trust Passport</Badge>
            <h1 className="text-2xl font-bold text-gray-950">Welcome back, {firstName}.</h1>
            <p className="text-sm text-gray-600 mt-1">Track requests, compare trusted salons, and keep your beauty plan organized.</p>
          </div>
          <Link href="/explore">
            <Button className="premium-button min-h-11 rounded-2xl">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Book a Salon
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Calendar}
          label="Total Bookings"
          value={bookings.length}
          iconBg="bg-glowgo-pink/10"
          iconColor="text-glowgo-pink"
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
          value={favoriteIds.length}
          iconBg="bg-red-50"
          iconColor="text-red-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Reviews Written"
          value={reviewCount}
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
              {recentBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">No bookings yet</p>
                  <Link href="/explore" className="mt-2 inline-block text-xs text-glowgo-pink hover:underline">
                    Discover a salon
                  </Link>
                </div>
              ) : recentBookings.map((booking) => {
                const statusColor = getStatusColor(booking.status)
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={booking.salon?.logo_url || ""} alt={booking.salon?.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(booking.salon?.name || "Salon")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{booking.salon?.name || "Salon"}</p>
                      <p className="text-xs text-gray-500">{booking.service?.name || "Service"}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("text-[10px] capitalize", statusColor)}>
                        {booking.status}
                      </Badge>
                      <p className="text-xs font-medium text-gray-900 mt-1">{formatPrice(booking.total_price)}</p>
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
              <Link href="/explore">
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
              <Button size="sm" className="mt-3 h-7 text-xs" disabled title="Memberships are planned after the demo">
                Demo roadmap
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
