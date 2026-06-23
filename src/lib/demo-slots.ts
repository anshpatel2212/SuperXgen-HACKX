"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { slotsStore } from "@/lib/store"
import type { AvailabilitySlot } from "@/types"

const SLOTS_KEY = "glowgo_demo_slots_v1"
const SLOTS_EVENT = "glowgo:slots-changed"
const SLOTS_VERSION = 1
const EMPTY_SNAPSHOT = JSON.stringify({
  version: SLOTS_VERSION,
  slots: [],
})

interface SlotState {
  version: typeof SLOTS_VERSION
  slots: AvailabilitySlot[]
}

type CreateSlotInput = Omit<AvailabilitySlot, "id" | "booked_count" | "created_at" | "is_available">

function isAvailabilitySlot(value: unknown): value is AvailabilitySlot {
  if (!value || typeof value !== "object") return false
  const slot = value as Partial<AvailabilitySlot>
  return (
    typeof slot.id === "string" &&
    typeof slot.salon_id === "string" &&
    (slot.service_id === null || typeof slot.service_id === "string") &&
    typeof slot.slot_date === "string" &&
    typeof slot.start_time === "string" &&
    typeof slot.end_time === "string" &&
    typeof slot.is_available === "boolean" &&
    typeof slot.capacity === "number" &&
    typeof slot.booked_count === "number"
  )
}

function parseSnapshot(snapshot: string): SlotState {
  try {
    const parsed = JSON.parse(snapshot) as Partial<SlotState>
    if (parsed.version !== SLOTS_VERSION || !Array.isArray(parsed.slots)) {
      return { version: SLOTS_VERSION, slots: [] }
    }

    return {
      version: SLOTS_VERSION,
      slots: parsed.slots.filter(isAvailabilitySlot),
    }
  } catch {
    return { version: SLOTS_VERSION, slots: [] }
  }
}

function toLocalDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function createSeedSlots(now = new Date()): AvailabilitySlot[] {
  const definitions = [
    { dayOffset: 1, start_time: "10:00", end_time: "10:45", service_id: "s1" },
    { dayOffset: 1, start_time: "12:00", end_time: "13:00", service_id: null },
    { dayOffset: 2, start_time: "11:00", end_time: "12:00", service_id: "s3" },
    { dayOffset: 2, start_time: "15:00", end_time: "16:00", service_id: null },
    { dayOffset: 4, start_time: "10:30", end_time: "11:30", service_id: null },
    { dayOffset: 5, start_time: "16:00", end_time: "17:00", service_id: null },
  ] as const

  return definitions.map((definition, index) => {
    const slotDate = new Date(now)
    slotDate.setDate(slotDate.getDate() + definition.dayOffset)
    const date = toLocalDateValue(slotDate)

    return {
      id: `demo_slot_1_${date}_${definition.start_time.replace(":", "")}_${index + 1}`,
      salon_id: "1",
      service_id: definition.service_id,
      slot_date: date,
      start_time: definition.start_time,
      end_time: definition.end_time,
      is_available: true,
      capacity: index < 2 ? 2 : 1,
      booked_count: 0,
      created_at: now.toISOString(),
    }
  })
}

function syncLegacySlots(slots: AvailabilitySlot[]) {
  slotsStore.splice(0, slotsStore.length, ...slots)
}

function getSnapshot() {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT

  const storedSnapshot = localStorage.getItem(SLOTS_KEY)
  if (storedSnapshot !== null) return storedSnapshot

  const initialSnapshot = JSON.stringify({
    version: SLOTS_VERSION,
    slots: createSeedSlots(),
  } satisfies SlotState)
  localStorage.setItem(SLOTS_KEY, initialSnapshot)
  return initialSnapshot
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SLOTS_KEY) callback()
  }
  window.addEventListener(SLOTS_EVENT, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(SLOTS_EVENT, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function writeState(state: SlotState) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(state))
  syncLegacySlots(state.slots)
  window.dispatchEvent(new Event(SLOTS_EVENT))
}

export function getDemoSlots(): AvailabilitySlot[] {
  const slots = parseSnapshot(getSnapshot()).slots
  syncLegacySlots(slots)
  return slots
}

export function getDemoSlotsBySalon(salonId: string): AvailabilitySlot[] {
  return getDemoSlots().filter((slot) => slot.salon_id === salonId)
}

export function isDemoSlotAvailable(slot: AvailabilitySlot): boolean {
  return slot.is_available && slot.booked_count < slot.capacity
}

export function createDemoSlot(data: CreateSlotInput): AvailabilitySlot {
  const state = parseSnapshot(getSnapshot())
  const slot: AvailabilitySlot = {
    ...data,
    id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    booked_count: 0,
    is_available: true,
    created_at: new Date().toISOString(),
  }

  state.slots.push(slot)
  writeState(state)
  return slot
}

export function updateDemoSlot(
  id: string,
  updates: Partial<AvailabilitySlot>
): AvailabilitySlot {
  const state = parseSnapshot(getSnapshot())
  const index = state.slots.findIndex((slot) => slot.id === id)
  if (index === -1) throw new Error("Slot not found in the demo repository")

  const updated = { ...state.slots[index], ...updates }
  state.slots[index] = updated
  writeState(state)
  return updated
}

export function deleteDemoSlot(id: string) {
  const state = parseSnapshot(getSnapshot())
  const slot = state.slots.find((candidate) => candidate.id === id)
  if (!slot) return
  if (slot.booked_count > 0) {
    throw new Error("Booked slots cannot be deleted")
  }

  state.slots = state.slots.filter((candidate) => candidate.id !== id)
  writeState(state)
}

export function reserveDemoSlot(id: string): boolean {
  const state = parseSnapshot(getSnapshot())
  const index = state.slots.findIndex((slot) => slot.id === id)
  if (index === -1) return false

  const slot = state.slots[index]
  if (!isDemoSlotAvailable(slot)) return false

  state.slots[index] = { ...slot, booked_count: slot.booked_count + 1 }
  writeState(state)
  return true
}

export function releaseDemoSlot(id: string) {
  const state = parseSnapshot(getSnapshot())
  const index = state.slots.findIndex((slot) => slot.id === id)
  if (index === -1) return

  const slot = state.slots[index]
  state.slots[index] = {
    ...slot,
    booked_count: Math.max(0, slot.booked_count - 1),
  }
  writeState(state)
}

export function getBookableSlots(
  slots: AvailabilitySlot[],
  date: string,
  serviceId?: string | null
) {
  return slots
    .filter(
      (slot) =>
        slot.slot_date === date &&
        isDemoSlotAvailable(slot) &&
        (!slot.service_id || slot.service_id === serviceId)
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

export function getAvailableDemoSlotsForDate(
  salonId: string,
  date: string,
  serviceId?: string | null
) {
  return getBookableSlots(getDemoSlotsBySalon(salonId), date, serviceId)
}

export function getBookableTimes(
  slots: AvailabilitySlot[],
  date: string,
  serviceId?: string | null
) {
  return [
    ...new Set(
      getBookableSlots(slots, date, serviceId).map((slot) =>
        slot.start_time.slice(0, 5)
      )
    ),
  ]
}

export function useDemoSlots(salonId?: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SNAPSHOT)
  const state = useMemo(() => {
    const parsed = parseSnapshot(snapshot)
    syncLegacySlots(parsed.slots)
    return parsed
  }, [snapshot])
  const slots = useMemo(
    () =>
      state.slots
        .filter((slot) => !salonId || slot.salon_id === salonId)
        .sort(
          (a, b) =>
            a.slot_date.localeCompare(b.slot_date) ||
            a.start_time.localeCompare(b.start_time)
        ),
    [salonId, state.slots]
  )

  const createSlot = useCallback((data: CreateSlotInput) => createDemoSlot(data), [])
  const updateSlot = useCallback(
    (id: string, updates: Partial<AvailabilitySlot>) => updateDemoSlot(id, updates),
    []
  )
  const deleteSlot = useCallback((id: string) => deleteDemoSlot(id), [])

  return {
    slots,
    createSlot,
    updateSlot,
    deleteSlot,
  }
}
