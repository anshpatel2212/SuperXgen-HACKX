"use client"

import { useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, getInitials, MUMBAI_AREAS } from "@/lib/utils"
import { createSalon } from "@/lib/data-service"
import { SALONS } from "@/data"
import { useAuth } from "@/lib/auth-context"
import type { Salon } from "@/types"
import {
  Store,
  Plus,
  MapPin,
  Star,
  Eye,
  Settings,
  Scissors,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function OwnerSalons() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [createdSalons, setCreatedSalons] = useState<Salon[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [form, setForm] = useState<CreateSalonForm>({ name: "", area: "", phone: "", description: "" })
  const ownerSalons = useMemo(() => {
    const ownerId = user?.id || ""
    const salonsById = new Map<string, Salon>()
    for (const salon of SALONS.filter((s) => s.owner_id === ownerId)) salonsById.set(salon.id, salon)
    for (const salon of createdSalons.filter((s) => s.owner_id === ownerId)) salonsById.set(salon.id, salon)
    return Array.from(salonsById.values())
  }, [createdSalons, user?.id])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.area.trim()) {
      setCreateError("Salon name and area are required")
      return
    }
    if (!user) return
    setCreating(true)
    setCreateError("")
    try {
      const salon = createSalon({
        owner_id: user.id,
        name: form.name,
        area: form.area,
        city: "Mumbai",
        phone: form.phone,
        description: form.description,
      })
      setCreatedSalons((prev) => [...prev, salon])
      setShowCreate(false)
      setForm({ name: "", area: "", phone: "", description: "" })
    } catch {
      setCreateError("Failed to create salon. Please try again.")
    }
    setCreating(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Salons</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      </div>
    )
  }

  if (ownerSalons.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Salons</h1>
            <p className="text-sm text-muted-foreground">Manage your salon portfolio</p>
          </div>
        </div>
        <EmptyState
          icon={Store}
          title="You haven't created any salons yet"
          description="Add your first salon to start receiving bookings on GlowGo Mumbai"
          actionLabel="Add Your First Salon"
          onAction={() => setShowCreate(true)}
        />
        <CreateDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          form={form}
          setForm={setForm}
          creating={creating}
          error={createError}
          onSubmit={handleCreate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">My Salons</h1>
          <p className="text-sm text-muted-foreground">Manage your salon portfolio</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-3.5" />
          Add New Salon
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ownerSalons.map((salon) => (
          <Card key={salon.id} className="group transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={salon.logo_url} alt={salon.name} />
                    <AvatarFallback>{getInitials(salon.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{salon.name}</CardTitle>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {salon.area}, {salon.city}
                    </div>
                  </div>
                </div>
                <StatusBadge status={salon.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-3 text-amber-500" />
                  {salon.rating_avg.toFixed(1)} ({salon.review_count})
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {salon.total_bookings} bookings
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {salon.description || "No description yet"}
              </p>
            </CardContent>
            <CardFooter className="gap-1.5">
              <Button variant="default" size="sm" onClick={() => router.push(`/owner/salons/${salon.id}/edit`)}>
                <Settings className="size-3.5" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/salon/${salon.id}`)}>
                <Eye className="size-3.5" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/owner/services?salonId=${salon.id}`)}>
                <Scissors className="size-3.5" />
                Services
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        form={form}
        setForm={setForm}
        creating={creating}
        error={createError}
        onSubmit={handleCreate}
      />
    </div>
  )
}

interface CreateSalonForm {
  name: string
  area: string
  phone: string
  description: string
}

function CreateDialog({
  open,
  onOpenChange,
  form,
  setForm,
  creating,
  error,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: CreateSalonForm
  setForm: Dispatch<SetStateAction<CreateSalonForm>>
  creating: boolean
  error: string
  onSubmit: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Salon</DialogTitle>
          <DialogDescription>
            List your salon on GlowGo Mumbai and start receiving bookings.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit() }}
          className="space-y-4 py-2"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Salon Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Glow & Glam Studio"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area">Area *</Label>
            <Select
              value={form.area}
              onValueChange={(v) => v && setForm((f) => ({ ...f, area: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area in Mumbai" />
              </SelectTrigger>
              <SelectContent>
                {MUMBAI_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Tell customers about your salon..."
              className="resize-none h-20"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </span>
              ) : (
                "Create Salon"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
