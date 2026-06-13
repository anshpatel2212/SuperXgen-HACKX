import type { Booking, Favorite, Review, AvailabilitySlot, AIConversation } from '@/types'

export const bookingsStore: Booking[] = []

export const favoritesStore: Favorite[] = []

export const slotsStore: AvailabilitySlot[] = []

export const aiConversationsStore: AIConversation[] = []

export let reviewsStore: Review[] = []

export function initReviewsStore(reviews: Review[]) {
  reviewsStore = [...reviews]
}

export function addReview(review: Review) {
  reviewsStore.push(review)
}

export function addBooking(booking: Booking) {
  bookingsStore.push(booking)
}

export function updateBooking(id: string, data: Partial<Booking>) {
  const idx = bookingsStore.findIndex(b => b.id === id)
  if (idx >= 0) {
    bookingsStore[idx] = { ...bookingsStore[idx], ...data }
  }
}

export function addSlot(slot: AvailabilitySlot) {
  slotsStore.push(slot)
}

export function updateSlot(id: string, data: Partial<AvailabilitySlot>) {
  const idx = slotsStore.findIndex(s => s.id === id)
  if (idx >= 0) {
    slotsStore[idx] = { ...slotsStore[idx], ...data }
  }
}

export function removeSlot(id: string) {
  const idx = slotsStore.findIndex(s => s.id === id)
  if (idx >= 0) slotsStore.splice(idx, 1)
}

export function addFavorite(fav: Favorite) {
  favoritesStore.push(fav)
}

export function removeFavorite(userId: string, salonId: string) {
  const idx = favoritesStore.findIndex(f => f.user_id === userId && f.salon_id === salonId)
  if (idx >= 0) favoritesStore.splice(idx, 1)
}

export function addConversation(conv: AIConversation) {
  aiConversationsStore.push(conv)
}
