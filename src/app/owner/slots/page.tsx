"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { getOwnerSalons, recomputeSalonMetrics } from "@/lib/data-service"
import { useDemoSlots } from "@/lib/demo-slots"
import { toDateInputValue } from "@/lib/utils"
import type { Salon } from "@/types"
import { SERVICES } from "@/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus, Trash2, CalendarDays, Loader2, Edit3, PauseCircle, PlayCircle,
  ChevronLeft, ChevronRight
} from "lucide-react"

const EMPTY_SLOT_FORM = {
  slot_date: "",
  start_time: "09:00",
  end_time: "10:00",
  capacity: "1",
}

const WEEKDAY_OPTIONS = [
  { key: "monday", label: "Mon", dateDay: 1 },
  { key: "tuesday", label: "Tue", dateDay: 2 },
  { key: "wednesday", label: "Wed", dateDay: 3 },
  { key: "thursday", label: "Thu", dateDay: 4 },
  { key: "friday", label: "Fri", dateDay: 5 },
  { key: "saturday", label: "Sat", dateDay: 6 },
  { key: "sunday", label: "Sun", dateDay: 0 },
] as const

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export default function OwnerSlotsPage() {
  const { user, isLoading } = useAuth()
  const salons: Salon[] = user?.role === "owner" ? getOwnerSalons(user.id) : []
  const [selectedSalonOverride, setSelectedSalonOverride] = useState("")
  const selectedSalonId = selectedSalonOverride || salons[0]?.id || ""
  const { slots, createSlot, updateSlot, deleteSlot } = useDemoSlots(selectedSalonId)
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_SLOT_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [showRecurringForm, setShowRecurringForm] = useState(false)
  const [recurringDays, setRecurringDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"])
  const [recurringWeeks, setRecurringWeeks] = useState("2")
  const [recurringStart, setRecurringStart] = useState("10:00")
  const [recurringEnd, setRecurringEnd] = useState("18:00")
  const [recurringDuration, setRecurringDuration] = useState("60")
  const [recurringCapacity, setRecurringCapacity] = useState("1")
  const [recurringServiceId, setRecurringServiceId] = useState("all")
  const [bulkSummary, setBulkSummary] = useState("")

  if (isLoading) return null
  if (!user) redirect("/login")
  if (user.role !== "owner") redirect("/")

  const getWeekDays = () => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() + weekOffset * 7)
    start.setHours(0, 0, 0, 0)

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push(toDateInputValue(d))
    }
    return days
  }

  const weekDays = getWeekDays()
  const selectedSalon = salons.find((salon) => salon.id === selectedSalonId) || null
  const salonServices = SERVICES.filter((service) => service.salon_id === selectedSalonId && service.active)

  const getSlotsForDate = (date: string) => {
    return slots.filter(s => s.slot_date === date)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData(EMPTY_SLOT_FORM)
    setShowAddForm(false)
    setFormError("")
  }

  const openCreateForm = () => {
    setEditingId(null)
    setFormData({
      ...EMPTY_SLOT_FORM,
      slot_date: toDateInputValue(),
    })
    setFormError("")
    setShowAddForm(true)
    setShowRecurringForm(false)
  }

  const openEditForm = (slotId: string) => {
    const slot = slots.find((candidate) => candidate.id === slotId)
    if (!slot) return

    setEditingId(slot.id)
    setFormData({
      slot_date: slot.slot_date,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      capacity: String(slot.capacity),
    })
    setFormError("")
    setShowAddForm(true)
  }

  const handleSaveSlot = async () => {
    const capacity = Number(formData.capacity)
    const today = toDateInputValue()
    const editingSlot = editingId
      ? slots.find((slot) => slot.id === editingId)
      : undefined
    setFormError("")

    if (
      !selectedSalonId ||
      !formData.slot_date ||
      !formData.start_time ||
      !formData.end_time
    ) {
      setFormError("Date, start time, and end time are required.")
      return
    }
    if (formData.slot_date < today) {
      setFormError("Availability cannot be created in the past.")
      return
    }
    if (formData.start_time >= formData.end_time) {
      setFormError("End time must be later than start time.")
      return
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      setFormError("Capacity must be a whole number between 1 and 50.")
      return
    }
    if (editingSlot && capacity < editingSlot.booked_count) {
      setFormError(`Capacity cannot be lower than ${editingSlot.booked_count} existing bookings.`)
      return
    }
    if (
      editingSlot &&
      editingSlot.booked_count > 0 &&
      (
        editingSlot.slot_date !== formData.slot_date ||
        editingSlot.start_time.slice(0, 5) !== formData.start_time ||
        editingSlot.end_time.slice(0, 5) !== formData.end_time
      )
    ) {
      setFormError("Date and time cannot be changed after a slot has bookings.")
      return
    }
    const overlaps = slots.some(
      (slot) =>
        slot.id !== editingId &&
        slot.slot_date === formData.slot_date &&
        formData.start_time < slot.end_time.slice(0, 5) &&
        formData.end_time > slot.start_time.slice(0, 5)
    )
    if (overlaps) {
      setFormError("This time range overlaps an existing slot.")
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        updateSlot(editingId, {
          slot_date: formData.slot_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          capacity,
        })
      } else {
        createSlot({
          salon_id: selectedSalonId,
          service_id: null,
          slot_date: formData.slot_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          capacity,
        })
      }
      recomputeSalonMetrics(selectedSalonId)
      resetForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save this slot.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = (slotId: string) => {
    if (!selectedSalonId) return
    if (!window.confirm("Delete this availability slot from the demo repository?")) return
    setFormError("")
    try {
      deleteSlot(slotId)
      recomputeSalonMetrics(selectedSalonId)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to delete this slot.")
    }
  }

  const handleToggleAvailability = (slotId: string) => {
    const slot = slots.find((candidate) => candidate.id === slotId)
    if (!slot || !selectedSalonId) return

    updateSlot(slot.id, { is_available: !slot.is_available })
    recomputeSalonMetrics(selectedSalonId)
  }

  const toggleRecurringDay = (day: string) => {
    setRecurringDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    )
  }

  const handleCreateRecurringSlots = () => {
    setFormError("")
    setBulkSummary("")
    if (!selectedSalonId) {
      setFormError("Select a salon before creating recurring slots.")
      return
    }
    if (recurringDays.length === 0) {
      setFormError("Select at least one day of the week.")
      return
    }

    const weeks = Number(recurringWeeks)
    const duration = Number(recurringDuration)
    const capacity = Number(recurringCapacity)
    const startMinutes = timeToMinutes(recurringStart)
    const endMinutes = timeToMinutes(recurringEnd)

    if (![1, 2, 4].includes(weeks)) {
      setFormError("Choose a valid date range.")
      return
    }
    if (!Number.isInteger(duration) || duration < 15 || duration > 240) {
      setFormError("Slot duration must be between 15 and 240 minutes.")
      return
    }
    if (startMinutes >= endMinutes || startMinutes + duration > endMinutes) {
      setFormError("End time must allow at least one full slot.")
      return
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      setFormError("Capacity must be a whole number between 1 and 50.")
      return
    }
    if (recurringServiceId !== "all" && !salonServices.some((service) => service.id === recurringServiceId)) {
      setFormError("Choose a valid service scope.")
      return
    }

    const weeklyOff = new Set(selectedSalon?.weekly_off || [])
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let created = 0
    let skipped = 0
    const serviceId = recurringServiceId === "all" ? null : recurringServiceId

    for (let offset = 0; offset < weeks * 7; offset += 1) {
      const current = new Date(today)
      current.setDate(today.getDate() + offset)
      const day = WEEKDAY_OPTIONS.find((item) => item.dateDay === current.getDay())
      if (!day || !recurringDays.includes(day.key) || weeklyOff.has(day.key)) continue

      const slotDate = toDateInputValue(current)
      for (let start = startMinutes; start + duration <= endMinutes; start += duration) {
        const startTime = minutesToTime(start)
        const endTime = minutesToTime(start + duration)
        const duplicate = slots.some(
          (slot) =>
            slot.salon_id === selectedSalonId &&
            slot.service_id === serviceId &&
            slot.slot_date === slotDate &&
            slot.start_time.slice(0, 5) === startTime &&
            slot.end_time.slice(0, 5) === endTime
        )
        if (duplicate) {
          skipped += 1
          continue
        }
        createSlot({
          salon_id: selectedSalonId,
          service_id: serviceId,
          slot_date: slotDate,
          start_time: startTime,
          end_time: endTime,
          capacity,
        })
        created += 1
      }
    }

    recomputeSalonMetrics(selectedSalonId)
    setBulkSummary(`Created ${created} slots, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}.`)
    setShowRecurringForm(false)
  }

  const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0)
  const totalBooked = slots.reduce((sum, s) => sum + s.booked_count, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Availability Slots</h1>
          <p className="text-gray-500 text-sm">Manage your appointment slots and capacity</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={selectedSalonId}
            aria-label="Select salon"
            onChange={e => {
              setSelectedSalonOverride(e.target.value)
              resetForm()
            }}
          >
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button
            onClick={openCreateForm}
            disabled={!selectedSalonId}
            className="gap-2 bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4" /> Add Slots
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowRecurringForm((open) => !open)
              setShowAddForm(false)
              setFormError("")
            }}
            disabled={!selectedSalonId}
            className="gap-2"
          >
            <CalendarDays className="w-4 h-4" /> Add Recurring
          </Button>
        </div>
      </div>

      <Card className="border-blue-100 bg-blue-50/70">
        <CardContent className="p-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">GlowGo Salon Autopilot</p>
              <p className="mt-1 text-sm text-blue-800">
                Availability is treated as a working window, not a fixed one-hour booking. Customer times are shown only when the selected service duration and prep/cleanup buffer can fit into continuous capacity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-900 sm:grid-cols-4 lg:grid-cols-2">
              <span className="rounded-lg bg-white/80 px-3 py-2">Staff count comes from salon profile</span>
              <span className="rounded-lg bg-white/80 px-3 py-2">Slot capacity limits parallel bookings</span>
              <span className="rounded-lg bg-white/80 px-3 py-2">Services define duration and buffers</span>
              <span className="rounded-lg bg-white/80 px-3 py-2">Group bookings require confirmation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{slots.length}</div>
            <div className="text-xs text-gray-500">Total Slots</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCapacity}</div>
            <div className="text-xs text-gray-500">Total Capacity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalBooked}</div>
            <div className="text-xs text-gray-500">Booked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">Utilization</div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Slot Form */}
      {showAddForm && (
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Date</label>
                <Input
                  type="date"
                  required
                  value={formData.slot_date}
                  onChange={e => setFormData(prev => ({ ...prev, slot_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Start</label>
                <Input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">End</label>
                <Input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Capacity</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.capacity}
                  onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSaveSlot} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : editingId
                      ? <Edit3 className="w-4 h-4" />
                      : <Plus className="w-4 h-4" />}
                  {editingId ? "Update" : "Save"}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
          </CardContent>
        </Card>
      )}

      {showRecurringForm && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Add recurring slots</h2>
                <p className="text-xs text-gray-500">Creates future availability and skips exact duplicates.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowRecurringForm(false)}>Close</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium">Days</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((day) => {
                    const disabled = selectedSalon?.weekly_off?.includes(day.key)
                    const selected = recurringDays.includes(day.key)
                    return (
                      <button
                        key={day.key}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleRecurringDay(day.key)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selected
                            ? "border-purple-500 bg-purple-600 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                        title={disabled ? "Weekly off day" : undefined}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Range</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(e.target.value)}
                >
                  <option value="1">1 week</option>
                  <option value="2">2 weeks</option>
                  <option value="4">4 weeks</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Service scope</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={recurringServiceId}
                  onChange={(e) => setRecurringServiceId(e.target.value)}
                >
                  <option value="all">All services</option>
                  {salonServices.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Start</label>
                <Input type="time" value={recurringStart} onChange={(e) => setRecurringStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">End</label>
                <Input type="time" value={recurringEnd} onChange={(e) => setRecurringEnd(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Slot duration</label>
                <Input
                  inputMode="numeric"
                  value={recurringDuration}
                  onChange={(e) => setRecurringDuration(e.target.value.replace(/\D/g, "").slice(0, 3))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Capacity</label>
                <Input
                  inputMode="numeric"
                  value={recurringCapacity}
                  onChange={(e) => setRecurringCapacity(e.target.value.replace(/\D/g, "").slice(0, 2))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateRecurringSlots} className="bg-purple-600 hover:bg-purple-700">
                Create recurring slots
              </Button>
              <p className="text-xs text-gray-500">Weekly off days are excluded automatically.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!showAddForm && formError && (
        <p className="text-sm text-red-600" role="alert">{formError}</p>
      )}
      {bulkSummary && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{bulkSummary}</p>
      )}

      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Previous Week
        </Button>
        <span className="text-sm font-medium">
          {new Date(weekDays[0]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(weekDays[6]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)} className="gap-1">
          Next Week <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map(date => {
          const daySlots = getSlotsForDate(date)
          const dayCapacity = daySlots.reduce((sum, s) => sum + s.capacity, 0)
          const dayBooked = daySlots.reduce((sum, s) => sum + s.booked_count, 0)
          const dayName = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })
          const isToday = date === toDateInputValue()

          return (
            <Card key={date} className={`${isToday ? 'ring-2 ring-pink-400' : ''}`}>
              <CardHeader className={`p-3 pb-2 ${isToday ? 'bg-pink-50' : ''}`}>
                <CardTitle className="text-xs text-center">
                  <span className="font-bold">{dayName}</span>
                  <br />
                  <span className="text-gray-500">{new Date(date).getDate()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-1">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No slots</p>
                ) : (
                  daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between text-xs rounded-lg p-1.5 ${
                        slot.is_available ? "bg-gray-50" : "bg-gray-100 opacity-60"
                      }`}
                    >
                      <div>
                        <span className="font-medium">{slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)}</span>
                        <span className="text-gray-400 ml-1">({slot.booked_count}/{slot.capacity})</span>
                        {!slot.is_available && <span className="ml-1 text-amber-600">Paused</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(slot.id)}
                          aria-label={`Edit slot at ${slot.start_time.slice(0, 5)}`}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(slot.id)}
                          aria-label={`${slot.is_available ? "Pause" : "Activate"} slot at ${slot.start_time.slice(0, 5)}`}
                          className="text-amber-500 hover:text-amber-700"
                        >
                          {slot.is_available
                            ? <PauseCircle className="w-3 h-3" />
                            : <PlayCircle className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={slot.booked_count > 0}
                          aria-label={
                            slot.booked_count > 0
                              ? `Cannot delete booked slot at ${slot.start_time.slice(0, 5)}`
                              : `Delete slot at ${slot.start_time.slice(0, 5)}`
                          }
                          className="text-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {dayCapacity > 0 && (
                  <div className="text-xs text-center text-gray-500 pt-1">
                    {dayBooked}/{dayCapacity} booked
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!selectedSalonId && (
        <div className="text-center py-16 text-gray-500">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Create a salon first to manage availability slots.</p>
        </div>
      )}
      <p className="text-center text-xs text-gray-400">
        Slot changes persist in this browser and control customer booking times for the demo.
      </p>
    </div>
  )
}
