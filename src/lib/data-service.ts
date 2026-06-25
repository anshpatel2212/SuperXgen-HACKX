import type { Salon, Service, Review, Booking, Favorite, Offer, Category, AvailabilitySlot, SalonMetrics, OwnerDashboardMetrics, Gender, LuxuryLevel, WorkingHours, BookingStatus } from "@/types"
import { SALONS, SERVICES, OFFERS, CATEGORIES } from "@/data"
import { bookingsStore, favoritesStore, slotsStore } from "@/lib/store"
import { createDemoReview, syncReviewsToLegacyStore } from "@/lib/demo-reviews"
import { computeFinalPrice, computeSalonMetrics, computeOwnerDashboardMetrics, computePlatformMetrics, updateSalonPriceRange } from "@/services/calculations"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

syncReviewsToLegacyStore()

export function recomputeSalonMetrics(salonId: string): SalonMetrics {
  const metrics = computeSalonMetrics(salonId)
  updateSalonPriceRange(salonId)
  return metrics
}

export function recomputeOwnerMetrics(ownerId: string): OwnerDashboardMetrics {
  return computeOwnerDashboardMetrics(ownerId)
}

export function getPlatformMetrics(): ReturnType<typeof computePlatformMetrics> {
  return computePlatformMetrics()
}

export function recalculateSalonPriceRange(salonId: string): void {
  updateSalonPriceRange(salonId)
}

// Salon CRUD
export function createSalon(data: {
  owner_id: string
  name: string
  area: string
  city: string
  pincode?: string
  phone?: string
  email?: string
  description?: string
  tagline?: string
  address?: string
  latitude?: number
  longitude?: number
  gender?: Gender
  luxury_level?: LuxuryLevel
  offers_home_service?: boolean
  home_service_radius_km?: number
  categories_offered?: string[]
  staff_count?: number
  payment_modes?: string[]
  cancellation_policy?: string
  hygiene_practices?: string[]
  working_hours_json?: WorkingHours
  weekly_off?: string[]
  cover_image?: string
  gallery?: string[]
  amenities?: string[]
}): Salon {
  const salon: Salon = {
    id: generateId("s"),
    owner_id: data.owner_id,
    name: data.name,
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: data.description || "",
    ai_description: "",
    tagline: data.tagline || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    area: data.area,
    city: data.city || "Mumbai",
    pincode: data.pincode || "",
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    gender: data.gender || "unisex",
    luxury_level: data.luxury_level || "mid",
    offers_home_service: data.offers_home_service || false,
    home_service_radius_km: data.home_service_radius_km || 0,
    rating_avg: 0,
    review_count: 0,
    total_bookings: 0,
    price_range: "",
    cover_image: data.cover_image || "",
    gallery: data.gallery || [],
    images: data.gallery || [],
    logo_url: "",
    cover_url: data.cover_image || "",
    amenities: data.amenities || [],
    payment_modes: data.payment_modes || [],
    cancellation_policy: data.cancellation_policy || "Free cancellation up to 24 hours before appointment.",
    hygiene_practices: data.hygiene_practices || [],
    working_hours_json: data.working_hours_json || {},
    weekly_off: data.weekly_off || [],
    staff_count: data.staff_count || 1,
    categories_offered: data.categories_offered || [],
    status: "pending",
    featured: false,
    verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  SALONS.push(salon)
  return salon
}

export function updateSalon(id: string, data: Partial<Salon>): Salon | undefined {
  const idx = SALONS.findIndex((s) => s.id === id)
  if (idx === -1) return undefined
  SALONS[idx] = { ...SALONS[idx], ...data, updated_at: new Date().toISOString() }
  return SALONS[idx]
}

export function deleteSalon(id: string): boolean {
  const idx = SALONS.findIndex((s) => s.id === id)
  if (idx === -1) return false
  SALONS.splice(idx, 1)
  return true
}

export function getOwnerSalons(ownerId: string): Salon[] {
  return SALONS.filter((s) => s.owner_id === ownerId)
}

// Service CRUD with auto final_price calculation
export function createService(data: {
  salon_id: string
  name: string
  category: string
  price: number
  duration_minutes: number
  buffer_before_minutes?: number
  buffer_after_minutes?: number
  required_staff_count?: number
  required_resource_type?: string
  instant_booking_allowed?: boolean
  group_booking_allowed?: boolean
  confirmation_required?: boolean
  discount_percent?: number
  description?: string
  gender?: Gender
  is_home_service?: boolean
  is_popular?: boolean
  active?: boolean
}): Service {
  const price = data.price
  const discountPercent = data.discount_percent || 0
  const finalPrice = computeFinalPrice(price, discountPercent)

  const service: Service = {
    id: generateId("sv"),
    salon_id: data.salon_id,
    name: data.name,
    description: data.description || "",
    ai_description: "",
    category: data.category,
    duration_minutes: data.duration_minutes || 30,
    buffer_before_minutes: Math.max(0, data.buffer_before_minutes || 0),
    buffer_after_minutes: Math.max(0, data.buffer_after_minutes || 0),
    required_staff_count: Math.max(1, data.required_staff_count || 1),
    required_resource_type: data.required_resource_type || "General chair",
    instant_booking_allowed: data.instant_booking_allowed !== false,
    group_booking_allowed: data.group_booking_allowed !== false,
    confirmation_required: data.confirmation_required || false,
    price: price,
    discount_percent: discountPercent,
    discounted_price: discountPercent > 0 ? finalPrice : 0,
    final_price: finalPrice,
    gender: data.gender || "unisex",
    is_home_service: data.is_home_service || false,
    is_popular: data.is_popular || false,
    active: data.active !== undefined ? data.active : true,
    images: [],
    created_at: new Date().toISOString(),
  }
  SERVICES.push(service)
  recomputeSalonMetrics(data.salon_id)
  return service
}

export function updateService(id: string, data: Partial<Service>): Service | undefined {
  const idx = SERVICES.findIndex((s) => s.id === id)
  if (idx === -1) return undefined

  const current = SERVICES[idx]
  const newPrice = data.price ?? current.price
  const newDiscount = data.discount_percent ?? current.discount_percent
  const finalPrice = computeFinalPrice(newPrice, newDiscount)

  SERVICES[idx] = { ...current, ...data, final_price: finalPrice }

  if (data.salon_id || data.price !== undefined || data.discount_percent !== undefined) {
    recomputeSalonMetrics(SERVICES[idx].salon_id)
  }

  return SERVICES[idx]
}

export function deleteService(id: string): boolean {
  const svc = SERVICES.find((s) => s.id === id)
  const idx = SERVICES.findIndex((s) => s.id === id)
  if (idx === -1) return false
  SERVICES.splice(idx, 1)
  if (svc) recomputeSalonMetrics(svc.salon_id)
  return true
}

export function getSalonServices(salonId: string): Service[] {
  return SERVICES.filter((s) => s.salon_id === salonId)
}

export function getActiveSalonServices(salonId: string): Service[] {
  return SERVICES.filter((s) => s.salon_id === salonId && s.active)
}

// Slot CRUD
export function createSlot(data: {
  salon_id: string
  service_id?: string
  slot_date: string
  start_time: string
  end_time: string
  capacity: number
}): AvailabilitySlot {
  const slot: AvailabilitySlot = {
    id: generateId("sl"),
    salon_id: data.salon_id,
    service_id: data.service_id || null,
    slot_date: data.slot_date,
    start_time: data.start_time,
    end_time: data.end_time,
    is_available: true,
    capacity: data.capacity,
    booked_count: 0,
    created_at: new Date().toISOString(),
  }
  slotsStore.push(slot)
  return slot
}

export function updateSlot(id: string, data: Partial<AvailabilitySlot>): AvailabilitySlot | undefined {
  const idx = slotsStore.findIndex((s) => s.id === id)
  if (idx === -1) return undefined
  slotsStore[idx] = { ...slotsStore[idx], ...data }
  return slotsStore[idx]
}

export function deleteSlot(id: string): boolean {
  const idx = slotsStore.findIndex((s) => s.id === id)
  if (idx === -1) return false
  slotsStore.splice(idx, 1)
  return true
}

export function getSalonSlots(salonId: string): AvailabilitySlot[] {
  return slotsStore.filter((s) => s.salon_id === salonId)
}

export function getSalonSlotsByDate(salonId: string, date: string): AvailabilitySlot[] {
  return slotsStore.filter((s) => s.salon_id === salonId && s.slot_date === date)
}

// Offer CRUD
export function createOffer(data: {
  salon_id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase?: number
  max_discount?: number
  coupon_code?: string
  valid_from: string
  valid_till: string
}): Offer {
  const offer: Offer = {
    id: generateId("o"),
    salon_id: data.salon_id,
    title: data.title,
    description: data.description,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_purchase: data.min_purchase || 0,
    max_discount: data.max_discount || 0,
    coupon_code: data.coupon_code || "",
    valid_from: data.valid_from,
    valid_till: data.valid_till,
    is_active: true,
    created_at: new Date().toISOString(),
  }
  OFFERS.push(offer)
  return offer
}

export function updateOffer(id: string, data: Partial<Offer>): Offer | undefined {
  const idx = OFFERS.findIndex((o) => o.id === id)
  if (idx === -1) return undefined
  OFFERS[idx] = { ...OFFERS[idx], ...data }
  return OFFERS[idx]
}

export function deleteOffer(id: string): boolean {
  const idx = OFFERS.findIndex((o) => o.id === id)
  if (idx === -1) return false
  OFFERS.splice(idx, 1)
  return true
}

export function getSalonOffers(salonId: string): Offer[] {
  return OFFERS.filter((o) => o.salon_id === salonId)
}

// Booking helpers
export function createBooking(data: Omit<Booking, "id" | "created_at">): Booking {
  const booking: Booking = {
    ...data,
    id: generateId("b"),
    created_at: new Date().toISOString(),
  }
  bookingsStore.push(booking)
  if (data.salon_id) recomputeSalonMetrics(data.salon_id)
  return booking
}

export function updateBookingStatus(id: string, status: BookingStatus, timestamp?: string): Booking | undefined {
  const idx = bookingsStore.findIndex((b) => b.id === id)
  if (idx === -1) return undefined

  const update: Partial<Booking> = { status }
  if (status === 'confirmed') update.confirmed_at = timestamp || new Date().toISOString()
  if (status === 'completed') update.completed_at = timestamp || new Date().toISOString()
  if (status === 'cancelled') update.cancelled_at = timestamp || new Date().toISOString()

  bookingsStore[idx] = { ...bookingsStore[idx], ...update, updated_at: new Date().toISOString() }

  if (bookingsStore[idx].salon_id) recomputeSalonMetrics(bookingsStore[idx].salon_id)

  return bookingsStore[idx]
}

// Review helpers
export function createReview(data: {
  user_id: string
  salon_id: string
  booking_id?: string
  rating: number
  title?: string
  comment?: string
}): Review {
  const review = createDemoReview({
    user_id: data.user_id,
    salon_id: data.salon_id,
    booking_id: data.booking_id || "",
    rating: data.rating,
    title: data.title || "",
    comment: data.comment || "",
  })
  recomputeSalonMetrics(data.salon_id)
  return review
}

// Favorite helpers
export function addFavorite(userId: string, salonId: string): Favorite {
  const existing = favoritesStore.find((f) => f.user_id === userId && f.salon_id === salonId)
  if (existing) return existing
  const fav: Favorite = {
    id: generateId("f"),
    user_id: userId,
    salon_id: salonId,
    created_at: new Date().toISOString(),
  }
  favoritesStore.push(fav)
  return fav
}

export function removeFavorite(userId: string, salonId: string): boolean {
  const idx = favoritesStore.findIndex((f) => f.user_id === userId && f.salon_id === salonId)
  if (idx === -1) return false
  favoritesStore.splice(idx, 1)
  return true
}

export function getUserFavorites(userId: string): Favorite[] {
  return favoritesStore.filter((f) => f.user_id === userId).map(f => ({
    ...f,
    salon: SALONS.find((s) => s.id === f.salon_id),
  }))
}

// Enriched data queries
export function getUserBookings(userId: string): Booking[] {
  return bookingsStore
    .filter((b) => b.user_id === userId)
    .map((b) => ({
      ...b,
      salon: SALONS.find((s) => s.id === b.salon_id) || b.salon,
      service: SERVICES.find((s) => s.id === b.service_id) || b.service,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getOwnerBookings(ownerId: string): Booking[] {
  const salonIds = SALONS.filter((s) => s.owner_id === ownerId).map((s) => s.id)
  return bookingsStore
    .filter((b) => salonIds.includes(b.salon_id))
    .map((b) => ({
      ...b,
      salon: SALONS.find((s) => s.id === b.salon_id) || b.salon,
      service: SERVICES.find((s) => s.id === b.service_id) || b.service,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getSalonById(salonId: string): Salon | undefined {
  return SALONS.find((s) => s.id === salonId)
}

export function getServiceById(serviceId: string): Service | undefined {
  return SERVICES.find((s) => s.id === serviceId)
}

export function getAllSalons(): Salon[] {
  return SALONS.filter(s => s.status === 'approved' || s.status === 'featured')
}

export function getAllSalonsAdmin(): Salon[] {
  return [...SALONS]
}

export function getAllServices(): Service[] {
  return [...SERVICES]
}

export function getAllOffers(): Offer[] {
  return [...OFFERS]
}

export function getCategories(): Category[] {
  return [...CATEGORIES]
}

export function getSalonMetrics(salonId: string): SalonMetrics {
  return recomputeSalonMetrics(salonId)
}
