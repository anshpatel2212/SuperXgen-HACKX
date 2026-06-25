"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatCard } from "@/components/owner/stat-card"
import { getPlatformMetrics } from "@/lib/data-service"
import { formatPrice } from "@/lib/utils"
import {
  Store, Users, CalendarCheck, IndianRupee,
  Shield, Sparkles, TrendingUp, Star, Tag,
  ArrowRight
} from "lucide-react"
import { SALONS, OFFERS } from "@/data"
import { bookingsStore } from "@/lib/store"
import { DEMO_ACCOUNTS } from "@/config/demo-auth"
import { useDemoSalonStatuses } from "@/lib/demo-salon-status"
import { useDemoReviews } from "@/lib/use-demo-reviews"
import Link from "next/link"

const DEMO_PLATFORM_METRICS = getPlatformMetrics()

export default function AdminDashboardPage() {
  const metrics = DEMO_PLATFORM_METRICS
  const { salons } = useDemoSalonStatuses()
  const { reviews } = useDemoReviews()
  const pendingApprovals = salons.filter(s => s.status === "pending").length
  const visibleReviews = reviews.filter((review) => review.status === "approved" && !review.is_moderated)

  return (
    <div className="space-y-6">
      <div className="premium-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <Badge className="mb-3 border-0 bg-emerald-50 text-emerald-700">Trust command center</Badge>
          <h1 className="text-2xl font-bold text-gray-950">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm">Moderate verification, reviews, personas, and demo marketplace health.</p>
          </div>
          <Badge variant="outline" className="w-fit gap-1 bg-white">
            <Sparkles className="w-3 h-3" /> Demo seed snapshot
          </Badge>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Store}
          value={(metrics.total_salons || salons.length).toString()}
          label={`Total Salons (${salons.filter(s => s.verified).length} verified)`}
          gradient="from-pink-500 to-rose-400"
        />
        <StatCard
          icon={CalendarCheck}
          value={(metrics.total_bookings || bookingsStore.length).toString()}
          label={`Total Bookings (${bookingsStore.filter(b => b.status === 'completed').length} completed)`}
          gradient="from-blue-500 to-indigo-400"
        />
        <StatCard
          icon={IndianRupee}
          value={formatPrice(metrics.total_revenue || 0)}
          label={`Revenue (₹${(metrics.revenue_this_month || 0).toLocaleString('en-IN')} this month)`}
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard
          icon={Users}
          value={DEMO_ACCOUNTS.length.toString()}
          label={`${DEMO_ACCOUNTS.filter((account) => account.user.role === "owner").length} owner persona`}
          gradient="from-purple-400 to-violet-500"
        />
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/salons">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Salon Approvals</h3>
                <p className="text-sm text-gray-500">{pendingApprovals} pending approval{pendingApprovals !== 1 ? 's' : ''}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-gray-500">{DEMO_ACCOUNTS.length} seeded demo personas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Platform Stats</h3>
              <p className="text-sm text-gray-500">
                Top city: {metrics.top_city || 'Mumbai'} · Top: {metrics.top_category || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Reviews Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{reviews.length}</div>
            <p className="text-sm text-gray-500">
              Average rating: {visibleReviews.length > 0
                ? (visibleReviews.reduce((s, r) => s + r.rating, 0) / visibleReviews.length).toFixed(1)
                : 'N/A'} ★
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {visibleReviews.filter(r => r.rating >= 4).length} positive
              </Badge>
              <Badge variant="outline" className="text-xs">
                {reviews.filter(r => r.is_reported).length} reported
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-500" /> Active Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{OFFERS.filter(o => o.is_active).length}</div>
            <p className="text-sm text-gray-500">
              {OFFERS.length} total offers across all salons
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                {OFFERS.filter(o => o.is_active && new Date(o.valid_till) >= new Date()).length} valid
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {OFFERS.filter(o => !o.is_active).length} inactive
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Salons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Salons</CardTitle>
          <CardDescription className="text-xs">{SALONS.length} salons registered</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {salons.slice(0, 5).map(salon => (
              <div key={salon.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={salon.cover_image || salon.logo_url} alt={salon.name} />
                    <AvatarFallback className="rounded-lg text-[10px]">{salon.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{salon.name}</p>
                    <p className="text-xs text-gray-500">{salon.area}, {salon.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${
                    salon.verified ? 'bg-green-100 text-green-700' :
                    salon.status === 'featured' ? 'bg-purple-100 text-purple-700' :
                    salon.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {salon.verified ? 'Verified' : salon.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
