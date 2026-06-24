import { REVIEWS, SALONS } from "@/data"
import { initReviewsStore } from "@/lib/store"
import type { Review, ReviewStatus } from "@/types"

const REVIEWS_KEY = "glowgo_demo_reviews_v1"
const REVIEWS_EVENT = "glowgo:reviews-changed"
const REVIEWS_VERSION = 1

interface ReviewState {
  version: typeof REVIEWS_VERSION
  reviews: Review[]
}

export interface ReviewFilters {
  salonId?: string
  userId?: string
  ownerId?: string
  publicOnly?: boolean
}

export interface CreateDemoReviewInput {
  user_id: string
  salon_id: string
  booking_id?: string
  rating: number
  title?: string
  comment: string
  images?: string[]
  status?: ReviewStatus
  user?: Review["user"]
}

function normalizeStatus(review: Partial<Review>): ReviewStatus {
  if (
    review.status === "pending" ||
    review.status === "approved" ||
    review.status === "rejected" ||
    review.status === "deleted"
  ) {
    return review.status
  }

  return review.is_moderated ? "rejected" : "approved"
}

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false
  const review = value as Partial<Review>
  return (
    typeof review.id === "string" &&
    typeof review.user_id === "string" &&
    typeof review.salon_id === "string" &&
    typeof review.rating === "number" &&
    typeof review.comment === "string" &&
    typeof review.created_at === "string"
  )
}

function normalizeReview(review: Review): Review {
  const status = normalizeStatus(review)
  return {
    ...review,
    booking_id: review.booking_id || "",
    title: review.title || "",
    comment: review.comment || "",
    images: Array.isArray(review.images) ? review.images : [],
    is_verified: Boolean(review.is_verified),
    is_reported: Boolean(review.is_reported),
    is_moderated: status === "rejected" || status === "deleted" || Boolean(review.is_moderated),
    status,
  }
}

const SEED_REVIEWS = REVIEWS.map(normalizeReview)
const SEED_SNAPSHOT = JSON.stringify({
  version: REVIEWS_VERSION,
  reviews: SEED_REVIEWS,
} satisfies ReviewState)
let serverReviews = SEED_REVIEWS

function parseSnapshot(snapshot: string): ReviewState {
  try {
    const parsed = JSON.parse(snapshot) as Partial<ReviewState>
    if (parsed.version !== REVIEWS_VERSION || !Array.isArray(parsed.reviews)) {
      return { version: REVIEWS_VERSION, reviews: [...SEED_REVIEWS] }
    }

    return {
      version: REVIEWS_VERSION,
      reviews: parsed.reviews.filter(isReview).map(normalizeReview),
    }
  } catch {
    return { version: REVIEWS_VERSION, reviews: [...SEED_REVIEWS] }
  }
}

export function getDemoReviewsSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify({ version: REVIEWS_VERSION, reviews: serverReviews } satisfies ReviewState)
  }

  const stored = localStorage.getItem(REVIEWS_KEY)
  if (stored !== null) return stored

  localStorage.setItem(REVIEWS_KEY, SEED_SNAPSHOT)
  return SEED_SNAPSHOT
}

export function subscribeToDemoReviews(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === REVIEWS_KEY) callback()
  }
  window.addEventListener(REVIEWS_EVENT, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(REVIEWS_EVENT, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

export function readReviewsFromSnapshot(snapshot: string) {
  return parseSnapshot(snapshot).reviews
}

export function filterDemoReviews(reviews: Review[], filters: ReviewFilters) {
  return applyFilters(reviews, filters)
}

export function syncReviewsToLegacyStore(reviews = parseSnapshot(getDemoReviewsSnapshot()).reviews) {
  initReviewsStore(reviews)
}

function writeReviews(reviews: Review[]) {
  const state: ReviewState = { version: REVIEWS_VERSION, reviews }
  if (typeof window === "undefined") {
    serverReviews = reviews
    syncReviewsToLegacyStore(reviews)
    return
  }

  localStorage.setItem(REVIEWS_KEY, JSON.stringify(state))
  syncReviewsToLegacyStore(reviews)
  window.dispatchEvent(new Event(REVIEWS_EVENT))
}

function isDeletedReview(review: Review) {
  return review.status === "deleted"
}

export function isPublicReview(review: Review) {
  return review.status === "approved" && !review.is_moderated
}

function applyFilters(reviews: Review[], filters: ReviewFilters) {
  const ownerSalonIds = filters.ownerId
    ? new Set(SALONS.filter((salon) => salon.owner_id === filters.ownerId).map((salon) => salon.id))
    : null

  return reviews
    .filter((review) => !isDeletedReview(review))
    .filter((review) => !filters.salonId || review.salon_id === filters.salonId)
    .filter((review) => !filters.userId || review.user_id === filters.userId)
    .filter((review) => !ownerSalonIds || ownerSalonIds.has(review.salon_id))
    .filter((review) => !filters.publicOnly || isPublicReview(review))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function assertValidReviewInput(input: CreateDemoReviewInput) {
  if (!input.user_id.trim()) throw new Error("Sign in before submitting a review.")
  if (!SALONS.some((salon) => salon.id === input.salon_id)) {
    throw new Error("This salon is not available in the demo catalog.")
  }
  if (!Number.isFinite(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Select a rating between 1 and 5.")
  }
  if (input.comment.trim().length < 10) {
    throw new Error("Write at least 10 characters about your experience.")
  }
}

function buildReviewId(input: CreateDemoReviewInput) {
  if (input.booking_id) return `review_${input.booking_id}`
  return `review_${input.salon_id}_${input.user_id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function findDuplicateReview(reviews: Review[], input: CreateDemoReviewInput) {
  const title = input.title?.trim() || ""
  const comment = input.comment.trim()
  return reviews.find(
    (review) =>
      review.user_id === input.user_id &&
      review.salon_id === input.salon_id &&
      (
        Boolean(input.booking_id && review.booking_id === input.booking_id) ||
        (
          review.rating === input.rating &&
          review.title.trim() === title &&
          review.comment.trim() === comment
        )
      )
  )
}

export function getDemoReviews(): Review[] {
  const reviews = parseSnapshot(getDemoReviewsSnapshot()).reviews
  syncReviewsToLegacyStore(reviews)
  return applyFilters(reviews, {})
}

export function getReviewsBySalon(salonId: string, options: { publicOnly?: boolean } = {}) {
  return applyFilters(parseSnapshot(getDemoReviewsSnapshot()).reviews, {
    salonId,
    publicOnly: options.publicOnly,
  })
}

export function getReviewsByUser(userId: string) {
  return applyFilters(parseSnapshot(getDemoReviewsSnapshot()).reviews, { userId })
}

export function getReviewsByOwner(ownerId: string) {
  return applyFilters(parseSnapshot(getDemoReviewsSnapshot()).reviews, { ownerId })
}

export function createDemoReview(input: CreateDemoReviewInput): Review {
  assertValidReviewInput(input)

  const state = parseSnapshot(getDemoReviewsSnapshot())
  const duplicate = findDuplicateReview(state.reviews, input)
  if (duplicate) return duplicate

  const status = input.status || "approved"
  const review: Review = {
    id: buildReviewId(input),
    user_id: input.user_id,
    salon_id: input.salon_id,
    booking_id: input.booking_id || "",
    rating: input.rating,
    title: input.title?.trim() || "",
    comment: input.comment.trim(),
    images: input.images || [],
    is_verified: Boolean(input.booking_id),
    is_reported: false,
    is_moderated: status === "rejected" || status === "deleted",
    status,
    created_at: new Date().toISOString(),
    user: input.user,
  }

  writeReviews([review, ...state.reviews])
  return review
}

export function updateDemoReview(id: string, patch: Partial<Review>): Review {
  const state = parseSnapshot(getDemoReviewsSnapshot())
  const index = state.reviews.findIndex((review) => review.id === id)
  if (index === -1) throw new Error("Review not found in the demo repository")

  const status = patch.status || state.reviews[index].status
  const updated = normalizeReview({
    ...state.reviews[index],
    ...patch,
    status,
    is_moderated:
      status === "rejected" ||
      status === "deleted" ||
      Boolean(patch.is_moderated),
  })
  state.reviews[index] = updated
  writeReviews(state.reviews)
  return updated
}

export function moderateDemoReview(id: string, status: Extract<ReviewStatus, "approved" | "rejected">) {
  return updateDemoReview(id, {
    status,
    is_moderated: status === "rejected",
  })
}

export function deleteDemoReview(id: string) {
  const state = parseSnapshot(getDemoReviewsSnapshot())
  writeReviews(state.reviews.filter((review) => review.id !== id))
}
