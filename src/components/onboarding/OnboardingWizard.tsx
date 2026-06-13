"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, Check, Store, Image, ListChecks,
  Clock, Shield, Tag, Sparkles, Building2, MapPin, Phone, Mail,
  Users, Home, IndianRupee, Scissors, Camera, PackageOpen,
  CheckCircle2, Save, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { createSalon, createService } from "@/lib/data-service"
import { MUMBAI_AREAS, MUMBAI_CITIES, SERVICE_CATEGORIES, AMENITIES_OPTIONS } from "@/lib/utils"

interface OnboardingData {
  name: string
  area: string
  city: string
  address: string
  pincode: string
  phone: string
  email: string
  latitude: string
  longitude: string
  tagline: string
  description: string
  cover_image: string
  gallery: string[]
  categories_offered: string[]
  gender: string
  luxury_level: string
  offers_home_service: boolean
  home_service_radius_km: string
  working_hours: Record<string, { open: string; close: string; is_closed: boolean }>
  weekly_off: string[]
  staff_count: string
  payment_modes: string[]
  cancellation_policy: string
  hygiene_practices: string[]
  amenities: string[]
  services: {
    name: string
    category: string
    description: string
    price: string
    duration_minutes: string
    discount_percent: string
    gender: string
  }[]
}

const INITIAL_DATA: OnboardingData = {
  name: "", area: "Andheri", city: "Mumbai", address: "", pincode: "",
  phone: "", email: "", latitude: "", longitude: "",
  tagline: "", description: "", cover_image: "", gallery: [],
  categories_offered: [], gender: "unisex", luxury_level: "mid",
  offers_home_service: false, home_service_radius_km: "5",
  working_hours: {
    monday: { open: "09:00", close: "21:00", is_closed: false },
    tuesday: { open: "09:00", close: "21:00", is_closed: false },
    wednesday: { open: "09:00", close: "21:00", is_closed: false },
    thursday: { open: "09:00", close: "21:00", is_closed: false },
    friday: { open: "09:00", close: "21:00", is_closed: false },
    saturday: { open: "09:00", close: "21:00", is_closed: false },
    sunday: { open: "10:00", close: "18:00", is_closed: true },
  },
  weekly_off: ["sunday"],
  staff_count: "5",
  payment_modes: [],
  cancellation_policy: "Free cancellation up to 24 hours before appointment.",
  hygiene_practices: [],
  amenities: [],
  services: [],
}

const STEPS = [
  { id: "basic", label: "Basic Info", icon: Building2 },
  { id: "branding", label: "Branding", icon: Camera },
  { id: "categories", label: "Services", icon: Scissors },
  { id: "details", label: "Details", icon: ListChecks },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "policies", label: "Policies", icon: Shield },
  { id: "services", label: "Add Services", icon: PackageOpen },
  { id: "review", label: "Review", icon: CheckCircle2 },
]

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
}

const LUXURY_LEVELS = [
  { value: "budget", label: "Budget-Friendly", desc: "Affordable services for everyday needs" },
  { value: "mid", label: "Mid-Range", desc: "Quality services at reasonable prices" },
  { value: "premium", label: "Premium", desc: "High-end experience with premium products" },
  { value: "luxury", label: "Luxury", desc: "Exclusive luxury experience" },
]

const PAYMENT_MODE_OPTIONS = ["Cash", "Card", "UPI", "Net Banking", "Wallet", "Pay Later"]
const HYGIENE_OPTIONS = ["Sanitized Tools", "Disposable Gloves", "Mask Required", "Temperature Check", "Contactless Payment", "Regular Disinfection", "Hand Sanitizer"]
const WEEKDAY_OPTIONS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function OnboardingWizard() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    switch (step) {
      case 0:
        if (!data.name.trim()) newErrors.name = "Salon name is required"
        if (!data.phone.trim()) newErrors.phone = "Phone is required"
        if (!data.email.trim()) newErrors.email = "Email is required"
        if (!data.address.trim()) newErrors.address = "Address is required"
        break
      case 6:
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep() && step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const salon = createSalon({
        owner_id: user.id,
        name: data.name,
        area: data.area,
        city: data.city,
        address: data.address,
        phone: data.phone,
        email: data.email,
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        tagline: data.tagline,
        description: data.description,
        cover_image: data.cover_image,
        gallery: data.gallery.length > 0 ? data.gallery : undefined,
        gender: data.gender,
        luxury_level: data.luxury_level,
        offers_home_service: data.offers_home_service,
        home_service_radius_km: parseInt(data.home_service_radius_km) || 0,
        categories_offered: data.categories_offered,
        staff_count: parseInt(data.staff_count) || 1,
        payment_modes: data.payment_modes,
        cancellation_policy: data.cancellation_policy,
        hygiene_practices: data.hygiene_practices,
        working_hours_json: data.working_hours,
        weekly_off: data.weekly_off,
        amenities: data.amenities,
      })

      for (const svc of data.services) {
        if (svc.name.trim() && svc.price) {
          createService({
            salon_id: salon.id,
            name: svc.name,
            category: svc.category,
            price: parseInt(svc.price) || 0,
            duration_minutes: parseInt(svc.duration_minutes) || 30,
            discount_percent: parseInt(svc.discount_percent) || 0,
            description: svc.description,
            gender: svc.gender,
            is_home_service: data.offers_home_service,
            is_popular: false,
            active: true,
          })
        }
      }

      router.push(`/owner/salons/${salon.id}/edit?onboarded=true`)
    } catch (err) {
      console.error("Onboarding save error:", err)
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: "", category: SERVICE_CATEGORIES[0], description: "",
        price: "", duration_minutes: "30", discount_percent: "0", gender: "unisex",
      }],
    }))
  }

  const updateService = (idx: number, field: string, value: string) => {
    setData(prev => {
      const services = [...prev.services]
      services[idx] = { ...services[idx], [field]: value }
      return { ...prev, services }
    })
  }

  const removeService = (idx: number) => {
    setData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx),
    }))
  }

  const toggleArrayItem = (field: keyof OnboardingData, value: string) => {
    setData(prev => {
      const arr = prev[field] as string[]
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) }
      }
      return { ...prev, [field]: [...arr, value] }
    })
  }

  const renderStep = () => {
    switch (step) {
      case 0: return renderBasicInfo()
      case 1: return renderBranding()
      case 2: return renderCategories()
      case 3: return renderDetails()
      case 4: return renderHours()
      case 5: return renderPolicies()
      case 6: return renderServices()
      case 7: return renderReview()
      default: return null
    }
  }

  function renderBasicInfo() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Tell us about your salon</CardTitle>
          <CardDescription>This is the core information customers will see first</CardDescription>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Salon Name *</label>
            <Input
              placeholder="e.g. Glamour & Grace Salon"
              value={data.name}
              onChange={e => updateField("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={data.city}
              onChange={e => updateField("city", e.target.value)}
            >
              {MUMBAI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Area</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={data.area}
              onChange={e => updateField("area", e.target.value)}
            >
              {MUMBAI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Full Address *</label>
            <Input
              placeholder="e.g. Shop 4, Linking Road, Bandra West"
              value={data.address}
              onChange={e => updateField("address", e.target.value)}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pincode</label>
            <Input
              placeholder="400050"
              value={data.pincode}
              onChange={e => updateField("pincode", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Staff Count</label>
            <Input
              type="number"
              placeholder="5"
              value={data.staff_count}
              onChange={e => updateField("staff_count", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone *</label>
            <Input
              placeholder="+91 98765 43210"
              value={data.phone}
              onChange={e => updateField("phone", e.target.value)}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="hello@salon.com"
              value={data.email}
              onChange={e => updateField("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Latitude</label>
            <Input
              placeholder="19.0596"
              value={data.latitude}
              onChange={e => updateField("latitude", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Longitude</label>
            <Input
              placeholder="72.8295"
              value={data.longitude}
              onChange={e => updateField("longitude", e.target.value)}
            />
          </div>
        </div>
      </div>
    )
  }

  function renderBranding() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Brand your salon</CardTitle>
          <CardDescription>Make a great first impression with stunning visuals</CardDescription>
        </div>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <Input
              placeholder="e.g. Where beauty meets elegance"
              value={data.tagline}
              onChange={e => updateField("tagline", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image URL</label>
            <Input
              placeholder="https://images.unsplash.com/photo-..."
              value={data.cover_image}
              onChange={e => updateField("cover_image", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Gallery Image URLs (one per line)</label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[100px]"
              placeholder="https://images.unsplash.com/photo-...&#10;https://images.unsplash.com/photo-..."
              value={data.gallery.join('\n')}
              onChange={e => updateField("gallery", e.target.value.split('\n').filter(Boolean))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[120px]"
              placeholder="Describe your salon, its ambiance, specialties, and what makes it unique..."
              value={data.description}
              onChange={e => updateField("description", e.target.value)}
            />
          </div>
        </div>
      </div>
    )
  }

  function renderCategories() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">What services do you offer?</CardTitle>
          <CardDescription>Select all categories that apply to your salon</CardDescription>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SERVICE_CATEGORIES.map(cat => {
            const selected = data.categories_offered.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleArrayItem("categories_offered", cat)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? "border-pink-500 bg-pink-50 shadow-md"
                    : "border-gray-200 hover:border-pink-300 hover:bg-pink-50/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selected && <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />}
                  <span className={`text-sm font-medium ${selected ? "text-pink-700" : "text-gray-700"}`}>{cat}</span>
                </div>
              </button>
            )
          })}
        </div>
        <Separator />
        <div className="space-y-4">
          <label className="text-sm font-medium">Gender Served</label>
          <div className="flex gap-3">
            {[
              { value: "women", label: "Women", icon: "♀" },
              { value: "men", label: "Men", icon: "♂" },
              { value: "unisex", label: "Unisex", icon: "⚤" },
            ].map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => updateField("gender", g.value)}
                className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                  data.gender === g.value
                    ? "border-pink-500 bg-pink-50 shadow-md"
                    : "border-gray-200 hover:border-pink-300"
                }`}
              >
                <span className="text-sm font-medium">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-sm font-medium">Luxury Level</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LUXURY_LEVELS.map(lvl => (
              <button
                key={lvl.value}
                type="button"
                onClick={() => updateField("luxury_level", lvl.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  data.luxury_level === lvl.value
                    ? "border-pink-500 bg-pink-50 shadow-md"
                    : "border-gray-200 hover:border-pink-300"
                }`}
              >
                <div className="font-medium text-sm">{lvl.label}</div>
                <div className="text-xs text-gray-500 mt-1">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderDetails() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Additional details</CardTitle>
          <CardDescription>Help customers know what to expect</CardDescription>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-sm">Home Service</div>
                <div className="text-xs text-gray-500">Offer services at customer's home</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateField("offers_home_service", !data.offers_home_service)}
              className={`w-12 h-6 rounded-full transition-colors ${
                data.offers_home_service ? "bg-pink-500" : "bg-gray-300"
              } relative`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                data.offers_home_service ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>
          {data.offers_home_service && (
            <div className="space-y-2 ml-8">
              <label className="text-sm font-medium">Home Service Radius (km)</label>
              <Input
                type="number"
                value={data.home_service_radius_km}
                onChange={e => updateField("home_service_radius_km", e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_OPTIONS.map(amenity => (
              <Badge
                key={amenity}
                variant={data.amenities.includes(amenity) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayItem("amenities", amenity)}
              >
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderHours() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Working hours</CardTitle>
          <CardDescription>Set your operating hours for each day of the week</CardDescription>
        </div>
        <div className="space-y-3">
          {DAYS.map(day => {
            const wh = data.working_hours[day]
            return (
              <div key={day} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
                <div className="w-28 font-medium text-sm">{DAY_LABELS[day]}</div>
                <button
                  type="button"
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      working_hours: {
                        ...prev.working_hours,
                        [day]: { ...prev.working_hours[day], is_closed: !prev.working_hours[day].is_closed },
                      },
                    }))
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    wh.is_closed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {wh.is_closed ? "Closed" : "Open"}
                </button>
                {!wh.is_closed && (
                  <>
                    <input
                      type="time"
                      value={wh.open}
                      onChange={e => {
                        setData(prev => ({
                          ...prev,
                          working_hours: {
                            ...prev.working_hours,
                            [day]: { ...prev.working_hours[day], open: e.target.value },
                          },
                        }))
                      }}
                      className="border rounded-lg px-3 py-1.5 text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={wh.close}
                      onChange={e => {
                        setData(prev => ({
                          ...prev,
                          working_hours: {
                            ...prev.working_hours,
                            [day]: { ...prev.working_hours[day], close: e.target.value },
                          },
                        }))
                      }}
                      className="border rounded-lg px-3 py-1.5 text-sm"
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderPolicies() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Policies & safety</CardTitle>
          <CardDescription>Set your salon's policies and safety practices</CardDescription>
        </div>
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Modes Accepted</label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_MODE_OPTIONS.map(mode => (
                <Badge
                  key={mode}
                  variant={data.payment_modes.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("payment_modes", mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Safety & Hygiene Practices</label>
            <div className="flex flex-wrap gap-2">
              {HYGIENE_OPTIONS.map(h => (
                <Badge
                  key={h}
                  variant={data.hygiene_practices.includes(h) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("hygiene_practices", h)}
                >
                  {h}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Weekly Off Days</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map(d => (
                <Badge
                  key={d}
                  variant={data.weekly_off.includes(d) ? "destructive" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("weekly_off", d)}
                >
                  {DAY_LABELS[d]}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cancellation Policy</label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[80px]"
              value={data.cancellation_policy}
              onChange={e => updateField("cancellation_policy", e.target.value)}
            />
          </div>
        </div>
      </div>
    )
  }

  function renderServices() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-1">Add your services</CardTitle>
            <CardDescription>List the services you offer with pricing</CardDescription>
          </div>
          <Button onClick={addService} size="sm" className="gap-2">
            <PackageOpen className="w-4 h-4" /> Add Service
          </Button>
        </div>
        {data.services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No services added yet. Click "Add Service" to start building your menu.</p>
            <p className="text-sm mt-2">You can always add more later from your dashboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.services.map((svc, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">Service #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeService(idx)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Name</label>
                      <Input
                        placeholder="Classic Haircut"
                        value={svc.name}
                        onChange={e => updateService(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Category</label>
                      <select
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={svc.category}
                        onChange={e => updateService(idx, "category", e.target.value)}
                      >
                        {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Price (₹)</label>
                      <Input
                        type="number"
                        placeholder="800"
                        value={svc.price}
                        onChange={e => updateService(idx, "price", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Duration (min)</label>
                      <Input
                        type="number"
                        placeholder="45"
                        value={svc.duration_minutes}
                        onChange={e => updateService(idx, "duration_minutes", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Discount %</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={svc.discount_percent}
                        onChange={e => updateService(idx, "discount_percent", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Gender</label>
                      <select
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={svc.gender}
                        onChange={e => updateService(idx, "gender", e.target.value)}
                      >
                        <option value="unisex">Unisex</option>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-medium">Description</label>
                      <Input
                        placeholder="Brief description of this service"
                        value={svc.description}
                        onChange={e => updateService(idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderReview() {
    const totalOriginal = data.services.reduce((sum, s) => sum + (parseInt(s.price) || 0), 0)
    const totalDiscounted = data.services.reduce((sum, s) => {
      const p = parseInt(s.price) || 0
      const d = parseInt(s.discount_percent) || 0
      return sum + Math.round(p - (p * d / 100))
    }, 0)

    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Review & submit</CardTitle>
          <CardDescription>Verify all information before submitting</CardDescription>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Store className="w-4 h-4" /> Salon Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{data.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Area</span><span>{data.area}, {data.city}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{data.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="capitalize">{data.gender}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Luxury</span><span className="capitalize">{data.luxury_level}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Home Service</span><span>{data.offers_home_service ? `Yes (${data.home_service_radius_km}km)` : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Staff</span><span>{data.staff_count}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Scissors className="w-4 h-4" /> Services Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total Services</span><span className="font-medium">{data.services.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Original Price</span><span>₹{totalOriginal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total After Discount</span><span className="text-green-600 font-medium">₹{totalDiscounted.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Categories</span><span>{data.categories_offered.length}</span></div>
              <Separator />
              <div className="text-xs text-gray-500 mt-2">
                <p>Offers home service: {data.offers_home_service ? 'Yes' : 'No'}</p>
                <p>Weekly off: {data.weekly_off.map(d => DAY_LABELS[d]).join(', ') || 'None'}</p>
                <p>Amenities: {data.amenities.length} selected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</span>
          <span className="text-sm font-medium text-pink-600">{Math.round(((step + 1) / STEPS.length) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="hidden md:flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isComplete = i < step
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => { if (i < step) setStep(i) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-pink-100 text-pink-700 ring-2 ring-pink-300"
                  : isComplete
                    ? "bg-green-50 text-green-700 cursor-pointer"
                    : "bg-gray-50 text-gray-400"
              }`}
            >
              {isComplete ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6 md:p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} className="gap-2 bg-pink-600 hover:bg-pink-700">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save & Launch Salon"}
          </Button>
        )}
      </div>
    </div>
  )
}
