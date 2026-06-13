import type { Salon, Service, Booking, Review, Favorite, Offer, SearchFilters, DashboardMetrics } from "@/types"

const BASE = "/api"

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
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
  return request<{ bookings: Booking[]; total: number }>(`/bookings?userId=${userId}`)
}

export async function createBooking(data: {
  user_id: string
  salon_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time?: string
  is_home_service?: boolean
  home_address?: string
  notes?: string
}) {
  return request<Booking>(`/bookings`, { method: "POST", body: JSON.stringify(data) })
}

export async function updateBooking(id: string, data: { status?: string; notes?: string }) {
  return request<Booking>(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) })
}

// Reviews
export async function getSalonReviews(salonId: string) {
  return request<{ reviews: Review[] }>(`/reviews?salonId=${salonId}`)
}

export async function createReview(data: {
  user_id: string
  salon_id: string
  booking_id?: string
  rating: number
  title?: string
  comment?: string
}) {
  return request<Review>(`/reviews`, { method: "POST", body: JSON.stringify(data) })
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
  return request<{ salons: Salon[]; reasoning: string; intent: any }>(`/ai/search`, {
    method: "POST", body: JSON.stringify({ query, filters }),
  })
}

export async function aiChat(message: string, userId?: string, sessionId?: string) {
  return request<{ response: string; recommendations?: Salon[]; intent?: any }>(`/ai/chat`, {
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
import type { BookingStatus } from "@/types"

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
