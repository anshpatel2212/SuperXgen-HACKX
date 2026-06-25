"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ServiceForm } from "@/components/owner/service-form"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { formatPrice } from "@/lib/utils"
import {
  Scissors,
  Plus,
  Clock,
  IndianRupee,
  Percent,
  Edit3,
  Trash2,
  Star,
  Store,
} from "lucide-react"
import { SALONS, SERVICES } from "@/data"
import { useAuth } from "@/lib/auth-context"
import { createService, updateService, deleteService } from "@/lib/data-service"
import type { Service, Salon } from "@/types"

export default function OwnerServices() {
  const { user, isLoading: authLoading } = useAuth()

  const ownerSalons: Salon[] = SALONS.filter((s) => s.owner_id === (user?.id || ""))
  const ownerSalonIds = ownerSalons.map((s) => s.id)
  const ownerServices = SERVICES.filter((s) => ownerSalonIds.includes(s.salon_id))

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [services, setServices] = useState(ownerServices)

  const handleSave = async (data: Partial<Service>) => {
    setIsSaving(true)
    try {
      if (editingService?.id) {
        const updated = updateService(editingService.id, data)
        if (updated) {
          setServices((prev) =>
            prev.map((s) => (s.id === editingService.id ? updated : s))
          )
        }
      } else {
        const newService = createService({
          salon_id: ownerSalonIds[0] || "1",
          name: data.name || "",
          category: data.category || "",
          price: data.price || 0,
          duration_minutes: data.duration_minutes || 30,
          description: data.description,
          discount_percent: data.discounted_price && data.price ? Math.round((1 - data.discounted_price / data.price) * 100) : 0,
          gender: data.gender,
          is_home_service: data.is_home_service,
          is_popular: data.is_popular,
        })
        setServices((prev) => [...prev, newService])
      }
    } catch (err) {
      console.error("Failed to save service:", err)
    }
    setIsSaving(false)
    setShowAddForm(false)
    setEditingService(null)
  }

  const handleDelete = async () => {
    if (!showDeleteDialog) return
    try {
      deleteService(showDeleteDialog)
      setServices((prev) => prev.filter((s) => s.id !== showDeleteDialog))
    } catch (err) {
      console.error("Failed to delete service:", err)
    }
    setShowDeleteDialog(null)
  }

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Services</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      </div>
    )
  }

  if (ownerSalons.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Create a salon first"
        description="You need to create a salon before adding services"
        actionLabel="Go to Salons"
        onAction={() => {}}
      />
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage your salon services and pricing
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="size-3.5" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service to start attracting customers"
          actionLabel="Add Service"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{service.name}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {service.category}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {service.is_popular && (
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {service.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="size-3" />
                    {formatPrice(service.price)}
                  </span>
                  {service.discounted_price > 0 && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Percent className="size-3" />
                      {formatPrice(service.discounted_price)}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge
                    status={service.is_home_service ? "Home Service" : "Salon Only"}
                    size="sm"
                  />
                  <Badge variant="secondary" className="text-[10px]">
                    {service.gender}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingService(service)
                    setShowAddForm(true)
                  }}
                >
                  <Edit3 className="size-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(service.id)}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ServiceForm
        key={editingService?.id || (showAddForm ? "new-service" : "closed-service")}
        open={showAddForm}
        onOpenChange={(open) => {
          setShowAddForm(open)
          if (!open) setEditingService(null)
        }}
        service={editingService || undefined}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
