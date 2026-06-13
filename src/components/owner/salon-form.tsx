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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { MUMBAI_AREAS, MUMBAI_CITIES, AMENITIES_OPTIONS, formatTime } from "@/lib/utils"
import { generateSalonDescription } from "@/services/ai"
import { Sparkles, Loader2, Upload } from "lucide-react"
import type { Salon, Gender } from "@/types"

interface SalonFormProps {
  salon?: Partial<Salon>
  onSave: (data: Partial<Salon>) => void
  isSaving?: boolean
}

export function SalonForm({ salon, onSave, isSaving }: SalonFormProps) {
  const [form, setForm] = useState<Partial<Salon>>({
    name: salon?.name || "",
    tagline: salon?.tagline || "",
    phone: salon?.phone || "",
    email: salon?.email || "",
    address: salon?.address || "",
    area: salon?.area || "",
    city: salon?.city || "Mumbai",
    pincode: salon?.pincode || "",
    gender: salon?.gender || "unisex",
    luxury_level: salon?.luxury_level || "mid",
    offers_home_service: salon?.offers_home_service || false,
    working_hours_json: salon?.working_hours_json || {
      monday: { open: "09:00", close: "21:00", is_closed: false },
      tuesday: { open: "09:00", close: "21:00", is_closed: false },
      wednesday: { open: "09:00", close: "21:00", is_closed: false },
      thursday: { open: "09:00", close: "21:00", is_closed: false },
      friday: { open: "09:00", close: "21:00", is_closed: false },
      saturday: { open: "09:00", close: "21:00", is_closed: false },
      sunday: { open: "10:00", close: "18:00", is_closed: false }
    },
    amenities: salon?.amenities || [],
    description: salon?.description || "",
    ai_description: salon?.ai_description || "",
    logo_url: salon?.logo_url || "",
    cover_url: salon?.cover_url || "",
    images: salon?.images || [],
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    const current = form.amenities || []
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    handleChange("amenities", updated)
  }

  const handleGenerateDescription = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 800))
    const desc = generateSalonDescription(form)
    handleChange("ai_description", desc)
    handleChange("description", desc)
    setIsGenerating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your salon's basic details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Salon Name</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter salon name"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="A short tagline"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="hello@salon.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Full address"
            />
          </div>
          <div className="space-y-2">
            <Label>Area</Label>
            <Select
              value={form.area}
              onValueChange={(v) => handleChange("area", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {MUMBAI_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value="Mumbai" disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input
              value={form.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
              placeholder="400050"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salon Settings</CardTitle>
          <CardDescription>Configure salon preferences</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => handleChange("gender", v as Gender)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unisex">Unisex</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="men">Men</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Monday - Saturday Open</Label>
            <Input
              type="time"
              value={form.working_hours_json?.monday?.open || "09:00"}
              onChange={(e) => handleChange("working_hours_json", { ...form.working_hours_json, monday: { ...form.working_hours_json?.monday, open: e.target.value }, tuesday: { ...form.working_hours_json?.tuesday, open: e.target.value }, wednesday: { ...form.working_hours_json?.wednesday, open: e.target.value }, thursday: { ...form.working_hours_json?.thursday, open: e.target.value }, friday: { ...form.working_hours_json?.friday, open: e.target.value }, saturday: { ...form.working_hours_json?.saturday, open: e.target.value } })}
            />
          </div>
          <div className="space-y-2">
            <Label>Monday - Saturday Close</Label>
            <Input
              type="time"
              value={form.working_hours_json?.monday?.close || "21:00"}
              onChange={(e) => handleChange("working_hours_json", { ...form.working_hours_json, monday: { ...form.working_hours_json?.monday, close: e.target.value }, tuesday: { ...form.working_hours_json?.tuesday, close: e.target.value }, wednesday: { ...form.working_hours_json?.wednesday, close: e.target.value }, thursday: { ...form.working_hours_json?.thursday, close: e.target.value }, friday: { ...form.working_hours_json?.friday, close: e.target.value }, saturday: { ...form.working_hours_json?.saturday, close: e.target.value } })}
            />
          </div>
          <div className="flex items-end gap-6 pb-2">
            <div className="flex items-center gap-2">
              <Label>Luxury Level</Label>
              <Select
                value={form.luxury_level}
                onValueChange={(v) => handleChange("luxury_level", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.offers_home_service}
                onCheckedChange={(c) => handleChange("offers_home_service", c)}
                id="home-service"
              />
              <Label htmlFor="home-service">Home Service</Label>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map((amenity: string) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    (form.amenities || []).includes(amenity)
                      ? "border-glowgo-pink bg-glowgo-pink/10 text-glowgo-rose"
                      : "border-border text-muted-foreground hover:border-glowgo-pink/50"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Description</CardTitle>
              <CardDescription>Tell customers about your salon</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDescription}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe your salon..."
            rows={5}
          />
          {form.ai_description && (
            <div className="rounded-lg bg-glowgo-cream p-3 text-sm text-muted-foreground">
              <span className="mb-1 flex items-center gap-1 text-xs font-medium text-glowgo-pink">
                <Sparkles className="size-3" /> AI Suggestion
              </span>
              {form.ai_description}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>Upload logo, cover, and gallery images</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-glowgo-pink/50">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="size-5" />
                <span className="text-xs">Upload Logo</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Cover Image</Label>
            <div className="flex aspect-[16/9] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-glowgo-pink/50">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="size-5" />
                <span className="text-xs">Upload Cover</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label>Gallery Images (up to 5)</Label>
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square w-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-glowgo-pink/50"
                >
                  <Upload className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
