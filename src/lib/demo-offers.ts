"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { OFFERS } from "@/data"
import type { Offer } from "@/types"

const OFFERS_KEY = "glowgo_demo_offers_v1"
const OFFERS_EVENT = "glowgo:offers-changed"
const SEED_SNAPSHOT = JSON.stringify({ version: 1, offers: OFFERS })

interface OfferState {
  version: 1
  offers: Offer[]
}

function isOffer(value: unknown): value is Offer {
  if (!value || typeof value !== "object") return false
  const offer = value as Partial<Offer>
  return (
    typeof offer.id === "string" &&
    typeof offer.salon_id === "string" &&
    typeof offer.title === "string" &&
    typeof offer.discount_type === "string" &&
    typeof offer.discount_value === "number"
  )
}

function parseSnapshot(snapshot: string): OfferState {
  try {
    const parsed = JSON.parse(snapshot) as Partial<OfferState>
    if (parsed.version !== 1 || !Array.isArray(parsed.offers)) {
      return { version: 1, offers: [...OFFERS] }
    }
    return { version: 1, offers: parsed.offers.filter(isOffer) }
  } catch {
    return { version: 1, offers: [...OFFERS] }
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return SEED_SNAPSHOT
  return localStorage.getItem(OFFERS_KEY) || SEED_SNAPSHOT
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === OFFERS_KEY) callback()
  }
  window.addEventListener(OFFERS_EVENT, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(OFFERS_EVENT, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function writeOffers(offers: Offer[]) {
  const state: OfferState = { version: 1, offers }
  localStorage.setItem(OFFERS_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(OFFERS_EVENT))
}

export function createDemoOffer(data: Omit<Offer, "id" | "created_at" | "is_active">): Offer {
  const state = parseSnapshot(getSnapshot())
  const offer: Offer = {
    ...data,
    id: `offer_${Date.now()}`,
    is_active: true,
    created_at: new Date().toISOString(),
  }
  writeOffers([offer, ...state.offers])
  return offer
}

export function updateDemoOffer(id: string, updates: Partial<Offer>): Offer {
  const state = parseSnapshot(getSnapshot())
  const index = state.offers.findIndex((offer) => offer.id === id)
  if (index === -1) throw new Error("Offer not found in the demo repository")

  const updated = { ...state.offers[index], ...updates }
  state.offers[index] = updated
  writeOffers(state.offers)
  return updated
}

export function deleteDemoOffer(id: string) {
  const state = parseSnapshot(getSnapshot())
  writeOffers(state.offers.filter((offer) => offer.id !== id))
}

export function useDemoOffers(salonId?: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => SEED_SNAPSHOT)
  const offers = useMemo(
    () => parseSnapshot(snapshot).offers.filter((offer) => !salonId || offer.salon_id === salonId),
    [salonId, snapshot]
  )

  const createOffer = useCallback(
    (data: Omit<Offer, "id" | "created_at" | "is_active">) => createDemoOffer(data),
    []
  )
  const updateOffer = useCallback((id: string, updates: Partial<Offer>) => updateDemoOffer(id, updates), [])
  const deleteOffer = useCallback((id: string) => deleteDemoOffer(id), [])

  return { offers, createOffer, updateOffer, deleteOffer }
}
