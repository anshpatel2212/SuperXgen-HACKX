"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookingCard } from "@/components/dashboard/booking-card"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { updateBooking } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useDemoBookings } from "@/lib/demo-bookings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { getCancellationEligibility } from "@/services/cancellation"
import { reserveDemoSlot } from "@/lib/demo-slots"
import { GlowCard, GlowEmptyState } from "@/components/glow-ui"
import type { BookingStatus, Booking } from "@/types"

const FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const

interface UndoMetadata {
  bookingId: string
  previousStatus: BookingStatus
  timestamp: number
  slotId: string | null
}

function canOpenCancellation(booking: Booking) {
  if (!["confirmed", "pending"].includes(booking.status)) return false
  const appointmentStart = new Date(`${booking.booking_date}T${booking.booking_time}:00`)
  return appointmentStart.getTime() > Date.now()
}

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { bookings } = useDemoBookings({ userId: user?.id })
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadError, setLoadError] = useState("")
  const [cancellingId, setCancellingId] = useState("")

  // Modal target
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  // Undo state initialized lazily to avoid triggering React cascade renders
  const [undoBooking, setUndoBooking] = useState<UndoMetadata | null>(() => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("glowgo_cancellation_undo")
    if (stored) {
      try {
        const data = JSON.parse(stored) as UndoMetadata
        const age = Date.now() - data.timestamp
        if (age < 300000) {
          return data
        } else {
          localStorage.removeItem("glowgo_cancellation_undo")
        }
      } catch {
        localStorage.removeItem("glowgo_cancellation_undo")
      }
    }
    return null
  })

  // Auto clean up undo timer after 5 minutes (remaining duration)
  useEffect(() => {
    if (!undoBooking) return
    const age = Date.now() - undoBooking.timestamp
    const remaining = Math.max(0, 300000 - age)

    const timer = setTimeout(() => {
      setUndoBooking(null)
      localStorage.removeItem("glowgo_cancellation_undo")
    }, remaining)

    return () => clearTimeout(timer)
  }, [undoBooking])

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

  const handleCancelClick = (id: string) => {
    const booking = bookings.find((b) => b.id === id)
    if (booking) {
      setCancelTarget(booking)
    }
  }

  const confirmCancel = async () => {
    if (!cancelTarget) return
    const id = cancelTarget.id
    setCancellingId(id)
    setCancelTarget(null)
    try {
      const originalStatus = cancelTarget.status
      const slotId = cancelTarget.slot_id

      const updated = await updateBooking(id, { status: "cancelled" })
      if (updated.status === "cancelled") {
        // Save undo metadata (valid for 5 mins)
        const undoData: UndoMetadata = {
          bookingId: id,
          previousStatus: originalStatus,
          timestamp: Date.now(),
          slotId,
        }
        setUndoBooking(undoData)
        localStorage.setItem("glowgo_cancellation_undo", JSON.stringify(undoData))
        setLoadError("")
      } else {
        setLoadError("The booking status could not be updated.")
      }
    } catch {
      setLoadError("This booking could not be cancelled. The temporary demo store may have reset.")
    } finally {
      setCancellingId("")
    }
  }

  const handleUndo = async () => {
    if (!undoBooking) return
    const { bookingId, previousStatus, slotId } = undoBooking
    try {
      // 1. Re-reserve slot if needed
      if (slotId) {
        const reserved = reserveDemoSlot(slotId)
        if (!reserved) {
          setLoadError("This slot is no longer available. Please book another time.")
          setUndoBooking(null)
          localStorage.removeItem("glowgo_cancellation_undo")
          return
        }
      }

      // 2. Restore previous status
      const updated = await updateBooking(bookingId, { status: previousStatus })
      if (updated.status === previousStatus) {
        setUndoBooking(null)
        localStorage.removeItem("glowgo_cancellation_undo")
        setLoadError("")
      } else {
        setLoadError("The booking status could not be restored.")
      }
    } catch {
      setLoadError("An error occurred while undoing the cancellation.")
    }
  }

  const handleReview = (id: string) => {
    const booking = bookings.find((item) => item.id === id)
    if (booking) router.push(`/salon/${booking.salon_id}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your salon appointments.</p>
        </div>

        {/* Undo banner */}
        {undoBooking && (
          <div className="flex items-center justify-between gap-4 rounded-full bg-[#201717] px-4 py-2 text-sm text-white shadow-md animate-slide-in">
            <span className="text-xs font-medium">Booking cancelled.</span>
            <button
              onClick={handleUndo}
              className="text-pink-400 text-xs font-semibold hover:underline"
            >
              Undo
            </button>
          </div>
        )}
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
        <GlowEmptyState
          icon={<Calendar className="h-6 w-6" />}
          title="No bookings found"
          copy={searchQuery ? "Try a different search term." : "You have not made any bookings yet."}
          action={
            !searchQuery ? (
              <Link href="/explore">
                <Button className="min-h-11 rounded-full bg-[linear-gradient(135deg,#db2777,#f43f5e_55%,#a78bfa)] text-white">
                  Book Your First Salon
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={
                canOpenCancellation(booking) && cancellingId !== booking.id
                  ? handleCancelClick
                  : undefined
              }
              onReview={booking.status === "completed" ? handleReview : undefined}
            />
          ))}
        </div>
      )}

      {/* Cancellation policy confirmation modal */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Please review the cancellation policy details below.
            </DialogDescription>
          </DialogHeader>

          {cancelTarget && (() => {
            const eligibility = getCancellationEligibility(cancelTarget)
            return (
              <div className="space-y-4 my-3 text-sm text-gray-700">
                <GlowCard className="space-y-2 p-3.5">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Salon</span>
                    <span className="font-semibold text-gray-900">{cancelTarget.salon?.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Service</span>
                    <span className="font-medium text-gray-900">{cancelTarget.service?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Date & Time</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(cancelTarget.booking_date)} at {formatTime(cancelTarget.booking_time)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Created On</span>
                      <span className="font-medium text-gray-900">{formatDate(cancelTarget.created_at)}</span>
                    </div>
                  </div>
                </GlowCard>

                {/* Cancellation Policy Eligibility Status */}
                <div className={cn(
                  "rounded-xl p-3.5 border flex flex-col gap-1.5",
                  eligibility.allowed
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                    : "bg-red-50/50 border-red-100 text-red-800"
                )}>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    Policy Result
                  </span>
                  <span className="font-medium text-sm leading-relaxed">
                    {eligibility.message}
                  </span>
                </div>

                {/* Warnings */}
                {eligibility.isLongService && (
                  <div className="rounded-xl p-3.5 bg-amber-50/50 border border-amber-100 text-amber-800 text-xs leading-relaxed">
                    <span className="font-semibold block mb-0.5 text-[10px] uppercase tracking-wider">Capacity Notice</span>
                    This is a long-duration service. Late cancellation can block staff and continuous salon capacity.
                  </div>
                )}

                <div className="text-xs text-gray-500 bg-blue-50/30 p-3 rounded-xl border border-blue-50 leading-relaxed">
                  <span className="font-semibold text-blue-900 block mb-0.5 text-[10px] uppercase tracking-wider">Important</span>
                  Cancelling this appointment will release the reserved time slot and make it available to other clients immediately.
                </div>

                <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCancelTarget(null)}
                    className="w-full sm:w-auto h-10 rounded-xl"
                  >
                    Keep booking
                  </Button>
                  {eligibility.allowed && (
                    <Button
                      onClick={confirmCancel}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-10 rounded-xl font-medium"
                    >
                      Confirm cancellation
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
