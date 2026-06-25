"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { SERVICE_CATEGORIES } from "@/lib/utils"
import { generateServiceDescription } from "@/services/ai"
import { Sparkles, Loader2 } from "lucide-react"
import type { Service, Gender } from "@/types"

const OTHER_CATEGORY = "Other"
const RESOURCE_TYPES = [
  "General chair",
  "Haircut chair",
  "Facial room",
  "Bridal station",
  "Manicure table",
  "Massage room",
]

function toNumericInput(value: string) {
  return value.replace(/\D/g, "")
}

function getInitialForm(service?: Partial<Service>): Partial<Service> {
  const category = service?.category || ""
  return {
    name: service?.name || "",
    description: service?.description || "",
    ai_description: service?.ai_description || "",
    category: SERVICE_CATEGORIES.includes(category) ? category : category ? OTHER_CATEGORY : "",
    duration_minutes: service?.duration_minutes || 30,
    buffer_before_minutes: service?.buffer_before_minutes || 0,
    buffer_after_minutes: service?.buffer_after_minutes || 0,
    required_staff_count: service?.required_staff_count || 1,
    required_resource_type: service?.required_resource_type || "General chair",
    instant_booking_allowed: service?.instant_booking_allowed !== false,
    group_booking_allowed: service?.group_booking_allowed !== false,
    confirmation_required: service?.confirmation_required || false,
    price: service?.price || 0,
    discounted_price: service?.discounted_price || 0,
    gender: service?.gender || "unisex",
    is_home_service: service?.is_home_service || false,
    is_popular: service?.is_popular || false,
  }
}

interface ServiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Partial<Service>
  onSave: (data: Partial<Service>) => void
  isSaving?: boolean
}

export function ServiceForm({
  open,
  onOpenChange,
  service,
  onSave,
  isSaving,
}: ServiceFormProps) {
  const [form, setForm] = useState<Partial<Service>>(getInitialForm(service))
  const [customCategory, setCustomCategory] = useState(
    service?.category && !SERVICE_CATEGORIES.includes(service.category) ? service.category : ""
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleGenerateDescription = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 800))
    const desc = generateServiceDescription(form)
    handleChange("description", desc)
    handleChange("ai_description", desc)
    setIsGenerating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    const price = Number(form.price || 0)
    const discountedPrice = Number(form.discounted_price || 0)
    const duration = Number(form.duration_minutes || 0)
    const bufferBefore = Number(form.buffer_before_minutes || 0)
    const bufferAfter = Number(form.buffer_after_minutes || 0)
    const requiredStaff = Number(form.required_staff_count || 1)
    const finalCategory = form.category === OTHER_CATEGORY ? customCategory.trim() : (form.category || "").trim()

    if ((form.name || "").trim().length < 3) nextErrors.name = "Service name must be at least 3 characters."
    if (!finalCategory) nextErrors.category = "Select a category or enter a custom category."
    if (!Number.isFinite(duration) || duration <= 0) nextErrors.duration_minutes = "Duration must be greater than 0."
    if (!Number.isFinite(bufferBefore) || bufferBefore < 0 || bufferBefore > 180) {
      nextErrors.buffer_before_minutes = "Prep buffer must be between 0 and 180 minutes."
    }
    if (!Number.isFinite(bufferAfter) || bufferAfter < 0 || bufferAfter > 180) {
      nextErrors.buffer_after_minutes = "Cleanup buffer must be between 0 and 180 minutes."
    }
    if (!Number.isFinite(requiredStaff) || requiredStaff < 1 || requiredStaff > 20) {
      nextErrors.required_staff_count = "Required staff must be between 1 and 20."
    }
    if (!Number.isFinite(price) || price < 1) nextErrors.price = "Price must be at least ₹1."
    if (discountedPrice < 0) nextErrors.discounted_price = "Discounted price cannot be negative."
    if (discountedPrice > 0 && discountedPrice > price) {
      nextErrors.discounted_price = "Discounted price cannot exceed original price."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      ...form,
      name: (form.name || "").trim(),
      category: finalCategory,
      price,
      discounted_price: discountedPrice,
      duration_minutes: duration,
      buffer_before_minutes: bufferBefore,
      buffer_after_minutes: bufferAfter,
      required_staff_count: requiredStaff,
      required_resource_type: form.required_resource_type || "General chair",
      instant_booking_allowed: form.instant_booking_allowed !== false,
      group_booking_allowed: form.group_booking_allowed !== false,
      confirmation_required: form.confirmation_required || false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {service?.id ? "Edit Service" : "Add Service"}
            </DialogTitle>
            <DialogDescription>
              {service?.id
                ? "Update service details"
                : "Add a new service to your salon"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Classic Haircut"
                required
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => handleChange("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_CATEGORY}>{OTHER_CATEGORY}</SelectItem>
                  </SelectContent>
                </Select>
                {form.category === OTHER_CATEGORY && (
                  <Input
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value)
                      setErrors((prev) => ({ ...prev, category: "" }))
                    }}
                    placeholder="Enter service category"
                  />
                )}
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  inputMode="numeric"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    handleChange("duration_minutes", Number(toNumericInput(e.target.value) || 0))
                  }
                />
                {errors.duration_minutes && <p className="text-xs text-destructive">{errors.duration_minutes}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) =>
                    handleChange("price", Number(toNumericInput(e.target.value) || 0))
                  }
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label>Discounted Price</Label>
                <Input
                  inputMode="numeric"
                  value={form.discounted_price}
                  onChange={(e) =>
                    handleChange(
                      "discounted_price",
                      Number(toNumericInput(e.target.value) || 0)
                    )
                  }
                />
                {errors.discounted_price && <p className="text-xs text-destructive">{errors.discounted_price}</p>}
              </div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Smart capacity rules</p>
                <p className="text-xs text-blue-700">
                  GlowGo uses duration and buffers to show only continuous time blocks that can fit the service.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prep buffer (min)</Label>
                  <Input
                    inputMode="numeric"
                    value={form.buffer_before_minutes}
                    onChange={(e) =>
                      handleChange("buffer_before_minutes", Number(toNumericInput(e.target.value) || 0))
                    }
                  />
                  {errors.buffer_before_minutes && <p className="text-xs text-destructive">{errors.buffer_before_minutes}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cleanup buffer (min)</Label>
                  <Input
                    inputMode="numeric"
                    value={form.buffer_after_minutes}
                    onChange={(e) =>
                      handleChange("buffer_after_minutes", Number(toNumericInput(e.target.value) || 0))
                    }
                  />
                  {errors.buffer_after_minutes && <p className="text-xs text-destructive">{errors.buffer_after_minutes}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Required staff</Label>
                  <Input
                    inputMode="numeric"
                    value={form.required_staff_count}
                    onChange={(e) =>
                      handleChange("required_staff_count", Number(toNumericInput(e.target.value) || 1))
                    }
                  />
                  {errors.required_staff_count && <p className="text-xs text-destructive">{errors.required_staff_count}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Resource</Label>
                  <Select
                    value={form.required_resource_type || "General chair"}
                    onValueChange={(v) => handleChange("required_resource_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.instant_booking_allowed !== false}
                    onCheckedChange={(c) => handleChange("instant_booking_allowed", c)}
                    id="svc-instant"
                  />
                  <Label htmlFor="svc-instant">Instant booking</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.group_booking_allowed !== false}
                    onCheckedChange={(c) => handleChange("group_booking_allowed", c)}
                    id="svc-group"
                  />
                  <Label htmlFor="svc-group">Groups</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.confirmation_required || false}
                    onCheckedChange={(c) => handleChange("confirmation_required", c)}
                    id="svc-confirm"
                  />
                  <Label htmlFor="svc-confirm">Confirm first</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => handleChange("gender", v as Gender)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unisex">Unisex</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_home_service}
                  onCheckedChange={(c) =>
                    handleChange("is_home_service", c)
                  }
                  id="svc-home"
                />
                <Label htmlFor="svc-home">Home Service</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_popular}
                  onCheckedChange={(c) => handleChange("is_popular", c)}
                  id="svc-popular"
                />
                <Label htmlFor="svc-popular">Popular</Label>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                  AI
                </Button>
              </div>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe this service..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isSaving ? "Saving..." : service?.id ? "Update" : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
