"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, Check, Store, ListChecks,
  Clock, Shield, Building2, Home, Scissors, Camera, PackageOpen,
  CheckCircle2, Save, Loader2, FileText, Upload, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { createSalon, createService } from "@/lib/data-service"
import { MUMBAI_AREAS, MUMBAI_CITIES, SERVICE_CATEGORIES, AMENITIES_OPTIONS } from "@/lib/utils"
import type { Gender, LuxuryLevel } from "@/types"

type ServiceDraft = {
  name: string
  category: string
  description: string
  price: string
  duration_minutes: string
  buffer_before_minutes: string
  buffer_after_minutes: string
  required_staff_count: string
  required_resource_type: string
  instant_booking_allowed: boolean
  group_booking_allowed: boolean
  confirmation_required: boolean
  discount_percent: string
  gender: Gender
}

type VerificationDocumentKey =
  | "owner_id_proof"
  | "address_proof"
  | "shops_certificate"
  | "trade_health_license"
  | "gst_certificate"

type BusinessType =
  | "Proprietorship"
  | "Partnership"
  | "LLP"
  | "Private Limited"
  | "Individual Professional"

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
  gender: Gender
  luxury_level: LuxuryLevel
  offers_home_service: boolean
  home_service_radius_km: string
  working_hours: Record<string, { open: string; close: string; is_closed: boolean }>
  weekly_off: string[]
  staff_count: string
  payment_modes: string[]
  cancellation_policy: string
  hygiene_practices: string[]
  amenities: string[]
  services: ServiceDraft[]
  legal_business_name: string
  business_type: BusinessType
  representative_name: string
  pan_number: string
  government_id_type: string
  government_id_number: string
  address_proof_type: string
  shops_establishment_number: string
  bmc_license_number: string
  gstin: string
  verification_documents: Record<VerificationDocumentKey, string>
  hygiene_safety_declaration: boolean
  authenticity_declaration: boolean
  verification_policy_accepted: boolean
}

type OnboardingArrayField = {
  [K in keyof OnboardingData]: OnboardingData[K] extends string[] ? K : never
}[keyof OnboardingData]

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
  legal_business_name: "",
  business_type: "Proprietorship",
  representative_name: "",
  pan_number: "",
  government_id_type: "",
  government_id_number: "",
  address_proof_type: "",
  shops_establishment_number: "",
  bmc_license_number: "",
  gstin: "",
  verification_documents: {
    owner_id_proof: "",
    address_proof: "",
    shops_certificate: "",
    trade_health_license: "",
    gst_certificate: "",
  },
  hygiene_safety_declaration: false,
  authenticity_declaration: false,
  verification_policy_accepted: false,
}

const STEPS = [
  { id: "basic", label: "Basic Info", icon: Building2 },
  { id: "branding", label: "Branding", icon: Camera },
  { id: "categories", label: "Services", icon: Scissors },
  { id: "details", label: "Details", icon: ListChecks },
  { id: "hours", label: "Hours", icon: Clock },
  { id: "policies", label: "Policies", icon: Shield },
  { id: "services", label: "Add Services", icon: PackageOpen },
  { id: "verification", label: "Verification", icon: FileText },
  { id: "review", label: "Review", icon: CheckCircle2 },
]

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
}

const LUXURY_LEVELS: { value: LuxuryLevel; label: string; desc: string }[] = [
  { value: "budget", label: "Budget-Friendly", desc: "Affordable services for everyday needs" },
  { value: "mid", label: "Mid-Range", desc: "Quality services at reasonable prices" },
  { value: "premium", label: "Premium", desc: "High-end experience with premium products" },
  { value: "luxury", label: "Luxury", desc: "Exclusive luxury experience" },
]

const PAYMENT_MODE_OPTIONS = ["Cash", "Card", "UPI", "Net Banking", "Wallet", "Pay Later"]
const HYGIENE_OPTIONS = ["Sanitized Tools", "Disposable Gloves", "Mask Required", "Temperature Check", "Contactless Payment", "Regular Disinfection", "Hand Sanitizer"]
const WEEKDAY_OPTIONS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const BUSINESS_TYPES: BusinessType[] = ["Proprietorship", "Partnership", "LLP", "Private Limited", "Individual Professional"]
const ADDRESS_PROOF_TYPES = ["Electricity bill", "Rent agreement", "Property tax receipt", "Shop agreement"]
const GOVERNMENT_ID_TYPES = ["Aadhaar", "PAN", "Passport", "Voter ID"]
const RESOURCE_TYPES = [
  "General chair",
  "Haircut chair",
  "Facial room",
  "Bridal station",
  "Manicure table",
  "Massage room",
]
const VERIFICATION_DOCUMENTS: { key: VerificationDocumentKey; label: string; required: boolean }[] = [
  { key: "owner_id_proof", label: "Owner ID proof", required: true },
  { key: "address_proof", label: "Address proof", required: true },
  { key: "shops_certificate", label: "Shops & Establishments certificate/intimation", required: true },
  { key: "trade_health_license", label: "Trade/Health license if applicable", required: false },
  { key: "gst_certificate", label: "GST certificate if applicable", required: false },
]
const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: "women", label: "Women", icon: "♀" },
  { value: "men", label: "Men", icon: "♂" },
  { value: "unisex", label: "Unisex", icon: "⚤" },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

function decimalInput(value: string) {
  return value.replace(/[^\d.-]/g, "").replace(/(?!^)-/g, "").replace(/(\..*)\./g, "$1")
}

function normalizeIndianMobile(value: string) {
  const digits = digitsOnly(value)
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1)
  return digits
}

function isValidUrl(value: string) {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function isIntegerInRange(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value)) return false
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
}

function isCoordinateInRange(value: string, min: number, max: number) {
  if (!value.trim()) return true
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
}

function maskIdentifier(value: string) {
  const trimmed = value.trim()
  if (trimmed.length <= 4) return trimmed ? "****" : "-"
  return `${"*".repeat(Math.max(trimmed.length - 4, 4))}${trimmed.slice(-4)}`
}

export function OnboardingWizard() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submittedSalonId, setSubmittedSalonId] = useState("")
  const [submittedSalonName, setSubmittedSalonName] = useState("")

  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validateStepAt = (stepIndex: number): Record<string, string> => {
    const newErrors: Record<string, string> = {}
    const stepId = STEPS[stepIndex]?.id

    switch (stepId) {
      case "basic":
        if (data.name.trim().length < 3) newErrors.name = "Salon name must be at least 3 characters"
        if (!data.city.trim()) newErrors.city = "City is required"
        if (!data.area.trim()) newErrors.area = "Area is required"
        if (data.address.trim().length < 8) newErrors.address = "Enter a complete address"
        if (!/^\d{6}$/.test(data.pincode)) newErrors.pincode = "Pincode must be exactly 6 digits"
        if (!/^[6-9]\d{9}$/.test(normalizeIndianMobile(data.phone))) {
          newErrors.phone = "Enter a valid 10-digit Indian mobile number"
        }
        if (!EMAIL_RE.test(data.email.trim())) newErrors.email = "Enter a valid email address"
        if (!isIntegerInRange(data.staff_count, 1, 500)) newErrors.staff_count = "Staff count must be 1 to 500"
        if (!isCoordinateInRange(data.latitude, -90, 90)) newErrors.latitude = "Latitude must be between -90 and 90"
        if (!isCoordinateInRange(data.longitude, -180, 180)) newErrors.longitude = "Longitude must be between -180 and 180"
        break
      case "branding":
        if (data.cover_image && !isValidUrl(data.cover_image)) newErrors.cover_image = "Enter a valid image URL"
        data.gallery.forEach((url, idx) => {
          if (url && !isValidUrl(url)) newErrors[`gallery-${idx}`] = "Gallery URLs must start with http:// or https://"
        })
        break
      case "categories":
        if (data.categories_offered.length === 0) newErrors.categories_offered = "Select at least one service category"
        break
      case "services":
        if (data.services.length === 0) {
          newErrors.services = "Add at least one service before submission"
          break
        }
        data.services.forEach((svc, idx) => {
          if (svc.name.trim().length < 3) newErrors[`service-${idx}-name`] = "Service name must be at least 3 characters"
          if (!isIntegerInRange(svc.price, 1, 1000000)) newErrors[`service-${idx}-price`] = "Enter a valid price"
          if (!isIntegerInRange(svc.duration_minutes, 5, 720)) newErrors[`service-${idx}-duration`] = "Duration must be 5 to 720 minutes"
          if (!isIntegerInRange(svc.buffer_before_minutes || "0", 0, 180)) {
            newErrors[`service-${idx}-buffer-before`] = "Prep buffer must be 0 to 180 minutes"
          }
          if (!isIntegerInRange(svc.buffer_after_minutes || "0", 0, 180)) {
            newErrors[`service-${idx}-buffer-after`] = "Cleanup buffer must be 0 to 180 minutes"
          }
          if (!isIntegerInRange(svc.required_staff_count || "1", 1, 20)) {
            newErrors[`service-${idx}-staff`] = "Required staff must be 1 to 20"
          }
          if (!isIntegerInRange(svc.discount_percent || "0", 0, 100)) newErrors[`service-${idx}-discount`] = "Discount must be 0 to 100"
        })
        break
      case "verification":
        if (data.legal_business_name.trim().length < 3) newErrors.legal_business_name = "Legal business name is required"
        if (data.representative_name.trim().length < 3) newErrors.representative_name = "Authorized representative name is required"
        if (!PAN_RE.test(data.pan_number.trim().toUpperCase())) newErrors.pan_number = "Enter a valid PAN format, e.g. ABCDE1234F"
        if (!data.government_id_type) newErrors.government_id_type = "Select a government ID type"
        if (data.government_id_number.trim().length < 4) newErrors.government_id_number = "Enter the ID reference number"
        if (!data.address_proof_type) newErrors.address_proof_type = "Select an address proof type"
        if (data.shops_establishment_number.trim().length < 4) {
          newErrors.shops_establishment_number = "Registration or intimation number is required"
        }
        if (data.gstin.trim() && !GSTIN_RE.test(data.gstin.trim().toUpperCase())) {
          newErrors.gstin = "Enter a valid GSTIN or leave blank if not applicable"
        }
        VERIFICATION_DOCUMENTS.forEach((doc) => {
          const requiredBecauseConditional =
            (doc.key === "trade_health_license" && data.bmc_license_number.trim()) ||
            (doc.key === "gst_certificate" && data.gstin.trim())
          if ((doc.required || requiredBecauseConditional) && !data.verification_documents[doc.key]) {
            newErrors[`document-${doc.key}`] = `${doc.label} is required`
          }
        })
        if (!data.hygiene_safety_declaration) newErrors.hygiene_safety_declaration = "Safety and hygiene declaration is required"
        if (!data.authenticity_declaration) newErrors.authenticity_declaration = "Document authenticity declaration is required"
        if (!data.verification_policy_accepted) newErrors.verification_policy_accepted = "Accept the listing and verification policy"
        break
      case "review":
        for (let i = 0; i < STEPS.length - 1; i += 1) {
          Object.assign(newErrors, validateStepAt(i))
        }
        break
    }

    return newErrors
  }

  const validateStep = (): boolean => {
    const newErrors = validateStepAt(step)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    let firstInvalidStep = -1
    for (let i = 0; i < STEPS.length - 1; i += 1) {
      const stepErrors = validateStepAt(i)
      if (Object.keys(stepErrors).length > 0 && firstInvalidStep === -1) firstInvalidStep = i
      Object.assign(newErrors, stepErrors)
    }
    setErrors(newErrors)
    if (firstInvalidStep !== -1) setStep(firstInvalidStep)
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
    if (!validateAll()) return
    setSaving(true)
    try {
      const salon = createSalon({
        owner_id: user.id,
        name: data.name,
        area: data.area,
        city: data.city,
        pincode: data.pincode,
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
            buffer_before_minutes: parseInt(svc.buffer_before_minutes) || 0,
            buffer_after_minutes: parseInt(svc.buffer_after_minutes) || 0,
            required_staff_count: parseInt(svc.required_staff_count) || 1,
            required_resource_type: svc.required_resource_type || "General chair",
            instant_booking_allowed: svc.instant_booking_allowed,
            group_booking_allowed: svc.group_booking_allowed,
            confirmation_required: svc.confirmation_required,
            discount_percent: parseInt(svc.discount_percent) || 0,
            description: svc.description,
            gender: svc.gender,
            is_home_service: data.offers_home_service,
            is_popular: false,
            active: true,
          })
        }
      }

      setSubmittedSalonId(salon.id)
      setSubmittedSalonName(salon.name)
    } catch (err) {
      console.error("Onboarding save error:", err)
      setErrors({ submit: "Could not submit the salon. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  const addService = () => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: "", category: SERVICE_CATEGORIES[0], description: "",
        price: "", duration_minutes: "30", buffer_before_minutes: "0", buffer_after_minutes: "10",
        required_staff_count: "1", required_resource_type: "General chair",
        instant_booking_allowed: true, group_booking_allowed: true, confirmation_required: false,
        discount_percent: "0", gender: "unisex",
      }],
    }))
  }

  const updateService = <K extends keyof ServiceDraft>(idx: number, field: K, value: ServiceDraft[K]) => {
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

  const updateDocument = (field: VerificationDocumentKey, fileName: string) => {
    setData(prev => ({
      ...prev,
      verification_documents: {
        ...prev.verification_documents,
        [field]: fileName,
      },
    }))
    setErrors(prev => ({ ...prev, [`document-${field}`]: "" }))
  }

  const toggleArrayItem = (field: OnboardingArrayField, value: string) => {
    setData(prev => {
      const arr = prev[field] as string[]
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) }
      }
      return { ...prev, [field]: [...arr, value] }
    })
  }

  const renderStep = () => {
    switch (STEPS[step]?.id) {
      case "basic": return renderBasicInfo()
      case "branding": return renderBranding()
      case "categories": return renderCategories()
      case "details": return renderDetails()
      case "hours": return renderHours()
      case "policies": return renderPolicies()
      case "services": return renderServices()
      case "verification": return renderVerification()
      case "review": return renderReview()
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
            <label className="text-sm font-medium">Pincode *</label>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="400050"
              value={data.pincode}
              onChange={e => updateField("pincode", digitsOnly(e.target.value).slice(0, 6))}
            />
            {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Staff Count *</label>
            <Input
              inputMode="numeric"
              placeholder="5"
              value={data.staff_count}
              onChange={e => updateField("staff_count", digitsOnly(e.target.value).slice(0, 3))}
            />
            {errors.staff_count && <p className="text-sm text-red-500">{errors.staff_count}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone *</label>
            <Input
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={data.phone}
              onChange={e => updateField("phone", e.target.value.replace(/[^\d+\s-]/g, ""))}
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
              inputMode="decimal"
              placeholder="19.0596"
              value={data.latitude}
              onChange={e => updateField("latitude", decimalInput(e.target.value))}
            />
            {errors.latitude && <p className="text-sm text-red-500">{errors.latitude}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Longitude</label>
            <Input
              inputMode="decimal"
              placeholder="72.8295"
              value={data.longitude}
              onChange={e => updateField("longitude", decimalInput(e.target.value))}
            />
            {errors.longitude && <p className="text-sm text-red-500">{errors.longitude}</p>}
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
            {errors.cover_image && <p className="text-sm text-red-500">{errors.cover_image}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Gallery Image URLs (one per line)</label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background min-h-[100px]"
              placeholder="https://images.unsplash.com/photo-...&#10;https://images.unsplash.com/photo-..."
              value={data.gallery.join('\n')}
              onChange={e => updateField("gallery", e.target.value.split('\n').filter(Boolean))}
            />
            {Object.entries(errors).some(([key]) => key.startsWith("gallery-")) && (
              <p className="text-sm text-red-500">Every gallery URL must be valid and start with http:// or https://</p>
            )}
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
        {errors.categories_offered && <p className="text-sm text-red-500">{errors.categories_offered}</p>}
        <Separator />
        <div className="space-y-4">
          <label className="text-sm font-medium">Gender Served</label>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map(g => (
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
                <div className="text-xs text-gray-500">Offer services at customer&apos;s home</div>
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
                inputMode="numeric"
                value={data.home_service_radius_km}
                onChange={e => updateField("home_service_radius_km", digitsOnly(e.target.value).slice(0, 3))}
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
          <CardDescription>Set your salon&apos;s policies and safety practices</CardDescription>
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
            <CardDescription>
              List services with pricing, duration, buffers, and capacity rules.
            </CardDescription>
          </div>
          <Button onClick={addService} size="sm" className="gap-2">
            <PackageOpen className="w-4 h-4" /> Add Service
          </Button>
        </div>
        {data.services.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No services added yet. Click &ldquo;Add Service&rdquo; to start building your menu.</p>
            <p className="text-sm mt-2">At least one service is required before verification submission.</p>
            {errors.services && <p className="text-sm text-red-500 mt-3">{errors.services}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
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
                      {errors[`service-${idx}-name`] && <p className="text-xs text-red-500">{errors[`service-${idx}-name`]}</p>}
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
                        inputMode="numeric"
                        placeholder="800"
                        value={svc.price}
                        onChange={e => updateService(idx, "price", digitsOnly(e.target.value))}
                      />
                      {errors[`service-${idx}-price`] && <p className="text-xs text-red-500">{errors[`service-${idx}-price`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Duration (min)</label>
                      <Input
                        inputMode="numeric"
                        placeholder="45"
                        value={svc.duration_minutes}
                        onChange={e => updateService(idx, "duration_minutes", digitsOnly(e.target.value))}
                      />
                      {errors[`service-${idx}-duration`] && <p className="text-xs text-red-500">{errors[`service-${idx}-duration`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Prep Buffer</label>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={svc.buffer_before_minutes}
                        onChange={e => updateService(idx, "buffer_before_minutes", digitsOnly(e.target.value))}
                      />
                      {errors[`service-${idx}-buffer-before`] && <p className="text-xs text-red-500">{errors[`service-${idx}-buffer-before`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Cleanup Buffer</label>
                      <Input
                        inputMode="numeric"
                        placeholder="10"
                        value={svc.buffer_after_minutes}
                        onChange={e => updateService(idx, "buffer_after_minutes", digitsOnly(e.target.value))}
                      />
                      {errors[`service-${idx}-buffer-after`] && <p className="text-xs text-red-500">{errors[`service-${idx}-buffer-after`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Staff Needed</label>
                      <Input
                        inputMode="numeric"
                        placeholder="1"
                        value={svc.required_staff_count}
                        onChange={e => updateService(idx, "required_staff_count", digitsOnly(e.target.value))}
                      />
                      {errors[`service-${idx}-staff`] && <p className="text-xs text-red-500">{errors[`service-${idx}-staff`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Resource</label>
                      <select
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={svc.required_resource_type}
                        onChange={e => updateService(idx, "required_resource_type", e.target.value)}
                      >
                        {RESOURCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Discount %</label>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={svc.discount_percent}
                        onChange={e => updateService(idx, "discount_percent", digitsOnly(e.target.value).slice(0, 3))}
                      />
                      {errors[`service-${idx}-discount`] && <p className="text-xs text-red-500">{errors[`service-${idx}-discount`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Gender</label>
                      <select
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        value={svc.gender}
                        onChange={e => updateService(idx, "gender", e.target.value as Gender)}
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
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                    <p className="text-xs font-semibold text-gray-900">Smart capacity scheduling</p>
                    <p className="mt-1 text-xs text-blue-700">
                      This service will require {Number(svc.duration_minutes || 0) + Number(svc.buffer_before_minutes || 0) + Number(svc.buffer_after_minutes || 0)} continuous minutes before it appears as bookable.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={svc.instant_booking_allowed}
                          onChange={e => updateService(idx, "instant_booking_allowed", e.target.checked)}
                          className="size-4 rounded border-gray-300"
                        />
                        Instant booking
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={svc.group_booking_allowed}
                          onChange={e => updateService(idx, "group_booking_allowed", e.target.checked)}
                          className="size-4 rounded border-gray-300"
                        />
                        Allow group requests
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={svc.confirmation_required}
                          onChange={e => updateService(idx, "confirmation_required", e.target.checked)}
                          className="size-4 rounded border-gray-300"
                        />
                        Salon confirmation first
                      </label>
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

  function renderVerification() {
    return (
      <div className="space-y-6">
        <div>
          <CardTitle className="text-2xl mb-1">Verification & compliance</CardTitle>
          <CardDescription>
            Required before a salon can be approved for a production marketplace listing
          </CardDescription>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">No instant approval</p>
              <p>
                Verification usually takes 3-5 business days after all documents are submitted.
                Complex or incomplete submissions may take 7-10 business days. Government license
                processing is handled outside GlowGo and may take longer.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Legal Business Name *</label>
            <Input
              placeholder="Registered legal name"
              value={data.legal_business_name}
              onChange={e => updateField("legal_business_name", e.target.value)}
            />
            {errors.legal_business_name && <p className="text-sm text-red-500">{errors.legal_business_name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Type *</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={data.business_type}
              onChange={e => updateField("business_type", e.target.value as BusinessType)}
            >
              {BUSINESS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Authorized Representative *</label>
            <Input
              placeholder="Owner or representative full name"
              value={data.representative_name}
              onChange={e => updateField("representative_name", e.target.value)}
            />
            {errors.representative_name && <p className="text-sm text-red-500">{errors.representative_name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Owner/Business PAN *</label>
            <Input
              placeholder="ABCDE1234F"
              value={data.pan_number}
              onChange={e => updateField("pan_number", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
            />
            {errors.pan_number && <p className="text-sm text-red-500">{errors.pan_number}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Government ID Type *</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={data.government_id_type}
              onChange={e => updateField("government_id_type", e.target.value)}
            >
              <option value="">Select ID type</option>
              {GOVERNMENT_ID_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.government_id_type && <p className="text-sm text-red-500">{errors.government_id_type}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Government ID Number *</label>
            <Input
              placeholder="Stored locally in this demo"
              value={data.government_id_number}
              onChange={e => updateField("government_id_number", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24))}
            />
            <p className="text-xs text-gray-500">Masked in review. Production would store this securely.</p>
            {errors.government_id_number && <p className="text-sm text-red-500">{errors.government_id_number}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address Proof Type *</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={data.address_proof_type}
              onChange={e => updateField("address_proof_type", e.target.value)}
            >
              <option value="">Select proof type</option>
              {ADDRESS_PROOF_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.address_proof_type && <p className="text-sm text-red-500">{errors.address_proof_type}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shops & Establishments No. *</label>
            <Input
              placeholder="Registration or intimation number"
              value={data.shops_establishment_number}
              onChange={e => updateField("shops_establishment_number", e.target.value.toUpperCase())}
            />
            {errors.shops_establishment_number && <p className="text-sm text-red-500">{errors.shops_establishment_number}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">BMC Trade/Health License No.</label>
            <Input
              placeholder="Conditional based on services/local rules"
              value={data.bmc_license_number}
              onChange={e => updateField("bmc_license_number", e.target.value.toUpperCase())}
            />
            <p className="text-xs text-gray-500">Requirements depend on activity, services, and local rules.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GSTIN</label>
            <Input
              placeholder="Optional/conditional"
              value={data.gstin}
              onChange={e => updateField("gstin", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15))}
            />
            <p className="text-xs text-gray-500">Required if applicable based on turnover and tax rules.</p>
            {errors.gstin && <p className="text-sm text-red-500">{errors.gstin}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Document placeholders</h3>
            <p className="text-xs text-gray-500">
              Demo uploads capture file names locally only. Files are not uploaded to a server in this hackathon build.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {VERIFICATION_DOCUMENTS.map((doc) => (
              <div key={doc.key} className="rounded-xl border border-gray-200 p-3">
                <label className="text-sm font-medium">
                  {doc.label}{doc.required ? " *" : ""}
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={e => updateDocument(doc.key, e.target.files?.[0]?.name || "")}
                    className="text-xs"
                  />
                  <Upload className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
                {data.verification_documents[doc.key] && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Demo upload captured locally: {data.verification_documents[doc.key]}
                  </p>
                )}
                {errors[`document-${doc.key}`] && (
                  <p className="mt-1 text-xs text-red-500">{errors[`document-${doc.key}`]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          {[
            {
              field: "hygiene_safety_declaration" as const,
              label: "I declare that trained staff, equipment sterilization, hygiene practices, cosmetic/chemical product safety, and customer safety procedures are in place.",
            },
            {
              field: "authenticity_declaration" as const,
              label: "I confirm the documents and details submitted are authentic and match the salon location and business identity.",
            },
            {
              field: "verification_policy_accepted" as const,
              label: "I accept GlowGo's listing, cancellation/refund, customer safety, document authenticity, and data/privacy policies.",
            },
          ].map(item => (
            <label key={item.field} className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data[item.field]}
                onChange={e => updateField(item.field, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
          <div className="text-xs text-gray-500">
            Read the <a className="text-pink-600 hover:underline" href="/verification-policy" target="_blank" rel="noreferrer">verification policy</a>
            {" "}and <a className="text-pink-600 hover:underline" href="/cancellation-policy" target="_blank" rel="noreferrer">cancellation policy</a>.
          </div>
          {errors.hygiene_safety_declaration && <p className="text-sm text-red-500">{errors.hygiene_safety_declaration}</p>}
          {errors.authenticity_declaration && <p className="text-sm text-red-500">{errors.authenticity_declaration}</p>}
          {errors.verification_policy_accepted && <p className="text-sm text-red-500">{errors.verification_policy_accepted}</p>}
        </div>
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
              <div className="flex justify-between"><span className="text-gray-500">Pincode</span><span>{data.pincode || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{data.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="capitalize">{data.gender}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Luxury</span><span className="capitalize">{data.luxury_level}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Home Service</span><span>{data.offers_home_service ? `Yes (${data.home_service_radius_km}km)` : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Staff</span><span>{data.staff_count}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><span className="text-gray-500">Legal Name</span><span className="font-medium text-right">{data.legal_business_name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Business Type</span><span>{data.business_type}</span></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Representative</span><span className="text-right">{data.representative_name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">PAN</span><span>{maskIdentifier(data.pan_number)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Govt ID</span><span>{data.government_id_type ? `${data.government_id_type} ${maskIdentifier(data.government_id_number)}` : '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Address Proof</span><span>{data.address_proof_type || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shop Registration</span><span>{data.shops_establishment_number ? 'Captured' : '-'}</span></div>
              <Separator />
              <div className="text-xs text-amber-700">
                Status after submission: Submitted / Under Review. Approval is not instant.
              </div>
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
        {errors.submit && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.submit}</p>
        )}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          Your salon will be visible to the owner workspace as pending verification. Admin approval is required before
          a production marketplace listing would be treated as verified.
        </div>
      </div>
    )
  }

  if (submittedSalonId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-emerald-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Salon submitted for verification</h1>
            <p className="mt-2 text-sm text-gray-600">
              {submittedSalonName} has been saved as a pending verification listing in this demo workspace.
            </p>
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
              Review usually takes 3-5 business days after all required documents are submitted. Incomplete or mismatched
              details may take 7-10 business days. Government license processing is handled outside GlowGo and may take longer.
            </div>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => router.push("/owner/salons")} className="bg-pink-600 hover:bg-pink-700">
                View Owner Workspace
              </Button>
              <Button variant="outline" onClick={() => router.push(`/owner/salons/${submittedSalonId}/edit`)}>
                Review Draft Details
              </Button>
            </div>
          </CardContent>
        </Card>
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
            {saving ? "Submitting..." : "Submit for Verification"}
          </Button>
        )}
      </div>
    </div>
  )
}
