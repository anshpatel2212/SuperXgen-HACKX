export type UserRole = 'customer' | 'owner' | 'admin'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  phone: string
  role: UserRole
  avatar_url: string
}

export type Gender = 'women' | 'men' | 'unisex'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'

export type SalonStatus = 'pending' | 'approved' | 'rejected' | 'featured'

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'deleted'

export type LuxuryLevel = 'budget' | 'mid' | 'premium' | 'luxury'

export type ServiceCategory =
  | 'Bridal Makeup' | 'Facial' | 'Haircut' | 'Hair Color'
  | 'Manicure' | 'Pedicure' | 'Spa' | 'Waxing'
  | 'Threading' | 'Bleach' | 'Detan' | 'Massage'
  | 'Hair Treatment' | 'Nail Art' | 'Grooming' | 'Hair Styling'

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  avatar_url: string
  role: UserRole
  city: string
  created_at: string
}

export interface BeautyProfile {
  id: string
  user_id: string
  skin_type: string
  hair_type: string
  beauty_goals: string[]
  preferred_styles: string[]
  allergies: string[]
  budget_range: string
  preferred_areas: string[]
  preferred_services: string[]
  created_at: string
  updated_at: string
}

export interface WorkingHours {
  [day: string]: { open: string; close: string; is_closed: boolean }
}

export interface Salon {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string
  ai_description: string
  tagline: string
  phone: string
  email: string
  address: string
  area: string
  city: string
  pincode: string
  latitude: number
  longitude: number
  gender: Gender
  luxury_level: LuxuryLevel
  offers_home_service: boolean
  home_service_radius_km: number
  rating_avg: number
  review_count: number
  total_bookings: number
  price_range: string
  cover_image: string
  gallery: string[]
  images: string[]
  logo_url: string
  cover_url: string
  amenities: string[]
  payment_modes: string[]
  cancellation_policy: string
  hygiene_practices: string[]
  working_hours_json: WorkingHours
  weekly_off: string[]
  staff_count: number
  categories_offered: string[]
  status: SalonStatus
  featured: boolean
  verified: boolean
  created_at: string
  updated_at: string
}

export interface SalonMetrics {
  id: string
  salon_id: string
  total_services: number
  min_price: number
  max_price: number
  avg_price: number
  average_rating: number
  review_count: number
  category_service_counts: Record<string, number>
  total_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  revenue_total: number
  revenue_week: number
  revenue_month: number
  slot_capacity_week: number
  slot_booked_week: number
  slot_utilization_percent: number
  avg_response_time_minutes: number
  trust_score: number
  top_service_id: string | null
  top_service_name: string | null
  top_category: string | null
  popular_services: { id: string; name: string; booking_count: number }[]
  updated_at: string
}

export interface Service {
  id: string
  salon_id: string
  name: string
  description: string
  ai_description: string
  category: string
  duration_minutes: number
  price: number
  discount_percent: number
  discounted_price: number
  final_price: number
  gender: Gender
  is_home_service: boolean
  is_popular: boolean
  active: boolean
  images: string[]
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  salon_id: string
  service_id: string | null
  slot_date: string
  start_time: string
  end_time: string
  is_available: boolean
  capacity: number
  booked_count: number
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  salon_id: string
  service_id: string
  slot_id: string | null
  booking_date: string
  booking_time: string
  status: BookingStatus
  total_price: number
  applied_offer_id: string | null
  service_mode: 'salon' | 'home'
  address_text: string
  notes: string
  created_at: string
  updated_at?: string
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  salon?: Salon
  service?: Service
}

export interface Review {
  id: string
  user_id: string
  salon_id: string
  booking_id: string
  rating: number
  title: string
  comment: string
  images: string[]
  is_verified: boolean
  is_reported: boolean
  is_moderated: boolean
  status: ReviewStatus
  created_at: string
  user?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export interface Favorite {
  id: string
  user_id: string
  salon_id: string
  created_at: string
  salon?: Salon
}

export interface Offer {
  id: string
  salon_id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase: number
  max_discount: number
  coupon_code: string
  valid_from: string
  valid_till: string
  is_active: boolean
  created_at: string
}

export interface AIConversation {
  id: string
  user_id: string
  message: string
  response: string
  intent: AIIntent
  context_used: Record<string, unknown>
  created_at: string
}

export interface AIIntent {
  type: 'search' | 'recommend' | 'summarize' | 'insight' | 'description'
  service_type: string
  budget_max: number | null
  location_area: string
  city: string
  date: string
  time_preference: string
  service_mode: 'salon' | 'home'
  concerns: string[]
  luxury_preference: string
  gender_preference: string
  services?: string[]
  budget?: { min: number; max: number }
  area?: string
  gender?: Gender
  is_home_service?: boolean
  is_luxury?: boolean
  raw_query: string
}

export interface SearchFilters {
  query: string
  area: string
  city: string
  service_type: string
  min_price: number
  max_price: number
  min_rating: number
  gender: Gender | ''
  luxury_level: LuxuryLevel | ''
  offers_home_service: boolean | null
  sort_by: 'rating' | 'price_low' | 'price_high' | 'popularity' | 'trust_score'
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  icon: string
  service_count: number
}

export interface PlatformMetrics {
  id: string
  total_users: number
  total_owners: number
  total_salons: number
  total_verified_salons: number
  total_bookings: number
  total_revenue: number
  revenue_this_month: number
  active_offers: number
  pending_approvals: number
  top_city: string
  top_category: string
  average_rating: number
  total_reviews: number
  updated_at: string
}

export interface OwnerDashboardMetrics {
  total_bookings: number
  confirmed_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  revenue_total: number
  revenue_week: number
  revenue_month: number
  average_rating: number
  total_reviews: number
  total_services: number
  slot_utilization_rate: number
  top_service: string
  top_category: string
  response_time_minutes: number
  trust_score: number
  recent_bookings: Booking[]
  services_distribution: { name: string; count: number }[]
  revenue_over_time: { date: string; amount: number }[]
  bookings_over_time: { date: string; count: number }[]
}

export interface AIRecommendation {
  salon_id: string
  reason: string
  best_for: string
  price_fit: string
  location_fit: string
  trust_signal: string
}

export interface AIRecommendationResponse {
  summary: string
  top_matches: AIRecommendation[]
}

export interface AIReviewSummary {
  overall_sentiment: string
  top_strengths: string[]
  top_issues: string[]
  summary: string
}

export interface AIBeautyProfileInsights {
  recommended_services: string[]
  routine_tip: string
  budget_advice: string
  booking_suggestion: string
}

export interface AIOwnerSuggestions {
  strengths: string[]
  weaknesses: string[]
  pricing_advice: string
  service_mix_advice: string
  marketing_advice: string
  next_actions: string[]
}

export interface DashboardMetrics {
  total_bookings: number
  total_revenue: number
  total_customers: number
  total_salons: number
  pending_approvals: number
  average_rating: number
  bookings_today: number
  revenue_today: number
  charts: {
    bookings_over_time: { date: string; count: number }[]
    revenue_over_time: { date: string; amount: number }[]
    services_distribution: { name: string; count: number }[]
    ratings_distribution: { rating: number; count: number }[]
  }
}
