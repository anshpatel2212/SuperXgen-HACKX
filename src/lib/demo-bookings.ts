"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { SALONS, SERVICES } from "@/data"
import type { Booking, BookingStatus } from "@/types"

const BOOKINGS_KEY = "glowgo_demo_bookings_v1"
const BOOKINGS_EVENT = "glowgo:bookings-changed"
const EMPTY_SNAPSHOT = JSON.stringify({ version: 1, bookings: [] })

interface BookingState {
  version: 1
  bookings: Booking[]
}

interface BookingFilters {
  userId?: string
  salonIds?: string[]
}

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rescheduled: ["confirmed", "cancelled"],
}

function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false
  const booking = value as Partial<Booking>
  return (
    typeof booking.id === "string" &&
    typeof booking.user_id === "string" &&
    typeof booking.salon_id === "string" &&
    typeof booking.service_id === "string" &&
    typeof booking.booking_date === "string" &&
    typeof booking.booking_time === "string" &&
    typeof booking.status === "string"
  )
}

function parseSnapshot(snapshot: string): BookingState {
  try {
    const parsed = JSON.parse(snapshot) as Partial<BookingState>
    if (parsed.version !== 1 || !Array.isArray(parsed.bookings)) {
      return { version: 1, bookings: [] }
    }
    return { version: 1, bookings: parsed.bookings.filter(isBooking) }
  } catch {
    return { version: 1, bookings: [] }
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT
  return localStorage.getItem(BOOKINGS_KEY) || EMPTY_SNAPSHOT
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOOKINGS_KEY) callback()
  }
  window.addEventListener(BOOKINGS_EVENT, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(BOOKINGS_EVENT, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function writeBookings(bookings: Booking[]) {
  const state: BookingState = { version: 1, bookings }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(BOOKINGS_EVENT))
}

function enrichBooking(booking: Booking): Booking {
  return {
    ...booking,
    salon: SALONS.find((salon) => salon.id === booking.salon_id) || booking.salon,
    service: SERVICES.find((service) => service.id === booking.service_id) || booking.service,
  }
}

export function getDemoBookings(): Booking[] {
  return parseSnapshot(getSnapshot()).bookings.map(enrichBooking)
}

export function upsertDemoBooking(booking: Booking): Booking {
  const bookings = getDemoBookings()
  const index = bookings.findIndex((existing) => existing.id === booking.id)
  const enriched = enrichBooking(booking)

  if (index === -1) bookings.unshift(enriched)
  else bookings[index] = enriched

  writeBookings(bookings)
  return enriched
}

export function updateDemoBookingStatus(id: string, nextStatus: BookingStatus): Booking {
  const bookings = getDemoBookings()
  const index = bookings.findIndex((booking) => booking.id === id)
  if (index === -1) throw new Error("Booking not found in the demo repository")

  const current = bookings[index]
  const allowed = allowedTransitions[current.status]
  if (current.status !== nextStatus && !allowed.includes(nextStatus)) {
    throw new Error(`Cannot transition from ${current.status} to ${nextStatus}`)
  }

  const now = new Date().toISOString()
  const updated: Booking = {
    ...current,
    status: nextStatus,
    updated_at: now,
    confirmed_at: nextStatus === "confirmed" ? now : current.confirmed_at,
    completed_at: nextStatus === "completed" ? now : current.completed_at,
    cancelled_at: nextStatus === "cancelled" ? now : current.cancelled_at,
  }

  bookings[index] = updated
  writeBookings(bookings)
  return enrichBooking(updated)
}

export function useDemoBookings(filters: BookingFilters = {}) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SNAPSHOT)
  const salonKey = filters.salonIds?.slice().sort().join("|") || ""

  const bookings = useMemo(() => {
    const salonIds = new Set(salonKey ? salonKey.split("|") : [])
    return parseSnapshot(snapshot).bookings
      .map(enrichBooking)
      .filter((booking) => !filters.userId || booking.user_id === filters.userId)
      .filter((booking) => salonIds.size === 0 || salonIds.has(booking.salon_id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [filters.userId, salonKey, snapshot])

  const updateStatus = useCallback(
    (id: string, status: BookingStatus) => updateDemoBookingStatus(id, status),
    []
  )

  return { bookings, updateStatus }
}
