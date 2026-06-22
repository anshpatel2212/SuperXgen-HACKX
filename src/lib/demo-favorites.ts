"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

const FAVORITES_KEY = "glowgo_demo_favorites_v1"
const FAVORITES_EVENT = "glowgo:favorites-changed"

interface FavoritesState {
  version: 1
  users: Record<string, string[]>
}

const EMPTY_STATE: FavoritesState = { version: 1, users: {} }

function readFavorites(): FavoritesState {
  if (typeof window === "undefined") return EMPTY_STATE

  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "") as Partial<FavoritesState>
    if (parsed.version !== 1 || !parsed.users || typeof parsed.users !== "object") return EMPTY_STATE
    return { version: 1, users: parsed.users }
  } catch {
    return EMPTY_STATE
  }
}

function writeFavorites(state: FavoritesState) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_KEY) callback()
  }
  window.addEventListener(FAVORITES_EVENT, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function getSnapshot(userId?: string) {
  if (!userId) return ""
  return [...(readFavorites().users[userId] || [])].sort().join("|")
}

export function useDemoFavorites(userId?: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getSnapshot(userId),
    () => ""
  )
  const favoriteIds = useMemo(() => (snapshot ? snapshot.split("|") : []), [snapshot])

  const setFavorite = useCallback(
    (salonId: string, shouldSave: boolean) => {
      if (!userId) return false

      const state = readFavorites()
      const current = new Set(state.users[userId] || [])
      if (shouldSave) current.add(salonId)
      else current.delete(salonId)

      writeFavorites({
        version: 1,
        users: {
          ...state.users,
          [userId]: [...current],
        },
      })
      return shouldSave
    },
    [userId]
  )

  const toggleFavorite = useCallback(
    (salonId: string) => setFavorite(salonId, !favoriteIds.includes(salonId)),
    [favoriteIds, setFavorite]
  )

  return { favoriteIds, setFavorite, toggleFavorite }
}
