"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { SALONS } from "@/data"
import type { SalonStatus } from "@/types"

const STATUS_KEY = "glowgo_demo_salon_status_v1"
const STATUS_EVENT = "glowgo:salon-status-changed"
const EMPTY_SNAPSHOT = JSON.stringify({ version: 1, statuses: {} })

interface SalonStatusState {
  version: 1
  statuses: Record<string, SalonStatus>
}

function parseSnapshot(snapshot: string): SalonStatusState {
  try {
    const parsed = JSON.parse(snapshot) as Partial<SalonStatusState>
    if (parsed.version !== 1 || !parsed.statuses || typeof parsed.statuses !== "object") {
      return { version: 1, statuses: {} }
    }
    return { version: 1, statuses: parsed.statuses }
  } catch {
    return { version: 1, statuses: {} }
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT
  return localStorage.getItem(STATUS_KEY) || EMPTY_SNAPSHOT
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STATUS_KEY) callback()
  }
  window.addEventListener(STATUS_EVENT, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(STATUS_EVENT, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function writeStatuses(statuses: Record<string, SalonStatus>) {
  const state: SalonStatusState = { version: 1, statuses }
  localStorage.setItem(STATUS_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(STATUS_EVENT))
}

export function updateDemoSalonStatus(id: string, status: SalonStatus) {
  if (!SALONS.some((salon) => salon.id === id)) throw new Error("Salon not found")
  const state = parseSnapshot(getSnapshot())
  writeStatuses({ ...state.statuses, [id]: status })
}

export function useDemoSalonStatuses() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SNAPSHOT)
  const salons = useMemo(() => {
    const state = parseSnapshot(snapshot)
    return SALONS.map((salon) => ({
      ...salon,
      status: state.statuses[salon.id] || salon.status,
    }))
  }, [snapshot])

  const updateStatus = useCallback((id: string, status: SalonStatus) => updateDemoSalonStatus(id, status), [])

  return { salons, updateStatus }
}
