"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { getOwnerSalons, createSlot, getSalonSlots, deleteSlot, updateSlot, recomputeSalonMetrics } from "@/lib/data-service"
import type { Salon, AvailabilitySlot } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Trash2, Clock, CalendarDays, Loader2,
  ChevronLeft, ChevronRight
} from "lucide-react"

export default function OwnerSlotsPage() {
  const { user, isLoading } = useAuth()
  const [salons, setSalons] = useState<Salon[]>([])
  const [selectedSalonId, setSelectedSalonId] = useState<string>("")
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    slot_date: "", start_time: "09:00", end_time: "10:00", capacity: "1",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && user.role === "owner") {
      const ownerSalons = getOwnerSalons(user.id)
      setSalons(ownerSalons)
      if (ownerSalons.length > 0) setSelectedSalonId(ownerSalons[0].id)
    }
  }, [user])

  useEffect(() => {
    if (selectedSalonId) {
      const weekSlots = getSalonSlots(selectedSalonId)
      setSlots(weekSlots)
    }
  }, [selectedSalonId])

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
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  const weekDays = getWeekDays()

  const getSlotsForDate = (date: string) => {
    return slots.filter(s => s.slot_date === date)
  }

  const handleAddSlot = async () => {
    if (!selectedSalonId || !formData.slot_date) return
    setSaving(true)
    try {
      createSlot({
        salon_id: selectedSalonId,
        slot_date: formData.slot_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        capacity: parseInt(formData.capacity) || 1,
      })
      recomputeSalonMetrics(selectedSalonId)
      setSlots(getSalonSlots(selectedSalonId))
      setShowAddForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = (slotId: string) => {
    if (!selectedSalonId) return
    deleteSlot(slotId)
    recomputeSalonMetrics(selectedSalonId)
    setSlots(getSalonSlots(selectedSalonId))
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
            onChange={e => setSelectedSalonId(e.target.value)}
          >
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-pink-600 hover:bg-pink-700">
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

      {/* Add Slot Form */}
      {showAddForm && (
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.slot_date}
                  onChange={e => setFormData(prev => ({ ...prev, slot_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Start</label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">End</label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Capacity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleAddSlot} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
          const isToday = date === new Date().toISOString().split('T')[0]

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
                    <div key={slot.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-1.5">
                      <div>
                        <span className="font-medium">{slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)}</span>
                        <span className="text-gray-400 ml-1">({slot.booked_count}/{slot.capacity})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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
    </div>
  )
}
