import type { SalonMetrics, Service, AvailabilitySlot, Booking, Offer, Review, PlatformMetrics, OwnerDashboardMetrics } from '@/types'
import { SALONS, SERVICES, OFFERS, REVIEWS } from '@/data'
import { bookingsStore, slotsStore } from '@/lib/store'
import { filterDemoReviews, getDemoReviews, getReviewsBySalon } from '@/lib/demo-reviews'

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

export function computeFinalPrice(price: number, discountPercent: number): number {
  return Math.round(price - (price * discountPercent / 100))
}

export function computeServiceFinalPrices(service: { price: number; discount_percent: number }): number {
  return computeFinalPrice(service.price, service.discount_percent)
}

export function getSalonServices(salonId: string): Service[] {
  return SERVICES.filter(s => s.salon_id === salonId && s.active)
}

export function getSalonBookings(salonId: string): Booking[] {
  return bookingsStore.filter(b => b.salon_id === salonId)
}

export function getSalonReviews(salonId: string): Review[] {
  return getReviewsBySalon(salonId, { publicOnly: true })
}

export function getSalonOffers(salonId: string): Offer[] {
  return OFFERS.filter(o => o.salon_id === salonId && o.is_active)
}

export function getSalonSlots(salonId: string): AvailabilitySlot[] {
  return slotsStore.filter(s => s.salon_id === salonId)
}

export function computeSalonMetrics(salonId: string, isStatic = false): SalonMetrics {
  const services = getSalonServices(salonId)
  const bookings = isStatic ? [] : getSalonBookings(salonId)
  const reviews = isStatic
    ? REVIEWS.filter(r => r.salon_id === salonId && r.status === 'approved' && !r.is_moderated)
    : getSalonReviews(salonId)
  const slots = isStatic ? [] : getSalonSlots(salonId)

  const activeServices = services.filter(s => s.active)

  const prices = activeServices.map(s => s.final_price || computeFinalPrice(s.price, s.discount_percent))
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0

  const categoryServiceCounts: Record<string, number> = {}
  activeServices.forEach(s => {
    categoryServiceCounts[s.category] = (categoryServiceCounts[s.category] || 0) + 1
  })

  const completedBookings = bookings.filter(b => b.status === 'completed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  const revenueTotal = completedBookings.reduce((sum, b) => sum + b.total_price, 0)

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const revenueWeek = completedBookings
    .filter(b => new Date(b.completed_at || b.created_at) >= weekAgo)
    .reduce((sum, b) => sum + b.total_price, 0)

  const revenueMonth = completedBookings
    .filter(b => new Date(b.completed_at || b.created_at) >= monthAgo)
    .reduce((sum, b) => sum + b.total_price, 0)

  const nextWeekStart = new Date(now)
  nextWeekStart.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7))
  nextWeekStart.setHours(0, 0, 0, 0)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekStart.getDate() + 7)

  const weekSlots = slots.filter(s => {
    const d = new Date(s.slot_date)
    return d >= nextWeekStart && d < nextWeekEnd
  })

  const slotCapacityWeek = weekSlots.reduce((sum, s) => sum + s.capacity, 0)
  const slotBookedWeek = weekSlots.reduce((sum, s) => sum + s.booked_count, 0)
  const slotUtilizationPercent = slotCapacityWeek > 0
    ? Math.round((slotBookedWeek / slotCapacityWeek) * 100)
    : 0

  const responseTimes: number[] = []
  bookings.forEach(b => {
    if (b.confirmed_at && b.created_at) {
      const diff = new Date(b.confirmed_at).getTime() - new Date(b.created_at).getTime()
      responseTimes.push(Math.round(diff / 60000))
    }
  })
  const avgResponseTimeMinutes = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  const salon = SALONS.find(s => s.id === salonId)
  const isVerified = salon?.verified || false
  const ratingAvg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : salon?.rating_avg || 0
  const reviewCount = reviews.length || salon?.review_count || 0
  const completionRate = bookings.length > 0
    ? Math.round((completedBookings.length / bookings.length) * 100)
    : 0

  const trustScore = computeTrustScore({
    isVerified,
    ratingAvg,
    reviewCount,
    avgResponseTimeMinutes,
    completionRate,
  })

  const bookingCountByService: Record<string, number> = {}
  bookings.forEach(b => {
    if (b.service_id) {
      bookingCountByService[b.service_id] = (bookingCountByService[b.service_id] || 0) + 1
    }
  })
  const sortedServices = Object.entries(bookingCountByService).sort(([, a], [, b]) => b - a)
  const topServiceId = sortedServices.length > 0 ? sortedServices[0][0] : null
  const topServiceObj = topServiceId ? SERVICES.find(s => s.id === topServiceId) : null
  const topServiceName = topServiceObj?.name || null

  const bookingCountByCategory: Record<string, number> = {}
  bookings.forEach(b => {
    const svc = SERVICES.find(s => s.id === b.service_id)
    if (svc?.category) {
      bookingCountByCategory[svc.category] = (bookingCountByCategory[svc.category] || 0) + 1
    }
  })
  const sortedCategories = Object.entries(bookingCountByCategory).sort(([, a], [, b]) => b - a)
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : null

  const popularServicesData = sortedServices.slice(0, 5).map(([id, count]) => {
    const svc = SERVICES.find(s => s.id === id)
    return { id, name: svc?.name || 'Unknown', booking_count: count }
  })

  return {
    id: generateId('sm'),
    salon_id: salonId,
    total_services: activeServices.length,
    min_price: minPrice,
    max_price: maxPrice,
    avg_price: avgPrice,
    average_rating: ratingAvg,
    review_count: reviewCount,
    category_service_counts: categoryServiceCounts,
    total_bookings: bookings.length,
    completed_bookings: completedBookings.length,
    cancelled_bookings: cancelledBookings.length,
    revenue_total: revenueTotal,
    revenue_week: revenueWeek,
    revenue_month: revenueMonth,
    slot_capacity_week: slotCapacityWeek,
    slot_booked_week: slotBookedWeek,
    slot_utilization_percent: slotUtilizationPercent,
    avg_response_time_minutes: avgResponseTimeMinutes,
    trust_score: trustScore,
    top_service_id: topServiceId,
    top_service_name: topServiceName,
    top_category: topCategory,
    popular_services: popularServicesData,
    updated_at: new Date().toISOString(),
  }
}

export function computeTrustScore(params: {
  isVerified: boolean
  ratingAvg: number
  reviewCount: number
  avgResponseTimeMinutes: number
  completionRate: number
}): number {
  let score = 0

  score += params.isVerified ? 20 : 0

  score += Math.min(params.ratingAvg * 10, 25)

  score += Math.min(params.reviewCount / 50, 15)

  if (params.avgResponseTimeMinutes <= 15) score += 15
  else if (params.avgResponseTimeMinutes <= 30) score += 12
  else if (params.avgResponseTimeMinutes <= 60) score += 8
  else if (params.avgResponseTimeMinutes <= 120) score += 4
  else score += 0

  score += Math.min(params.completionRate * 0.25, 25)

  return Math.round(Math.min(score, 100))
}

export function computePlatformMetrics(): PlatformMetrics & { charts: { bookings_over_time: { date: string; count: number }[]; revenue_over_time: { date: string; amount: number }[] } } {
  const users = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('glowgo_users') || '{}' : '{}')
  const usersList = Object.values(users) as { user: { role: string } }[]
  const totalUsers = usersList.length
  const totalOwners = usersList.filter((u) => u.user.role === 'owner').length

  const totalSalons = SALONS.length
  const verifiedSalons = SALONS.filter(s => s.verified).length
  const totalBookings = bookingsStore.length
  const completedBookings = bookingsStore.filter(b => b.status === 'completed')
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0)

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const revenueMonth = completedBookings
    .filter(b => new Date(b.completed_at || b.created_at) >= monthAgo)
    .reduce((sum, b) => sum + b.total_price, 0)

  const activeOffers = OFFERS.filter(o => o.is_active).length
  const pendingApprovals = SALONS.filter(s => s.status === 'pending').length

  const cityCounts: Record<string, number> = {}
  SALONS.forEach(s => { cityCounts[s.city] = (cityCounts[s.city] || 0) + 1 })
  const topCity = Object.entries(cityCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Mumbai'

  const categoryBookingCounts: Record<string, number> = {}
  bookingsStore.forEach(b => {
    const svc = SERVICES.find(s => s.id === b.service_id)
    if (svc?.category) {
      categoryBookingCounts[svc.category] = (categoryBookingCounts[svc.category] || 0) + 1
    }
  })
  const topCategory = Object.entries(categoryBookingCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || ''

  const allReviews = filterDemoReviews(getDemoReviews(), { publicOnly: true })
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const bookingsOverTime = last30Days.map(date => ({
    date,
    count: bookingsStore.filter(b => b.created_at?.startsWith(date)).length,
  }))

  const revenueOverTime = last30Days.map(date => ({
    date,
    amount: completedBookings
      .filter(b => (b.completed_at || b.created_at)?.startsWith(date))
      .reduce((sum, b) => sum + b.total_price, 0),
  }))

  return {
    id: 'platform_metrics',
    total_users: totalUsers,
    total_owners: totalOwners,
    total_salons: totalSalons,
    total_verified_salons: verifiedSalons,
    total_bookings: totalBookings,
    total_revenue: totalRevenue,
    revenue_this_month: revenueMonth,
    active_offers: activeOffers,
    pending_approvals: pendingApprovals,
    top_city: topCity,
    top_category: topCategory,
    average_rating: Math.round(avgRating * 10) / 10,
    total_reviews: allReviews.length,
    updated_at: new Date().toISOString(),
    charts: { bookings_over_time: bookingsOverTime, revenue_over_time: revenueOverTime },
  }
}

export function computeOwnerDashboardMetrics(ownerId: string): OwnerDashboardMetrics {
  const ownerSalons = SALONS.filter(s => s.owner_id === ownerId)
  const salonIds = ownerSalons.map(s => s.id)

  if (salonIds.length === 0) {
    return {
      total_bookings: 0, confirmed_bookings: 0, completed_bookings: 0, cancelled_bookings: 0,
      revenue_total: 0, revenue_week: 0, revenue_month: 0, average_rating: 0, total_reviews: 0,
      total_services: 0, slot_utilization_rate: 0, top_service: '', top_category: '',
      response_time_minutes: 0, trust_score: 0, recent_bookings: [],
      services_distribution: [], revenue_over_time: [], bookings_over_time: [],
    }
  }

  const allMetrics = salonIds.map(id => computeSalonMetrics(id))
  const allServices = salonIds.flatMap(getSalonServices)
  const allBookings = salonIds.flatMap(getSalonBookings)
  const allReviews = salonIds.flatMap(getSalonReviews)
  const totalBookings = allBookings.length
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length
  const completedBookings = allBookings.filter(b => b.status === 'completed').length
  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length

  const revenueTotal = allMetrics.reduce((sum, m) => sum + m.revenue_total, 0)
  const revenueWeek = allMetrics.reduce((sum, m) => sum + m.revenue_week, 0)
  const revenueMonth = allMetrics.reduce((sum, m) => sum + m.revenue_month, 0)

  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0

  const slotUtilization = allMetrics.length > 0
    ? Math.round(allMetrics.reduce((sum, m) => sum + m.slot_utilization_percent, 0) / allMetrics.length)
    : 0

  const avgResponseTime = allMetrics.length > 0
    ? Math.round(allMetrics.reduce((sum, m) => sum + m.avg_response_time_minutes, 0) / allMetrics.length)
    : 0

  const avgTrustScore = allMetrics.length > 0
    ? Math.round(allMetrics.reduce((sum, m) => sum + m.trust_score, 0) / allMetrics.length)
    : 0

  const bookingCountByService: Record<string, number> = {}
  allBookings.forEach(b => {
    if (b.service_id) bookingCountByService[b.service_id] = (bookingCountByService[b.service_id] || 0) + 1
  })
  const topSvc = Object.entries(bookingCountByService).sort(([, a], [, b]) => b - a)[0]
  const topServiceName = topSvc ? SERVICES.find(s => s.id === topSvc[0])?.name || '' : ''

  const bookingCountByCategory: Record<string, number> = {}
  allBookings.forEach(b => {
    const svc = SERVICES.find(s => s.id === b.service_id)
    if (svc?.category) bookingCountByCategory[svc.category] = (bookingCountByCategory[svc.category] || 0) + 1
  })
  const topCategoryName = Object.entries(bookingCountByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || ''

  const servicesDistData = Object.entries(bookingCountByCategory)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const revenueTime = last30Days.map(date => ({
    date,
    amount: allBookings
      .filter(b => b.status === 'completed' && (b.completed_at || b.created_at)?.startsWith(date))
      .reduce((sum, b) => sum + b.total_price, 0),
  }))

  const bookingsTime = last30Days.map(date => ({
    date,
    count: allBookings.filter(b => b.created_at?.startsWith(date)).length,
  }))

  const recent = allBookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(b => ({
      ...b,
      salon: SALONS.find(s => s.id === b.salon_id) || b.salon,
      service: SERVICES.find(s => s.id === b.service_id) || b.service,
    }))

  return {
    total_bookings: totalBookings,
    confirmed_bookings: confirmedBookings,
    completed_bookings: completedBookings,
    cancelled_bookings: cancelledBookings,
    revenue_total: revenueTotal,
    revenue_week: revenueWeek,
    revenue_month: revenueMonth,
    average_rating: Math.round(avgRating * 10) / 10,
    total_reviews: allReviews.length,
    total_services: allServices.filter(s => s.active).length,
    slot_utilization_rate: slotUtilization,
    top_service: topServiceName,
    top_category: topCategoryName,
    response_time_minutes: avgResponseTime,
    trust_score: avgTrustScore,
    recent_bookings: recent,
    services_distribution: servicesDistData,
    revenue_over_time: revenueTime,
    bookings_over_time: bookingsTime,
  }
}

export function computeTrustScoreBadge(score: number): { label: string; color: string; icon: string } {
  if (score >= 85) return { label: 'Highly Trusted', color: 'bg-green-100 text-green-800 border-green-300', icon: 'ShieldCheck' }
  if (score >= 70) return { label: 'Trusted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'ShieldCheck' }
  if (score >= 50) return { label: 'Verified', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'Shield' }
  if (score >= 30) return { label: 'Emerging', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: 'Shield' }
  return { label: 'New', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: 'Info' }
}

export function computeResponseTimeBadge(minutes: number): { label: string; color: string } {
  if (minutes <= 15) return { label: 'Lightning Fast', color: 'bg-purple-100 text-purple-800' }
  if (minutes <= 30) return { label: 'Very Fast', color: 'bg-green-100 text-green-800' }
  if (minutes <= 60) return { label: 'Fast', color: 'bg-emerald-100 text-emerald-800' }
  if (minutes <= 120) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' }
  return { label: 'Slow', color: 'bg-red-100 text-red-800' }
}

export function getEffectivePriceWithOffers(service: Service, salonOffers: Offer[]): {
  effectivePrice: number
  bestOffer: Offer | null
  savings: number
} {
  const basePrice = service.final_price || computeFinalPrice(service.price, service.discount_percent)
  let bestSavings = 0
  let bestOffer: Offer | null = null

  salonOffers.forEach(offer => {
    if (basePrice < offer.min_purchase) return
    let savings = 0
    if (offer.discount_type === 'percentage') {
      savings = Math.round(basePrice * offer.discount_value / 100)
      if (offer.max_discount > 0) savings = Math.min(savings, offer.max_discount)
    } else {
      savings = offer.discount_value
    }
    if (savings > bestSavings) {
      bestSavings = savings
      bestOffer = offer
    }
  })

  return {
    effectivePrice: basePrice - bestSavings,
    bestOffer,
    savings: bestSavings,
  }
}

export function updateSalonPriceRange(salonId: string): void {
  const metrics = computeSalonMetrics(salonId)
  const salon = SALONS.find(s => s.id === salonId)
  if (!salon) return

  const { min_price, max_price } = metrics
  const priceRange = min_price > 0
    ? `₹${min_price.toLocaleString('en-IN')}-₹${max_price.toLocaleString('en-IN')}`
    : ''

  const idx = SALONS.findIndex(s => s.id === salonId)
  if (idx >= 0) {
    SALONS[idx] = {
      ...SALONS[idx],
      price_range: priceRange,
      rating_avg: metrics.completed_bookings > 0
        ? getSalonReviews(salonId).reduce((sum, r) => sum + r.rating, 0) / Math.max(getSalonReviews(salonId).length, 1)
        : salon.rating_avg,
      review_count: getSalonReviews(salonId).length || salon.review_count,
      total_bookings: metrics.total_bookings,
      updated_at: new Date().toISOString(),
    }
  }
}

export function recalculateAllSalonMetrics(): Record<string, SalonMetrics> {
  const allMetrics: Record<string, SalonMetrics> = {}
  SALONS.forEach(salon => {
    const metrics = computeSalonMetrics(salon.id)
    allMetrics[salon.id] = metrics
    updateSalonPriceRange(salon.id)
  })
  return allMetrics
}
