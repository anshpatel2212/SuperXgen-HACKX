"use client"

import Link from "next/link"
import { Calendar, Heart, MessageSquare, Sparkles, ArrowRight, Star, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GlowCard, GlowMetricCard } from "@/components/glow-ui"
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
      <GlowCard className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge className="mb-3 rounded-full border border-[#e3c87b] bg-[#fff8dc] text-[#7d5b17]">Customer Trust Passport</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-[#201717]">Welcome back, {firstName}.</h1>
            <p className="mt-1 text-sm text-[#6f5d56]">Track requests, compare trusted salons, and keep your beauty plan organized.</p>
          </div>
          <Link href="/explore">
            <Button className="min-h-11 rounded-full bg-[linear-gradient(135deg,#db2777,#f43f5e_55%,#a78bfa)]">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Book a Salon
            </Button>
          </Link>
        </div>
      </GlowCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlowMetricCard
          icon={<Calendar className="h-5 w-5" />}
          label="Total Bookings"
          value={bookings.length}
          detail="All demo requests"
          tone="rose"
        />
        <GlowMetricCard
          icon={<Calendar className="h-5 w-5" />}
          label="Upcoming"
          value={upcomingBookings}
          detail="Pending, confirmed, rescheduled"
          tone="gold"
        />
        <GlowMetricCard
          icon={<Heart className="h-5 w-5" />}
          label="Favorites"
          value={favoriteIds.length}
          detail="Saved salons"
          tone="lavender"
        />
        <GlowMetricCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Reviews Written"
          value={reviewCount}
          detail="Demo-local feedback"
          tone="green"
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
