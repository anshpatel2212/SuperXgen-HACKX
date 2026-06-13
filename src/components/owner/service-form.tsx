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
  const [form, setForm] = useState<Partial<Service>>({
    name: service?.name || "",
    description: service?.description || "",
    ai_description: service?.ai_description || "",
    category: service?.category || "",
    duration_minutes: service?.duration_minutes || 30,
    price: service?.price || 0,
    discounted_price: service?.discounted_price || 0,
    gender: service?.gender || "unisex",
    is_home_service: service?.is_home_service || false,
    is_popular: service?.is_popular || false,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
    onSave(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    handleChange("duration_minutes", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    handleChange("price", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Discounted Price</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.discounted_price}
                  onChange={(e) =>
                    handleChange(
                      "discounted_price",
                      parseInt(e.target.value)
                    )
                  }
                />
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
