"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/owner/stat-card"
import { getPlatformMetrics } from "@/lib/data-service"
import { formatPrice } from "@/lib/utils"
import {
  Store, Users, CalendarCheck, IndianRupee, MessageSquare,
  CheckCircle, Clock, Shield, Sparkles, TrendingUp, Star, Tag,
  ArrowRight
} from "lucide-react"
import { SALONS, OFFERS } from "@/data"
import { bookingsStore, reviewsStore } from "@/lib/store"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    setMetrics(getPlatformMetrics())
  }, [])

  const pendingApprovals = SALONS.filter(s => s.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform-wide analytics and management</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="w-3 h-3" /> Live Data
        </Badge>
      </div>

      {/* Platform Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Store}
          value={(metrics?.total_salons || SALONS.length).toString()}
          label={`Total Salons (${SALONS.filter(s => s.verified).length} verified)`}
          gradient="from-pink-500 to-rose-400"
        />
        <StatCard
          icon={CalendarCheck}
          value={(metrics?.total_bookings || bookingsStore.length).toString()}
          label={`Total Bookings (${bookingsStore.filter(b => b.status === 'completed').length} completed)`}
          gradient="from-blue-500 to-indigo-400"
        />
        <StatCard
          icon={IndianRupee}
          value={formatPrice(metrics?.total_revenue || 0)}
          label={`Revenue (₹${(metrics?.revenue_this_month || 0).toLocaleString('en-IN')} this month)`}
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard
          icon={Users}
          value={(metrics?.total_users || 0).toString()}
          label={`Users (${metrics?.total_owners || 0} owners)`}
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
                <p className="text-sm text-gray-500">{metrics?.total_users || 0} registered users</p>
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
                Top city: {metrics?.top_city || 'Mumbai'} · Top: {metrics?.top_category || 'N/A'}
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
            <div className="text-2xl font-bold mb-1">{reviewsStore.length}</div>
            <p className="text-sm text-gray-500">
              Average rating: {reviewsStore.length > 0
                ? (reviewsStore.reduce((s, r) => s + r.rating, 0) / reviewsStore.length).toFixed(1)
                : 'N/A'} ★
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {reviewsStore.filter(r => r.rating >= 4).length} positive
              </Badge>
              <Badge variant="outline" className="text-xs">
                {reviewsStore.filter(r => r.is_reported).length} reported
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
            {SALONS.slice(0, 5).map(salon => (
              <div key={salon.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden">
                    <img src={salon.cover_image || salon.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
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
