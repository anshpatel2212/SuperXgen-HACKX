import type { Salon, Service, Booking, BookingStatus, Review, Favorite, Offer, SearchFilters, AIIntent } from "@/types"
import type { CreateBookingInput } from "@/lib/validation/booking"
import { getDemoBookings, updateDemoBookingStatus, upsertDemoBooking } from "@/lib/demo-bookings"
import { createDemoReview, getReviewsBySalon } from "@/lib/demo-reviews"
import { releaseDemoSlot, reserveDemoSlot } from "@/lib/demo-slots"

const BASE = "/api"
const SESSION_KEY = "glowgo_session"

function getDemoAuthHeaders() {
  if (typeof window === "undefined") return {}

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as { id?: unknown } | null
    return typeof session?.id === "string"
      ? { "x-glowgo-demo-user-id": session.id }
      : {}
  } catch {
    return {}
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  for (const [key, value] of Object.entries(getDemoAuthHeaders())) {
    if (!headers.has(key)) headers.set(key, value)
  }

  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Salons
export async function getSalons(filters?: Partial<SearchFilters> & { page?: number; limit?: number }) {
  const params = new URLSearchParams()
  if (filters?.area) params.set("area", filters.area)
  if (filters?.service_type) params.set("service", filters.service_type)
  if (filters?.min_price) params.set("minPrice", String(filters.min_price))
  if (filters?.max_price) params.set("maxPrice", String(filters.max_price))
  if (filters?.min_rating) params.set("minRating", String(filters.min_rating))
  if (filters?.gender) params.set("gender", filters.gender)
  if (filters?.luxury_level) params.set("luxury", filters.luxury_level)
  if (filters?.offers_home_service !== null && filters?.offers_home_service !== undefined) params.set("homeService", String(filters.offers_home_service))
  if (filters?.sort_by) params.set("sortBy", filters.sort_by)
  if (filters?.page) params.set("page", String(filters.page))
  if (filters?.limit) params.set("limit", String(filters.limit))
  if (filters?.query) params.set("q", filters.query)
  const qs = params.toString()
  return request<{ salons: Salon[]; total: number; page: number; limit: number }>(`/salons${qs ? `?${qs}` : ""}`)
}

export async function getSalon(id: string) {
  return request<{ salon: Salon; services: Service[]; offers: Offer[] }>(`/salons/${id}`)
}

export async function updateSalon(id: string, data: Partial<Salon>) {
  return request<Salon>(`/salons/${id}`, { method: "PATCH", body: JSON.stringify(data) })
}

// Bookings
export async function getUserBookings(userId: string) {
  const bookings = getDemoBookings().filter((booking) => booking.user_id === userId)
  return { bookings, total: bookings.length }
}

export async function createBooking(data: CreateBookingInput) {
  const slotId = data.slot_id || undefined
  const reserved = slotId ? reserveDemoSlot(slotId) : false
  if (slotId && !reserved) {
    throw new Error("That slot is no longer available. Please choose another time.")
  }

  try {
    const booking = await request<Booking>(`/bookings`, { method: "POST", body: JSON.stringify(data) })
    return upsertDemoBooking(booking)
  } catch (error) {
    if (slotId && reserved) releaseDemoSlot(slotId)
    throw error
  }
}

export async function updateBooking(id: string, data: { status?: BookingStatus; notes?: string }) {
  const existingBooking = getDemoBookings().find((booking) => booking.id === id)
  const localBooking = data.status ? updateDemoBookingStatus(id, data.status) : existingBooking
  if (!localBooking) throw new Error("Booking not found in the demo repository")

  try {
    const serverBooking = await request<Booking>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    return upsertDemoBooking(serverBooking)
  } catch {
    return localBooking
  }
}

// Reviews
export async function getSalonReviews(salonId: string) {
  return { reviews: getReviewsBySalon(salonId, { publicOnly: true }) }
}

export async function createReview(data: {
  user_id: string
  salon_id: string
  booking_id?: string
  rating: number
  title?: string
  comment?: string
}) {
  return createDemoReview({
    ...data,
    comment: data.comment || "",
  })
}

// Favorites
export async function getUserFavorites(userId: string) {
  return request<{ favorites: Favorite[] }>(`/favorites?userId=${userId}`)
}

export async function addFavorite(userId: string, salonId: string) {
  return request<Favorite>(`/favorites`, { method: "POST", body: JSON.stringify({ user_id: userId, salon_id: salonId }) })
}

export async function removeFavorite(userId: string, salonId: string) {
  return request<void>(`/favorites?userId=${userId}&salonId=${salonId}`, { method: "DELETE" })
}

// AI
export async function aiSearch(query: string, filters?: Partial<SearchFilters>) {
  return request<{ salons: Salon[]; reasoning: string; intent: AIIntent }>(`/ai/search`, {
    method: "POST", body: JSON.stringify({ query, filters }),
  })
}

export async function aiChat(message: string, userId?: string, sessionId?: string) {
  return request<{ response: string; recommendations?: Salon[]; intent?: AIIntent }>(`/ai/chat`, {
    method: "POST", body: JSON.stringify({ message, userId, sessionId }),
  })
}

export async function aiRecommend(userId?: string) {
  return request<{ recommendations: Salon[]; reasoning: string }>(`/ai/recommend`, {
    method: "POST", body: JSON.stringify({ userId }),
  })
}

// Store-level helpers (for client-side mutations)
import { bookingsStore, favoritesStore, reviewsStore } from "@/lib/store"

export function addBookingToStore(booking: Booking) {
  bookingsStore.push(booking)
}

export function updateBookingInStore(id: string, updates: Partial<Booking>) {
  const idx = bookingsStore.findIndex((b) => b.id === id)
  if (idx !== -1) bookingsStore[idx] = { ...bookingsStore[idx], ...updates }
}

export function addFavoriteToStore(fav: Favorite) {
  favoritesStore.push(fav)
}

export function removeFavoriteFromStore(id: string) {
  const idx = favoritesStore.findIndex((f) => f.id === id)
  if (idx !== -1) favoritesStore.splice(idx, 1)
}

export function addReviewToStore(review: Review) {
  reviewsStore.push(review)
}
