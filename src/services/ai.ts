import type {
  AIIntent, Salon, Service, SearchFilters, AIRecommendationResponse,
  AIRecommendation, AIReviewSummary, AIBeautyProfileInsights,
  AIOwnerSuggestions, Review, Booking, BeautyProfile
} from '@/types'
import { SALONS, SERVICES, OFFERS } from '@/data'
import { reviewsStore, bookingsStore } from '@/lib/store'
import {
  computeSalonMetrics, computeTrustScoreBadge, computeResponseTimeBadge,
  getEffectivePriceWithOffers, getSalonOffers, getSalonServices,
  computeFinalPrice
} from '@/services/calculations'
import { MUMBAI_AREAS, formatPrice, parsePriceRange } from '@/lib/utils'

const SERVICE_KEYWORDS: Record<string, string[]> = {
  'Bridal Makeup': ['bridal', 'wedding', 'bride', 'engagement makeup', 'wedding makeup'],
  'Facial': ['facial', 'glow', 'skin treatment', 'cleaning', 'cleanup', 'hydrafacial'],
  'Haircut': ['haircut', 'hair cut', 'trim', 'hair styling', 'cut'],
  'Hair Color': ['hair color', 'hair colour', 'dye', 'highlights', 'balayage', 'ombre'],
  'Manicure': ['manicure', 'nail', 'nail art', 'gel'],
  'Pedicure': ['pedicure', 'nail', 'foot'],
  'Spa': ['spa', 'massage', 'relaxation', 'wellness', 'aromatherapy'],
  'Waxing': ['wax', 'waxing', 'hair removal'],
  'Threading': ['threading', 'eyebrow', 'brow'],
  'Bleach': ['bleach', 'detan'],
  'Massage': ['massage', 'swedish', 'deep tissue'],
  'Hair Treatment': ['hair treatment', 'hair spa', 'keratin', 'scalp'],
  'Grooming': ['grooming', 'beard', 'shave', 'men\'s grooming'],
}

const GENDER_KEYWORDS: Record<string, string[]> = {
  women: ['women', 'woman', 'female', 'ladies', 'girl', 'bridal', 'makeup'],
  men: ['men', 'man', 'male', 'gents', 'grooming', 'beard', 'guy'],
}

const AREA_SYNONYMS: Record<string, string[]> = {
  'Andheri': ['andheri', 'andheri west', 'andheri east', 'versova'],
  'Bandra': ['bandra', 'bandra west', 'bandra east', 'bandstand'],
  'Juhu': ['juhu', 'juhu beach', 'juhu tara'],
  'Colaba': ['colaba', 'colaba causeway', 'cuffe parade'],
  'Powai': ['powai', 'iit powai'],
  'Malad': ['malad', 'malad west', 'malad east'],
  'Borivali': ['borivali', 'borivali west', 'borivali east'],
  'Lower Parel': ['lower parel', 'lower parel', 'phoenix'],
  'Worli': ['worli', 'worli sea face'],
  'Dadar': ['dadar', 'dadar west', 'dadar east', 'plaza'],
  'Chembur': ['chembur', 'chembur west', 'chembur east'],
  'Ghatkopar': ['ghatkopar', 'ghatkopar west', 'ghatkopar east'],
}

export function extractIntent(query: string): AIIntent {
  const lowerQuery = query.toLowerCase()
  const intent: AIIntent = {
    type: 'search',
    service_type: '',
    budget_max: null,
    location_area: '',
    city: 'Mumbai',
    date: '',
    time_preference: '',
    service_mode: 'salon',
    concerns: [],
    luxury_preference: '',
    gender_preference: '',
    raw_query: query,
  }

  const matchedServices: string[] = []
  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      matchedServices.push(service)
    }
  }
  if (matchedServices.length > 0) {
    intent.services = matchedServices
    intent.service_type = matchedServices[0]
  }

  const budgetMatch = lowerQuery.match(/under\s*₹?\s*(\d{4,})/i) || lowerQuery.match(/₹?\s*(\d{4,})\s*(?:rs)?/i)
  if (budgetMatch) {
    const max = parseInt(budgetMatch[1])
    intent.budget = { min: 0, max }
    intent.budget_max = max
  }

  const rangeMatch = lowerQuery.match(/(\d{4,})\s*(?:-|to)\s*(\d{4,})/i)
  if (rangeMatch) {
    intent.budget = { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) }
    intent.budget_max = parseInt(rangeMatch[2])
  }

  for (const [area, synonyms] of Object.entries(AREA_SYNONYMS)) {
    if (synonyms.some((syn) => lowerQuery.includes(syn))) {
      intent.area = area
      intent.location_area = area
      break
    }
  }

  const today = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  const datePatterns: [RegExp, () => string][] = [
    [/this\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i, () => {
      const match = lowerQuery.match(/this\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i)
      if (!match) return ''
      const targetDay = dayNames.indexOf(match[1].toLowerCase())
      const currentDay = today.getDay()
      let diff = targetDay - currentDay
      if (diff <= 0) diff += 7
      const date = new Date(today)
      date.setDate(today.getDate() + diff)
      return date.toISOString().split('T')[0]
    }],
    [/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i, () => {
      const match = lowerQuery.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i)
      if (!match) return ''
      const targetDay = dayNames.indexOf(match[1].toLowerCase())
      const currentDay = today.getDay()
      let diff = targetDay - currentDay
      if (diff <= 0) diff += 7
      diff += 7
      const date = new Date(today)
      date.setDate(today.getDate() + diff)
      return date.toISOString().split('T')[0]
    }],
    [/tomorrow/i, () => {
      const date = new Date(today)
      date.setDate(today.getDate() + 1)
      return date.toISOString().split('T')[0]
    }],
    [/today/i, () => today.toISOString().split('T')[0]],
  ]

  for (const [pattern, getDate] of datePatterns) {
    if (pattern.test(lowerQuery)) {
      intent.date = getDate()
      break
    }
  }

  const timeMatch = lowerQuery.match(/(\d{1,2}):?(\d{2})\s*(am|pm)/i)
  if (timeMatch) {
    intent.time_preference = timeMatch[0].trim()
  }

  for (const [gender, keywords] of Object.entries(GENDER_KEYWORDS)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      intent.gender = gender as 'women' | 'men' | 'unisex'
      intent.gender_preference = gender
      break
    }
  }

  if (lowerQuery.includes('home service') || lowerQuery.includes('at home') || lowerQuery.includes('home')) {
    intent.is_home_service = true
    intent.service_mode = 'home'
  }

  if (lowerQuery.includes('luxury') || lowerQuery.includes('premium') || lowerQuery.includes('high end')) {
    intent.is_luxury = true
    intent.luxury_preference = 'luxury'
  }

  if (lowerQuery.includes('budget') || lowerQuery.includes('affordable') || lowerQuery.includes('cheap')) {
    intent.luxury_preference = 'budget'
  }

  if (lowerQuery.includes('summarize') || lowerQuery.includes('review') || lowerQuery.includes('tell me about')) {
    intent.type = 'summarize'
  } else if (lowerQuery.includes('what do you recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('recommend')) {
    intent.type = 'recommend'
  }

  return intent
}

function getLiveContextForSalon(salonId: string) {
  const salon = SALONS.find(s => s.id === salonId)
  if (!salon) return null

  const metrics = computeSalonMetrics(salonId)
  const services = getSalonServices(salonId)
  const offers = getSalonOffers(salonId)
  const trustBadge = computeTrustScoreBadge(metrics.trust_score)
  const responseBadge = computeResponseTimeBadge(metrics.avg_response_time_minutes)
  const reviews = reviewsStore.filter(r => r.salon_id === salonId)

  return {
    salon,
    metrics,
    services: services.map(s => ({
      ...s,
      final_price: s.final_price || computeFinalPrice(s.price, s.discount_percent),
      offers_applied: offers.length > 0
        ? getEffectivePriceWithOffers(s, offers)
        : null,
    })),
    offers: offers.map(o => ({
      ...o,
      is_valid: new Date(o.valid_till) >= new Date(),
      days_remaining: Math.ceil((new Date(o.valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })),
    trust_badge: trustBadge,
    response_badge: responseBadge,
    review_count: reviews.length,
    average_rating: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : salon.rating_avg,
  }
}

export function buildSearchContext(query: string): {
  salonContexts: ReturnType<typeof getLiveContextForSalon>[]
  intent: AIIntent
} {
  const intent = extractIntent(query)

  let matches = SALONS.filter(salon => {
    if (intent.area && salon.area.toLowerCase() !== intent.area.toLowerCase()) return false
    if (intent.gender && salon.gender !== intent.gender && salon.gender !== 'unisex') return false
    if (intent.is_luxury === true && salon.luxury_level !== 'luxury' && salon.luxury_level !== 'premium') return false
    if (intent.is_home_service === true && !salon.offers_home_service) return false
    if (intent.budget) {
      const metrics = computeSalonMetrics(salon.id)
      if (metrics.min_price > intent.budget.max) return false
    }
    if (intent.services && intent.services.length > 0) {
      const salonServices = SERVICES.filter(s => s.salon_id === salon.id && s.active)
      const hasMatching = salonServices.some(s =>
        intent.services!.some(is =>
          s.category.toLowerCase().includes(is.toLowerCase()) ||
          is.toLowerCase().includes(s.category.toLowerCase())
        )
      )
      if (!hasMatching) return false
    }
    return salon.status === 'approved' || salon.status === 'featured'
  })

  matches = matches.sort((a, b) => {
    const metricsA = computeSalonMetrics(a.id)
    const metricsB = computeSalonMetrics(b.id)
    return metricsB.trust_score - metricsA.trust_score
  })

  return {
    salonContexts: matches.map(s => getLiveContextForSalon(s.id)).filter(Boolean) as any,
    intent,
  }
}

export function generateRecommendationReasoning(
  salon: Salon,
  services: Service[],
  intent: AIIntent
): AIRecommendation {
  const metrics = computeSalonMetrics(salon.id)
  const badges = computeTrustScoreBadge(metrics.trust_score)
  const responseBadge = computeResponseTimeBadge(metrics.avg_response_time_minutes)
  const offers = getSalonOffers(salon.id)

  const reasons: string[] = []
  reasons.push(`${salon.name} (${salon.area}) — ${badges.label} salon with ${metrics.trust_score}/100 trust score`)

  if (intent.service_type) {
    const matchingServices = services.filter(s =>
      s.category.toLowerCase().includes(intent.service_type!.toLowerCase())
    )
    if (matchingServices.length > 0) {
      const prices = matchingServices.map(s => s.final_price || computeFinalPrice(s.price, s.discount_percent))
      const priceRange = prices.length > 0
        ? `₹${Math.min(...prices).toLocaleString('en-IN')} - ₹${Math.max(...prices).toLocaleString('en-IN')}`
        : ''
      reasons.push(`Offers ${matchingServices.length} ${intent.service_type} services (${priceRange})`)
    }
  }

  if (intent.budget_max) {
    const affordableServices = services.filter(s => (s.final_price || s.price) <= intent.budget_max!)
    if (affordableServices.length > 0) {
      reasons.push(`${affordableServices.length} services within your ₹${intent.budget_max.toLocaleString('en-IN')} budget`)
    }
  }

  if (offers.length > 0) {
    const validOffers = offers.filter(o => o.is_active && new Date(o.valid_till) >= new Date())
    if (validOffers.length > 0) {
      reasons.push(`${validOffers.length} active offer${validOffers.length > 1 ? 's' : ''} available`)
    }
  }

  if (metrics.average_rating) {
    reasons.push(`${metrics.average_rating.toFixed(1)}★ rating from ${metrics.review_count} reviews`)
  }

  reasons.push(`${responseBadge.label} response time (${metrics.avg_response_time_minutes}min)`)

  return {
    salon_id: salon.id,
    reason: reasons.join(' · '),
    best_for: matchingServices(intent, services),
    price_fit: metrics.min_price > 0
      ? `₹${metrics.min_price.toLocaleString('en-IN')} - ₹${metrics.max_price.toLocaleString('en-IN')}`
      : salon.price_range,
    location_fit: `${salon.area}, ${salon.city}`,
    trust_signal: badges.label,
  }
}

function matchingServices(intent: AIIntent, services: Service[]): string {
  if (intent.service_type) {
    const match = services.find(s => s.category.toLowerCase().includes(intent.service_type!.toLowerCase()))
    if (match) return match.name
  }
  const popular = services.filter(s => s.is_popular)
  return popular.length > 0 ? popular[0].name : services[0]?.name || 'General beauty services'
}

export function findMatchingSalons(intent: AIIntent): Salon[] {
  return SALONS.filter((salon) => {
    if (intent.area && salon.area.toLowerCase() !== intent.area.toLowerCase()) return false
    if (intent.gender && salon.gender !== intent.gender && salon.gender !== 'unisex') return false
    if (intent.is_luxury === true && !(salon.luxury_level === 'luxury' || salon.luxury_level === 'premium')) return false
    if (intent.is_home_service === true && !salon.offers_home_service) return false
    if (intent.budget) {
      const metrics = computeSalonMetrics(salon.id)
      if (metrics.min_price > intent.budget.max) return false
    }
    if (intent.services && intent.services.length > 0) {
      const salonServices = SERVICES.filter((s) => s.salon_id === salon.id)
      const hasMatching = salonServices.some((s) =>
        intent.services!.some((is) =>
          s.category.toLowerCase().includes(is.toLowerCase()) ||
          is.toLowerCase().includes(s.category.toLowerCase())
        )
      )
      if (!hasMatching) return false
    }
    return salon.status === 'approved' || salon.status === 'featured'
  })
}

export function generateFullRecommendation(query: string): AIRecommendationResponse {
  const { salonContexts, intent } = buildSearchContext(query)
  const salons = salonContexts.filter(Boolean) as any[]

  if (salons.length === 0) {
    return {
      summary: `I couldn't find any salons matching "${query}". Try broadening your search — change the area, adjust your budget, or explore different service categories.`,
      top_matches: [],
    }
  }

  const topMatches = salons.slice(0, 5).map((ctx: any) =>
    generateRecommendationReasoning(ctx.salon, ctx.services, intent)
  )

  const summary = salons.length === 1
    ? `I found 1 salon matching your request. Here's why ${salons[0].salon.name} is a great fit for you.`
    : `I found ${salons.length} salons matching your request. Here are my top ${Math.min(5, salons.length)} recommendations ranked by trust score and relevance.`

  return { summary, top_matches: topMatches }
}

export function summarizeReviews(salonId: string): AIReviewSummary {
  const reviews = reviewsStore.filter(r => r.salon_id === salonId)

  if (reviews.length === 0) {
    return {
      overall_sentiment: 'No reviews yet',
      top_strengths: [],
      top_issues: [],
      summary: 'This salon doesn\'t have any reviews yet. Be the first to leave a review!',
    }
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const positiveCount = reviews.filter(r => r.rating >= 4).length
  const negativeCount = reviews.filter(r => r.rating <= 2).length

  const highComments = reviews.filter(r => r.rating >= 4).map(r => r.comment.toLowerCase())
  const praiseWords = ['amazing', 'excellent', 'best', 'love', 'beautiful', 'wonderful', 'fantastic', 'incredible', 'professional', 'skilled']
  const topStrengths = praiseWords.filter(w => highComments.some(c => c.includes(w)))

  const lowComments = reviews.filter(r => r.rating <= 2).map(r => r.comment.toLowerCase())
  const complaintWords = ['wait', 'expensive', 'rude', 'unprofessional', 'late', 'dirty', 'slow']
  const topIssues = complaintWords.filter(w => lowComments.some(c => c.includes(w)))

  const sentiment = avgRating >= 4.5 ? 'Very Positive' : avgRating >= 4 ? 'Positive' : avgRating >= 3 ? 'Mixed' : 'Negative'

  const summary = `${reviews.length} reviews with an average of ${avgRating.toFixed(1)}★. ${positiveCount} out of ${reviews.length} reviews are positive. ${
    topStrengths.length > 0 ? `Customers praise: ${topStrengths.slice(0, 3).join(', ')}. ` : ''
  }${topIssues.length > 0 ? `Some concerns: ${topIssues.slice(0, 2).join(', ')}. ` : ''}`

  return {
    overall_sentiment: sentiment,
    top_strengths: topStrengths.slice(0, 5),
    top_issues: topIssues.slice(0, 5),
    summary,
  }
}

export function generateProfileInsights(profile: BeautyProfile | null, bookings: Booking[]): AIBeautyProfileInsights {
  const recommendedServices: string[] = []
  let routineTip = ''
  let budgetAdvice = ''
  let bookingSuggestion = ''

  if (profile?.skin_type) {
    if (profile.skin_type.toLowerCase().includes('dry')) {
      recommendedServices.push('Hydrating Facial', 'Deep Moisturizing Treatment')
      routineTip = 'For dry skin, try hydrating facials with HA-based serums every 3-4 weeks.'
    } else if (profile.skin_type.toLowerCase().includes('oily')) {
      recommendedServices.push('Deep Cleansing Facial', 'Salicylic Acid Peel')
      routineTip = 'Regular cleansing facials with salicylic acid can help manage oily skin.'
    } else if (profile.skin_type.toLowerCase().includes('sensitive')) {
      recommendedServices.push('Calming Facial', 'Gentle Cleanup')
      routineTip = 'Opt for fragrance-free, calming treatments suitable for sensitive skin.'
    }
  }

  if (profile?.hair_type) {
    if (profile.hair_type.toLowerCase().includes('dry') || profile.hair_type.toLowerCase().includes('damaged')) {
      recommendedServices.push('Hair Spa', 'Keratin Treatment')
    } else if (profile.hair_type.toLowerCase().includes('oily')) {
      recommendedServices.push('Scalp Treatment', 'Volumizing Blowout')
    }
  }

  if (profile?.beauty_goals) {
    if (profile.beauty_goals.some(g => g.toLowerCase().includes('glow') || g.toLowerCase().includes('radiant'))) {
      recommendedServices.push('HydraFacial', 'Vitamin C Facial')
    }
    if (profile.beauty_goals.some(g => g.toLowerCase().includes('anti') || g.toLowerCase().includes('aging'))) {
      recommendedServices.push('Microdermabrasion', 'Collagen Facial')
    }
    if (profile.beauty_goals.some(g => g.toLowerCase().includes('bridal') || g.toLowerCase().includes('wedding'))) {
      recommendedServices.push('Bridal Makeup Trial', 'Pre-Bridal Facial Package')
    }
  }

  const totalSpent = bookings.reduce((sum, b) => sum + b.total_price, 0)
  if (totalSpent > 0) {
    budgetAdvice = `You've spent ₹${totalSpent.toLocaleString('en-IN')} on beauty services. Consider a membership or package to save up to 20%.`
  } else {
    budgetAdvice = 'Start with a single service and explore our ₹500-₹1500 range for affordable options.'
  }

  if (bookings.length > 0) {
    const lastBooking = bookings[bookings.length - 1]
    const lastService = lastBooking.service?.name || 'your last service'
    bookingSuggestion = `Based on your history with ${lastService}, we recommend exploring similar services or booking a follow-up appointment.`
  } else {
    bookingSuggestion = 'Complete your beauty profile and we\'ll recommend the perfect salon for you!'
  }

  return {
    recommended_services: [...new Set(recommendedServices)],
    routine_tip: routineTip || 'Maintain a consistent skincare routine with professional treatments every 4 weeks.',
    budget_advice: budgetAdvice,
    booking_suggestion: bookingSuggestion,
  }
}

export function generateSalonDescription(salon: Partial<Salon>): string {
  const name = salon.name || 'this salon'
  const area = salon.area || 'Mumbai'
  const gender = salon.gender === 'men' ? "men's" : salon.gender === 'women' ? "women's" : ''
  const level = salon.luxury_level || 'mid'
  const luxury = level === 'luxury' ? 'premium luxury ' : level === 'premium' ? 'premium ' : level === 'budget' ? 'affordable ' : ''
  const homeService = salon.offers_home_service ? ' with the convenience of home service' : ''

  const metrics = salon.id ? computeSalonMetrics(salon.id) : null
  const rating = metrics?.average_rating
    ? `boasting an impressive ${metrics.average_rating.toFixed(1)}★ rating`
    : salon.rating_avg ? `boasting an impressive ${salon.rating_avg}★ rating` : ''
  const priceInfo = metrics?.min_price
    ? `offering services from ${formatPrice(metrics.min_price)}`
    : salon.price_range ? `offering services from ${salon.price_range}` : ''

  return `${name} is a ${luxury}${gender} beauty destination in ${area}, ${rating} ${priceInfo}${homeService}. The salon provides a curated selection of premium beauty services in a sophisticated, welcoming environment. Each treatment is delivered by experienced professionals committed to exceptional results and customer satisfaction.`
}

export function generateServiceDescription(service: Partial<Service>): string {
  const name = service.name || 'this service'
  const duration = service.duration_minutes ? `${service.duration_minutes} minutes` : ''
  const finalPrice = service.final_price || (service.price ? computeFinalPrice(service.price, service.discount_percent || 0) : 0)
  const price = finalPrice ? formatPrice(finalPrice) : service.price ? formatPrice(service.price) : ''
  const category = service.category || 'beauty'
  const hasDiscount = service.discount_percent && service.discount_percent > 0
  const discountText = hasDiscount ? `Now at ${price} (${service.discount_percent}% off — save ${formatPrice((service.price || 0) - finalPrice)})` : `priced at ${price}`

  return `Experience our ${name} — a premium ${category.toLowerCase()} treatment designed to deliver visible results. This ${duration} session is ${discountText}. Our expert therapists use high-quality products and advanced techniques to ensure you leave feeling refreshed, rejuvenated, and absolutely radiant.`
}

export function generateOwnerImprovementSuggestions(metrics: {
  trust_score: number
  average_rating: number
  total_reviews: number
  response_time_minutes: number
  slot_utilization_rate: number
  total_bookings: number
  completed_bookings: number
  revenue_total: number
  total_services: number
  top_service: string
  top_category: string
}): AIOwnerSuggestions {
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (metrics.trust_score >= 70) strengths.push(`High Trust Score (${metrics.trust_score}/100)`)
  else weaknesses.push(`Trust Score (${metrics.trust_score}/100) needs improvement`)

  if (metrics.average_rating >= 4.5) strengths.push(`Excellent ${metrics.average_rating}★ rating`)
  else if (metrics.average_rating >= 4) strengths.push(`Great ${metrics.average_rating}★ rating`)
  else if (metrics.average_rating > 0 && metrics.average_rating < 4) weaknesses.push(`Rating ${metrics.average_rating}★ below 4 — focus on service quality`)

  if (metrics.total_reviews > 20) strengths.push(`${metrics.total_reviews} reviews — strong social proof`)
  else if (metrics.total_reviews < 5) weaknesses.push(`Only ${metrics.total_reviews} reviews — request more feedback`)

  if (metrics.response_time_minutes <= 30) strengths.push(`Fast ${metrics.response_time_minutes}min response time`)
  else weaknesses.push(`Slow ${metrics.response_time_minutes}min response time`)

  if (metrics.slot_utilization_rate > 60) strengths.push(`${metrics.slot_utilization_rate}% slot utilization`)
  else if (metrics.slot_utilization_rate < 30) weaknesses.push(`Low ${metrics.slot_utilization_rate}% slot utilization`)

  const pricingAdvice = metrics.average_rating >= 4.5
    ? 'Your high ratings justify premium pricing. Consider a 10-15% price increase on your most popular services.'
    : metrics.average_rating >= 4
      ? 'Your pricing is competitive. Consider offering package bundles to increase average order value.'
      : 'Consider introductory pricing and first-visit discounts to attract more customers and build reviews.'

  const serviceMixAdvice = metrics.top_category
    ? `"${metrics.top_category}" is your most booked category. Expand related services and create bundled packages around it.`
    : 'Analyze which services get the most bookings and focus promotions on those.'

  const marketingAdvice = metrics.total_bookings < 20
    ? 'Run a "First Visit Discount" campaign (15-20% off) to attract new customers. Encourage reviews after each visit.'
    : 'Leverage your top reviews in Google My Business and social media. Launch a referral program (give ₹200 off for each referral).'

  const nextActions: string[] = []
  if (metrics.total_reviews < 10) nextActions.push('Send automated review requests after each completed booking')
  if (metrics.slot_utilization_rate < 40) nextActions.push('Reduce available slots by 30% or promote off-peak hours with 10% discount')
  if (metrics.response_time_minutes > 60) nextActions.push('Enable auto-confirmation for bookings to bring response time under 15 minutes')
  if (metrics.top_service) nextActions.push(`Feature "${metrics.top_service}" on your homepage and social media`)
  if (metrics.total_services < 8) nextActions.push('Add 3-5 more services to appear in more search categories')
  if (metrics.total_bookings === 0) nextActions.push('Create your first service and share your salon link on WhatsApp')
  if (metrics.trust_score < 50) nextActions.push('Complete your salon profile — add photos, set working hours, and enable instant booking')

  return {
    strengths,
    weaknesses,
    pricing_advice: pricingAdvice,
    service_mix_advice: serviceMixAdvice,
    marketing_advice: marketingAdvice,
    next_actions: nextActions.slice(0, 5),
  }
}

// Filter and sort for explore page
function filterSalonsByFilters(salons: Salon[], filters: Partial<SearchFilters>): Salon[] {
  return salons.filter((salon) => {
    if (filters.area && salon.area.toLowerCase() !== filters.area.toLowerCase()) return false
    if (filters.city && salon.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.min_price) {
      const metrics = computeSalonMetrics(salon.id)
      if (metrics.max_price < filters.min_price) return false
    }
    if (filters.max_price) {
      const metrics = computeSalonMetrics(salon.id)
      if (metrics.min_price > filters.max_price) return false
    }
    if (filters.min_rating && salon.rating_avg < filters.min_rating) return false
    if (filters.gender && salon.gender !== filters.gender && salon.gender !== 'unisex') return false
    if (filters.luxury_level && salon.luxury_level !== filters.luxury_level) return false
    if (filters.offers_home_service === true && !salon.offers_home_service) return false
    if (filters.offers_home_service === false && salon.offers_home_service) return false
    if (filters.service_type) {
      const salonServices = SERVICES.filter((s) => s.salon_id === salon.id && s.active)
      const matches = salonServices.some(
        (s) =>
          s.category.toLowerCase().includes(filters.service_type!.toLowerCase()) ||
          s.name.toLowerCase().includes(filters.service_type!.toLowerCase())
      )
      if (!matches) return false
    }
    return salon.status === 'approved' || salon.status === 'featured'
  })
}

function sortSalons(salons: Salon[], sortBy?: string): Salon[] {
  const sorted = [...salons]
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating_avg - a.rating_avg)
    case 'price_low':
      return sorted.sort((a, b) => {
        const mA = computeSalonMetrics(a.id)
        const mB = computeSalonMetrics(b.id)
        return mA.min_price - mB.min_price
      })
    case 'price_high':
      return sorted.sort((a, b) => {
        const mA = computeSalonMetrics(a.id)
        const mB = computeSalonMetrics(b.id)
        return mB.max_price - mA.max_price
      })
    case 'popularity':
      return sorted.sort((a, b) => {
        const mA = computeSalonMetrics(a.id)
        const mB = computeSalonMetrics(b.id)
        return mB.total_bookings - mA.total_bookings
      })
    case 'trust_score':
      return sorted.sort((a, b) => {
        const mA = computeSalonMetrics(a.id)
        const mB = computeSalonMetrics(b.id)
        return mB.trust_score - mA.trust_score
      })
    default:
      return sorted.sort((a, b) => {
        const mA = computeSalonMetrics(a.id)
        const mB = computeSalonMetrics(b.id)
        return mB.trust_score - mA.trust_score
      })
  }
}

export function searchSalons(
  query: string,
  filters: Partial<SearchFilters>
): { salons: Salon[]; reasoning: string; intent: AIIntent } {
  const intent = extractIntent(query)
  const mergedFilters: Partial<SearchFilters> = { ...filters, ...intent }
  if (intent.budget) {
    mergedFilters.min_price = intent.budget.min
    mergedFilters.max_price = intent.budget.max
  }
  if (intent.area) mergedFilters.area = intent.area
  if (intent.gender) mergedFilters.gender = intent.gender

  let baseSalons = SALONS.filter(s => s.status === 'approved' || s.status === 'featured')
  let results = filterSalonsByFilters(baseSalons, mergedFilters)

  if (mergedFilters.sort_by) {
    results = sortSalons(results, mergedFilters.sort_by)
  } else {
    results = sortSalons(results, 'trust_score')
  }

  let reasoning = ''
  if (results.length === 0) {
    reasoning = `I couldn't find any salons matching "${query}". Try broadening your search criteria — change area, adjust budget, or explore different services.`
  } else if (results.length === 1) {
    const ctx = getLiveContextForSalon(results[0].id)
    const rec = ctx ? generateRecommendationReasoning(ctx.salon, ctx.services, intent) : null
    reasoning = rec?.reason || generateRecommendationReasoning(results[0], getSalonServices(results[0].id), intent).reason
  } else {
    const top = results[0]
    const ctx = getLiveContextForSalon(top.id)
    const rec = ctx ? generateRecommendationReasoning(ctx.salon, ctx.services, intent) : null
    reasoning = `I found ${results.length} salons matching your request. ${rec?.reason || generateRecommendationReasoning(top, getSalonServices(top.id), intent).reason}`
  }

  return { salons: results, reasoning, intent }
}

export function getPersonalizedRecommendations(userId: string): {
  recentSalons: Salon[]
  topRated: Salon[]
  popular: Salon[]
} {
  const approved = SALONS.filter(s => s.status === 'approved' || s.status === 'featured')
  const sortedByTrust = [...approved].sort((a, b) => {
    const mA = computeSalonMetrics(a.id)
    const mB = computeSalonMetrics(b.id)
    return mB.trust_score - mA.trust_score
  })

  const sortedByRating = [...approved].sort((a, b) => b.rating_avg - a.rating_avg)
  const sortedByBookings = [...approved].sort((a, b) => {
    const mA = computeSalonMetrics(a.id)
    const mB = computeSalonMetrics(b.id)
    return mB.total_bookings - mA.total_bookings
  })

  const activeSalons = approved.filter(s => (computeSalonMetrics(s.id).total_services || 0) > 0)

  return {
    recentSalons: activeSalons.slice(0, 4),
    topRated: sortedByRating.slice(0, 4),
    popular: sortedByBookings.slice(0, 4),
  }
}
