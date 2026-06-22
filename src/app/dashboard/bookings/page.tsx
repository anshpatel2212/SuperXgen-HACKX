"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookingCard } from "@/components/dashboard/booking-card"
import { cn } from "@/lib/utils"
import { updateBooking } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useDemoBookings } from "@/lib/demo-bookings"

const FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { bookings } = useDemoBookings({ userId: user?.id })
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadError, setLoadError] = useState("")
  const [cancellingId, setCancellingId] = useState("")

  const filtered = bookings.filter((b) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && ["pending", "confirmed", "rescheduled"].includes(b.status)) ||
      b.status === filter
    const matchesSearch =
      !searchQuery ||
      b.salon?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      const updated = await updateBooking(id, { status: "cancelled" })
      if (updated.status !== "cancelled") {
        setLoadError("The booking status could not be updated.")
      }
    } catch {
      setLoadError("This booking could not be cancelled. The temporary demo store may have reset.")
    } finally {
      setCancellingId("")
    }
  }

  const handleReview = (id: string) => {
    const booking = bookings.find((item) => item.id === id)
    if (booking) router.push(`/salon/${booking.salon_id}`)
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

      {loadError && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{loadError}</p>
      )}

      {filtered.length === 0 ? (
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
            <Link href="/explore">
              <Button className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm">
                Book Your First Salon
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={
                ["confirmed", "pending"].includes(booking.status) && cancellingId !== booking.id
                  ? handleCancel
                  : undefined
              }
              onReview={booking.status === "completed" ? handleReview : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
