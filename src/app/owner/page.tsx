"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getOwnerSalons, recomputeOwnerMetrics } from "@/lib/data-service"
import type { OwnerDashboardMetrics } from "@/types"
import { StatCard } from "@/components/owner/stat-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, getInitials } from "@/lib/utils"
import { useDemoReviews } from "@/lib/use-demo-reviews"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  CalendarDays, IndianRupee, Star, Sparkles,
  Clock, Scissors, Store, ShieldCheck, Zap, TrendingUp,
  Percent, Loader2, Lightbulb, Tag
} from "lucide-react"
import Link from "next/link"

export default function OwnerDashboardPage() {
  const { user, isLoading } = useAuth()
  const metrics: OwnerDashboardMetrics | null = user?.role === "owner" ? recomputeOwnerMetrics(user.id) : null
  const { reviews: ownerReviews } = useDemoReviews({
    ownerId: user?.role === "owner" ? user.id : "no-owner",
  })

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const ownerSalons = getOwnerSalons(user?.id || "")
  const ownerSalon = ownerSalons[0] || null

  if (!ownerSalon) {
    return (
      <div className="text-center py-16">
        <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold mb-2">Welcome to GlowGo!</h2>
        <p className="text-gray-500 mb-6">Set up your first salon to start receiving bookings.</p>
        <Link href="/owner/onboarding">
          <Button className="bg-gradient-to-r from-pink-600 to-purple-600 gap-2">
            <Sparkles className="w-4 h-4" /> Launch Your Salon
          </Button>
        </Link>
      </div>
    )
  }

  const m = metrics || {
    total_bookings: 0, confirmed_bookings: 0, completed_bookings: 0, cancelled_bookings: 0,
    revenue_total: 0, revenue_week: 0, revenue_month: 0, average_rating: 0, total_reviews: 0,
    total_services: 0, slot_utilization_rate: 0, top_service: '', top_category: '',
    response_time_minutes: 0, trust_score: 0, recent_bookings: [],
    services_distribution: [], revenue_over_time: [], bookings_over_time: [],
  }

  const trustColor = m.trust_score >= 70 ? 'text-green-600' : m.trust_score >= 50 ? 'text-yellow-600' : 'text-gray-500'

  return (
    <div className="space-y-6">
      <div className="premium-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
          <Badge className="mb-3 border-0 bg-violet-50 text-violet-700">Owner operations cockpit</Badge>
          <h1 className="text-xl font-semibold text-gray-950">
            Welcome back, <span className="text-pink-600">{user?.full_name?.split(" ")[0] || "Owner"}</span>
          </h1>
          <p className="text-sm text-gray-500">
            {ownerSalon.name} · {ownerSalon.area} · <span className={trustColor}>Trust Score: {m.trust_score}/100</span>
          </p>
          <p className="mt-2 text-xs text-gray-500">GlowGo can help generate weekly slots and guide setup for salon teams.</p>
          </div>
          <div className="flex gap-2">
          <Link href="/owner/insights">
            <Button variant="outline" size="sm" className="gap-2">
              <Lightbulb className="w-4 h-4" /> Insights
            </Button>
          </Link>
          <Link href="/owner/onboarding">
            <Button size="sm" className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Sparkles className="w-4 h-4" /> New Salon
            </Button>
          </Link>
          </div>
        </div>
      </div>

      {/* Calculated Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          value={m.total_bookings.toString()}
          label={`Total Bookings${m.completed_bookings > 0 ? ` (${Math.round((m.completed_bookings / m.total_bookings) * 100)}% completed)` : ''}`}
          trend={m.completed_bookings > 0 ? { value: Math.round((m.completed_bookings / m.total_bookings) * 100), isPositive: true } : undefined}
          gradient="from-pink-500 to-rose-400"
        />
        <StatCard
          icon={IndianRupee}
          value={`₹${(m.revenue_month || 0).toLocaleString('en-IN')}`}
          label="Revenue This Month"
          trend={{ value: m.revenue_month > 0 ? Math.round((m.revenue_week / m.revenue_month) * 100) : 0, isPositive: true }}
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard
          icon={Star}
          value={m.average_rating ? m.average_rating.toString() : '—'}
          label={`Avg Rating (${m.total_reviews} reviews)`}
          gradient="from-amber-300 to-orange-400"
        />
        <StatCard
          icon={ShieldCheck}
          value={`${m.trust_score}`}
          label={`Trust Score (${m.response_time_minutes}m response)`}
          gradient="from-purple-400 to-violet-500"
        />
      </div>

      {/* Extra Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Scissors className="w-4 h-4 mx-auto mb-1 text-pink-500" />
            <div className="text-lg font-bold">{m.total_services}</div>
            <div className="text-[10px] text-gray-500">Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Percent className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{m.slot_utilization_rate}%</div>
            <div className="text-[10px] text-gray-500">Slot Utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold truncate">{m.top_service || '—'}</div>
            <div className="text-[10px] text-gray-500">Top Service</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{m.top_category || '—'}</div>
            <div className="text-[10px] text-gray-500">Top Category</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Recent Reviews
          </CardTitle>
          <CardDescription className="text-xs">Demo-local feedback for your salons</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {ownerReviews.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-400">No reviews yet</div>
          ) : (
            <div className="divide-y">
              {ownerReviews.slice(0, 5).map((review) => {
                const reviewSalon = ownerSalons.find((salon) => salon.id === review.salon_id)
                return (
                  <div key={review.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {review.user?.full_name || "Anonymous customer"}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        {review.status !== "approved" && (
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {review.status}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {reviewSalon?.name || "Your salon"} · {formatDate(review.created_at)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue & Bookings Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Revenue Overview</CardTitle>
              <Badge variant="outline" className="text-xs">
                Lifetime: ₹{(m.revenue_total || 0).toLocaleString('en-IN')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m.revenue_over_time.length > 0 ? m.revenue_over_time : [{ date: 'No data', amount: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Revenue"]} />
                  <Line type="monotone" dataKey="amount" stroke="#db2777" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Bookings</CardTitle>
            <CardDescription className="text-xs">Latest from your salons</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {m.recent_bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(booking.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{booking.service?.name || 'Booking'}</p>
                      <p className="text-[11px] text-gray-500">{booking.booking_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">₹{booking.total_price.toLocaleString('en-IN')}</p>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>
                </div>
              ))}
              {m.recent_bookings.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-gray-400">No bookings yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Bookings by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.services_distribution.length > 0 ? m.services_distribution : [{ name: 'No data', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#db2777" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/owner/slots">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Clock className="w-4 h-4" /> Manage Availability Slots
              </Button>
            </Link>
            <Link href="/owner/offers">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Tag className="w-4 h-4" /> Create Offers & Promotions
              </Button>
            </Link>
            <Link href="/owner/ai-helper">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Sparkles className="w-4 h-4" /> Generate AI Descriptions
              </Button>
            </Link>
            <Link href="/owner/insights">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Lightbulb className="w-4 h-4" /> Demo Business Insights
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
