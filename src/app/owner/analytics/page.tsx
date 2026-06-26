"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/owner/stat-card"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { formatPrice } from "@/lib/utils"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  CalendarDays,
  IndianRupee,
  Star,
  Scissors,
  Download,
  Store,
} from "lucide-react"
import { SALONS } from "@/data"
import { useAuth } from "@/lib/auth-context"

const revenueData = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date("2026-06-22T12:00:00Z")
  d.setDate(d.getDate() - (29 - i))
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    revenue: 6500 + ((i * 7919) % 13000),
    bookings: 3 + ((i * 7) % 12),
  }
})

const servicesDist = [
  { name: "Haircut", count: 45 },
  { name: "Facial", count: 32 },
  { name: "Bridal", count: 28 },
  { name: "Manicure", count: 20 },
  { name: "Hair Color", count: 18 },
  { name: "Massage", count: 12 },
]

const ratingsDist = [
  { rating: 5, count: 124 },
  { rating: 4, count: 68 },
  { rating: 3, count: 22 },
  { rating: 2, count: 8 },
  { rating: 1, count: 3 },
]

const topServices = [
  { name: "Classic Haircut", revenue: 124000, bookings: 155 },
  { name: "Bridal Makeup", revenue: 96000, bookings: 8 },
  { name: "Luxury Facial", revenue: 72000, bookings: 36 },
  { name: "Hair Color", revenue: 56000, bookings: 16 },
  { name: "Manicure Combo", revenue: 48000, bookings: 40 },
]

const PIE_COLORS = ["#f8b4c8", "#d4c5f0", "#f43f5e", "#a78bfa", "#fb923c", "#34d399"]

const dateRanges = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
]

export default function OwnerAnalytics() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedRange, setSelectedRange] = useState("30")

  const ownerSalons = SALONS.filter((s) => s.owner_id === (user?.id || ""))
  const hasSalons = ownerSalons.length > 0
  const visibleRevenueData = revenueData.slice(-Number(selectedRange))

  if (authLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <LoadingSkeleton type="chart" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      </div>
    )
  }

  if (!hasSalons) {
    return (
      <EmptyState
        icon={Store}
        title="No data yet"
        description="Create a salon to see your analytics and performance metrics"
        actionLabel="Create Salon"
        onAction={() => router.push("/owner/onboarding")}
      />
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Seeded analytics scenario for the hackathon demo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            {dateRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedRange(r.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedRange === r.value
                    ? "bg-glowgo-pink text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" disabled title="Export requires durable production analytics">
            <Download className="size-3.5" />
            Export after launch
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          value={formatPrice(284500)}
          label="Total Revenue"
          trend={{ value: 15, isPositive: true }}
          gradient="from-emerald-300 to-teal-400"
        />
        <StatCard
          icon={CalendarDays}
          value="312"
          label="Total Bookings"
          trend={{ value: 8, isPositive: true }}
          gradient="from-glowgo-pink to-rose-300"
        />
        <StatCard
          icon={Star}
          value="4.8"
          label="Average Rating"
          trend={{ value: 3, isPositive: true }}
          gradient="from-amber-300 to-orange-400"
        />
        <StatCard
          icon={Scissors}
          value="24"
          label="Active Services"
          gradient="from-blue-300 to-indigo-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={visibleRevenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-glowgo-pink)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-glowgo-pink)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatPrice(Number(value)), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-glowgo-pink)" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={visibleRevenueData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="var(--color-glowgo-lavender)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={servicesDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {servicesDist.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ratings Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={ratingsDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis dataKey="rating" type="category" tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {ratingsDist.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Services by Revenue</CardTitle>
            <CardDescription>Highest revenue generating services</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topServices.map((svc, i) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{svc.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {svc.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(svc.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1"
              disabled
              title="Export requires durable production analytics"
            >
              <Download className="size-3.5" />
              Export unavailable in demo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
