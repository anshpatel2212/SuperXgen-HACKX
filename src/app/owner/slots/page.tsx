"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { getOwnerSalons, recomputeSalonMetrics } from "@/lib/data-service"
import { useDemoSlots } from "@/lib/demo-slots"
import { toDateInputValue } from "@/lib/utils"
import type { Salon } from "@/types"
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
        </div>
      </div>

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

      {!showAddForm && formError && (
        <p className="text-sm text-red-600" role="alert">{formError}</p>
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
