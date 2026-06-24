"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import {
  createDemoReview,
  deleteDemoReview,
  filterDemoReviews,
  getDemoReviewsSnapshot,
  moderateDemoReview,
  readReviewsFromSnapshot,
  subscribeToDemoReviews,
  syncReviewsToLegacyStore,
  updateDemoReview,
  type CreateDemoReviewInput,
  type ReviewFilters,
} from "@/lib/demo-reviews"
import type { Review, ReviewStatus } from "@/types"

export function useDemoReviews(filters: ReviewFilters = {}) {
  const { ownerId, publicOnly, salonId, userId } = filters
  const snapshot = useSyncExternalStore(
    subscribeToDemoReviews,
    getDemoReviewsSnapshot,
    getDemoReviewsSnapshot
  )
  const allReviews = useMemo(() => {
    const reviews = readReviewsFromSnapshot(snapshot)
    syncReviewsToLegacyStore(reviews)
    return reviews
  }, [snapshot])

  const reviews = useMemo(
    () => filterDemoReviews(allReviews, { ownerId, publicOnly, salonId, userId }),
    [allReviews, ownerId, publicOnly, salonId, userId]
  )

  const createReview = useCallback((input: CreateDemoReviewInput) => createDemoReview(input), [])
  const updateReview = useCallback((id: string, patch: Partial<Review>) => updateDemoReview(id, patch), [])
  const moderateReview = useCallback(
    (id: string, status: Extract<ReviewStatus, "approved" | "rejected">) =>
      moderateDemoReview(id, status),
    []
  )
  const deleteReview = useCallback((id: string) => deleteDemoReview(id), [])

  return { reviews, createReview, updateReview, moderateReview, deleteReview }
}
