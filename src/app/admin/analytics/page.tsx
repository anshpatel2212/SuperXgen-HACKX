"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/owner/stat-card"
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
  IndianRupee,
  CalendarDays,
  Users,
  Store,
  Download,
} from "lucide-react"

const bookingsData = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date("2026-06-22T12:00:00Z")
  d.setDate(d.getDate() - (29 - i))
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    bookings: 14 + ((i * 11) % 37),
    revenue: 26000 + ((i * 17011) % 65000),
  }
})

const cityDist = [
  { name: "Mumbai", count: 6 },
  { name: "Navi Mumbai", count: 2 },
  { name: "Thane", count: 1 },
]

const categoryPopularity = [
  { name: "Haircut", count: 180 },
  { name: "Facial", count: 145 },
  { name: "Bridal", count: 98 },
  { name: "Manicure", count: 76 },
  { name: "Massage", count: 54 },
  { name: "Spa", count: 42 },
]

const topSalonsByRevenue = [
  { name: "Glamour & Grace Salon", revenue: 1240000, bookings: 890 },
  { name: "Serenity Spa & Salon", revenue: 980000, bookings: 720 },
  { name: "Blush Beauty Bar", revenue: 856000, bookings: 560 },
  { name: "The Style Loft", revenue: 445000, bookings: 350 },
  { name: "Nails & Lashes Studio", revenue: 389000, bookings: 410 },
]

const PIE_COLORS = ["#f8b4c8", "#d4c5f0", "#f43f5e", "#a78bfa", "#fb923c", "#34d399"]

const newUsersData = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  users: 62 + ((i * 43) % 151),
}))

export default function AdminAnalytics() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Seeded platform scenario for the hackathon demo
          </p>
        </div>
        <Button variant="outline" size="sm" disabled title="Reports require durable production analytics">
          <Download className="size-3.5" />
          Export after launch
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          value={formatPrice(4250000)}
          label="Total Revenue"
          trend={{ value: 22, isPositive: true }}
          gradient="from-emerald-300 to-teal-400"
        />
        <StatCard
          icon={CalendarDays}
          value="8,900"
          label="Total Bookings"
          trend={{ value: 15, isPositive: true }}
          gradient="from-glowgo-pink to-rose-300"
        />
        <StatCard
          icon={Users}
          value="1,247"
          label="New Users"
          trend={{ value: 18, isPositive: true }}
          gradient="from-blue-300 to-indigo-400"
        />
        <StatCard
          icon={Store}
          value={String(8)}
          label="Active Salons"
          trend={{ value: 2, isPositive: true }}
          gradient="from-amber-300 to-orange-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings & Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={bookingsData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-glowgo-pink)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-glowgo-pink)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-glowgo-pink)" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                  <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="var(--color-glowgo-lavender)" strokeWidth={2} fill="none" name="Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
            <CardDescription>Monthly user signups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={newUsersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="var(--color-glowgo-pink)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>City-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={cityDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {cityDist.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
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
            <CardTitle>Service Category Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={categoryPopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} tickLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryPopularity.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Salons by Revenue</CardTitle>
            <CardDescription>Highest earning salons on the platform</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topSalonsByRevenue.map((salon, i) => (
                <div
                  key={salon.name}
                  className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{salon.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {salon.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(salon.revenue)}
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
              title="Reports require durable production analytics"
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
