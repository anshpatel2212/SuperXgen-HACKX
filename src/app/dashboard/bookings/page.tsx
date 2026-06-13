"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, XCircle, Star, Home, Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingCard } from "@/components/dashboard/booking-card"
import { cn, formatPrice, formatDate, formatTime, getStatusColor } from "@/lib/utils"
import { getUserBookings } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { bookingsStore } from "@/lib/store"
import { SALONS, SERVICES } from "@/data"
import type { Booking, BookingStatus } from "@/types"

const MOCK_BOOKINGS: (Booking & { salon: (typeof SALONS)[0]; service: (typeof SERVICES)[0] })[] = [
  {
    id: "b1", user_id: "u1", salon_id: "1", service_id: "s1", slot_id: null,
    booking_date: new Date().toISOString().split("T")[0],
    booking_time: "10:00",
    status: "confirmed", total_price: 800, applied_offer_id: null,
    service_mode: "salon", address_text: "", notes: "",
    created_at: "", confirmed_at: null, completed_at: null, cancelled_at: null,
    salon: SALONS[0], service: SERVICES[0],
  },
  {
    id: "b2", user_id: "u1", salon_id: "4", service_id: "s12", slot_id: null,
    booking_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    booking_time: "14:30",
    status: "confirmed", total_price: 3000, applied_offer_id: null,
    service_mode: "salon", address_text: "", notes: "Please use lavender oil",
    created_at: "", confirmed_at: null, completed_at: null, cancelled_at: null,
    salon: SALONS[3], service: SERVICES[11],
  },
  {
    id: "b3", user_id: "u1", salon_id: "2", service_id: "s6", slot_id: null,
    booking_date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    booking_time: "11:00",
    status: "completed", total_price: 25000, applied_offer_id: null,
    service_mode: "salon", address_text: "", notes: "",
    created_at: "", confirmed_at: null, completed_at: new Date(Date.now() - 7 * 86400000).toISOString(), cancelled_at: null,
    salon: SALONS[1], service: SERVICES[5],
  },
  {
    id: "b4", user_id: "u1", salon_id: "7", service_id: "s21", slot_id: null,
    booking_date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    booking_time: "16:00",
    status: "completed", total_price: 1200, applied_offer_id: null,
    service_mode: "home", address_text: "Bandra West, Mumbai", notes: "",
    created_at: "", confirmed_at: null, completed_at: new Date(Date.now() - 14 * 86400000).toISOString(), cancelled_at: null,
    salon: SALONS[6], service: SERVICES[20],
  },
  {
    id: "b5", user_id: "u1", salon_id: "5", service_id: "s15", slot_id: null,
    booking_date: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    booking_time: "15:00",
    status: "cancelled", total_price: 1200, applied_offer_id: null,
    service_mode: "salon", address_text: "", notes: "",
    created_at: "", confirmed_at: null, completed_at: null, cancelled_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    salon: SALONS[4], service: SERVICES[14],
  },
]

const FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const

export default function BookingsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getUserBookings(user.id)
      .then((data) => {
        const enriched = data.bookings.map((b) => ({
          ...b,
          salon: SALONS.find((s) => s.id === b.salon_id)!,
          service: SERVICES.find((s) => s.id === b.service_id)!,
        }))
        const storeBookings = bookingsStore
          .filter((b) => b.user_id === user.id)
          .map((b) => ({
            ...b,
            salon: SALONS.find((s) => s.id === b.salon_id)!,
            service: SERVICES.find((s) => s.id === b.service_id)!,
          }))
        const all = [...enriched, ...storeBookings]
        const seen = new Set<string>()
        const merged = all.filter((b) => {
          if (seen.has(b.id)) return false
          seen.add(b.id)
          return true
        })
        setBookings(merged.length > 0 ? merged : MOCK_BOOKINGS)
      })
      .catch(() => setBookings(MOCK_BOOKINGS))
      .finally(() => setIsLoading(false))
  }, [user])

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter
    const matchesSearch =
      !searchQuery ||
      b.salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCancel = (id: string) => {
    console.log("Cancel booking:", id)
  }

  const handleReview = (id: string) => {
    console.log("Review booking:", id)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your salon appointments.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                filter === f.value
                  ? "bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-gray-100">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            {searchQuery
              ? "Try a different search term."
              : "You haven't made any bookings yet."}
          </p>
          {!searchQuery && (
            <Button className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm">
              Book Your First Salon
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={booking.status === "confirmed" ? handleCancel : undefined}
              onReview={booking.status === "completed" ? handleReview : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
