"use client"

import { Suspense, useState, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Sparkles, ChevronLeft, ChevronRight, Clock, MapPin,
  CheckCircle2, Home, Tag,
  Star, Shield, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn, formatPrice, formatDate, formatTime } from "@/lib/utils"
import { SALONS, SERVICES } from "@/data"
import { createBooking } from "@/lib/api-client"
import { useDemoOffers } from "@/lib/demo-offers"
import { useAuth } from "@/lib/auth-context"
import type { Offer } from "@/types"

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30",
]

function getNext7Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-glowgo-cream/20" />}>
      <BookingPageContent />
    </Suspense>
  )
}

function BookingPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const salonId = params.id as string
  const { user } = useAuth()
  const { offers: salonOffers } = useDemoOffers(salonId)
  const requestedServiceId = searchParams.get("service")
  const requestedDate = searchParams.get("date")
  const requestedTime = searchParams.get("time")
  const initialServiceId =
    requestedServiceId && SERVICES.some((service) => service.id === requestedServiceId && service.salon_id === salonId)
      ? requestedServiceId
      : null
  const initialDate = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : null
  const initialTime = requestedTime && TIME_SLOTS.includes(requestedTime) ? requestedTime : null

  const [step, setStep] = useState(initialServiceId && initialDate && initialTime ? 3 : initialServiceId ? 2 : 1)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(initialServiceId)
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime)
  const [isHomeService, setIsHomeService] = useState(false)
  const [homeAddress, setHomeAddress] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<Offer | null>(null)
  const [couponError, setCouponError] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const salon = SALONS.find((s) => s.id === salonId)
  const salonServices = SERVICES.filter((s) => s.salon_id === salonId)

  const selectedService = salonServices.find((s) => s.id === selectedServiceId)
  const days = useMemo(() => getNext7Days(), [])

  const totalAmount = selectedService ? (selectedService.final_price || selectedService.price) : 0
  const discountAmount = couponApplied
    ? couponApplied.discount_type === 'percentage'
      ? Math.min(totalAmount * (couponApplied.discount_value / 100), couponApplied.max_discount || totalAmount)
      : Math.min(couponApplied.discount_value, couponApplied.max_discount || couponApplied.discount_value)
    : 0
  const finalAmount = totalAmount - discountAmount

  const handleApplyCoupon = () => {
    setCouponError("")
    const now = Date.now()
    const offer = salonOffers.find(
      (candidate) =>
        candidate.coupon_code.toLowerCase() === couponCode.trim().toLowerCase() &&
        candidate.is_active &&
        new Date(candidate.valid_from).getTime() <= now &&
        new Date(candidate.valid_till).getTime() >= now
    )
    if (offer) {
      if (totalAmount >= offer.min_purchase) {
        setCouponApplied(offer)
      } else {
        setCouponError(`Minimum purchase of ${formatPrice(offer.min_purchase)} required`)
      }
    } else {
      setCouponError("Invalid coupon code")
    }
  }

  const handleConfirm = async () => {
    if (!user) {
      setError("Please sign in before confirming your booking.")
      return
    }
    if (!selectedServiceId || !selectedDate || !selectedTime) {
      setError("Please complete the service, date, and time selections.")
      return
    }
    if (isHomeService && homeAddress.trim().length < 10) {
      setError("Please enter a complete home-service address.")
      setStep(2)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await createBooking({
        user_id: user.id,
        salon_id: salonId,
        service_id: selectedServiceId,
        booking_date: selectedDate,
        booking_time: selectedTime,
        service_mode: isHomeService ? "home" : "salon",
        address_text: isHomeService ? homeAddress.trim() : "",
        notes,
        offer_id: couponApplied?.id || null,
        demo_offer: couponApplied || undefined,
      })
      setIsSubmitting(false)
      setIsSuccess(true)
    } catch (err) {
      setIsSubmitting(false)
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.")
    }
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Salon not found</h2>
          <p className="text-sm text-gray-500 mt-1">The salon you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/explore">
            <Button className="mt-4">Browse Salons</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-glowgo-pink/5 via-glowgo-cream to-glowgo-lavender/5">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-50">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-green-600" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
          <p className="text-gray-500 mb-6">
            {salon.name} has received your appointment request and can now confirm it.
          </p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 text-left space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Salon</span>
              <span className="font-medium text-gray-900">{salon.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{selectedService?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{selectedDate && formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">{selectedTime && formatTime(selectedTime)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Amount Due</span>
              <span className="font-semibold text-gray-900">{formatPrice(finalAmount)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/bookings">
              <Button className="w-full bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm">
                View My Bookings
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="w-full">
                Explore More Salons
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glowgo-pink/5 via-glowgo-cream to-glowgo-lavender/5">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/salon/${salon.id}`}>
            <Button variant="ghost" size="icon-sm">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-sm text-gray-500">{salon.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all",
                  step > s && "bg-green-500 text-white",
                  step === s && "bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white shadow-md",
                  step < s && "bg-gray-100 text-gray-400"
                )}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={cn("w-16 sm:w-24 h-0.5 mx-1", step > s ? "bg-green-500" : "bg-gray-200")} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mb-8 text-xs text-gray-500">
          <span className={cn(step === 1 && "text-glowgo-pink font-medium")}>Select Service</span>
          <span className={cn(step === 2 && "text-glowgo-pink font-medium")}>Date & Time</span>
          <span className={cn(step === 3 && "text-glowgo-pink font-medium")}>Review & Confirm</span>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <img
                src={salon.logo_url}
                alt={salon.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{salon.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {salon.area}, {salon.city}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{salon.rating_avg.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({salon.review_count} reviews)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select a Service</h3>
              <div className="space-y-2">
                {salonServices.map((service) => {
                  const isSelected = selectedServiceId === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all",
                        isSelected
                          ? "border-glowgo-pink bg-glowgo-pink/5 ring-1 ring-glowgo-pink/20"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            {service.is_popular && (
                              <Badge variant="secondary" className="bg-glowgo-pink/10 text-glowgo-pink text-[10px]">
                                <Sparkles className="w-3 h-3 mr-0.5" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-gray-900">
                            {service.discounted_price ? formatPrice(service.discounted_price) : formatPrice(service.price)}
                          </p>
                          {service.discounted_price > 0 && (
                            <p className="text-xs text-gray-400 line-through">{formatPrice(service.price)}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                disabled={!selectedServiceId}
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Date</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((day) => {
                  const dateStr = day.toISOString().split("T")[0]
                  const isToday = new Date().toISOString().split("T")[0] === dateStr
                  const isSelected = selectedDate === dateStr
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all shrink-0 min-w-[72px]",
                        isSelected
                          ? "border-glowgo-pink bg-glowgo-pink/5 ring-1 ring-glowgo-pink/20"
                          : "border-gray-100 bg-white hover:border-gray-200",
                        isToday && "border-glowgo-pink/30"
                      )}
                    >
                      <span className="text-xs text-gray-400">{DAY_NAMES[day.getDay()]}</span>
                      <span className={cn("text-lg font-bold", isSelected ? "text-glowgo-pink" : "text-gray-900")}>
                        {day.getDate()}
                      </span>
                      <span className="text-[10px] text-gray-400">{MONTH_NAMES[day.getMonth()]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Time</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={!selectedDate}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-2 px-2 rounded-lg border text-sm font-medium transition-all",
                        isSelected
                          ? "border-glowgo-pink bg-glowgo-pink/5 text-glowgo-pink ring-1 ring-glowgo-pink/20"
                          : "border-gray-100 bg-white text-gray-700 hover:border-gray-200",
                        !selectedDate && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {formatTime(time)}
                    </button>
                  )
                })}
              </div>
            </div>

            {salon.offers_home_service && (
              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-glowgo-pink" />
                    <span className="text-sm font-medium text-gray-900">Home Service</span>
                  </div>
                  <Switch checked={isHomeService} onCheckedChange={setIsHomeService} />
                </div>
                {isHomeService && (
                  <div className="space-y-1.5">
                    <Label htmlFor="home-address">Service Address</Label>
                    <Textarea
                      id="home-address"
                      placeholder="Enter your full address for home service"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="min-h-[80px]"
                    />
                    {homeAddress.trim().length < 10 && (
                      <p className="text-xs text-amber-600">Enter at least 10 characters so the salon can locate you.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                disabled={!selectedDate || !selectedTime || (isHomeService && homeAddress.trim().length < 10)}
                onClick={() => setStep(3)}
                className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Booking Summary</h3>

                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <img
                    src={salon.logo_url}
                    alt={salon.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{salon.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {salon.area}, {salon.city}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{selectedService?.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{selectedDate && formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{selectedTime && formatTime(selectedTime)}</span>
                  </div>
                  {isHomeService && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Service Type</span>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-xs">
                        <Home className="w-3 h-3 mr-0.5" />
                        Home Service
                      </Badge>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="text-gray-900">{formatPrice(totalAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Discount
                      </span>
                      <span className="text-green-600">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-semibold text-base pt-2 border-t border-gray-50">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coupon">Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value)
                        setCouponError("")
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || !!couponApplied}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Coupon applied! You saved {formatPrice(discountAmount)}
                    </p>
                  )}
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                This sends a pending appointment request to the salon. Payment is not collected in this demo.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <p>{error}</p>
                {!user && (
                  <Link href="/login" className="mt-1 inline-block font-medium underline underline-offset-2">
                    Sign in to continue
                  </Link>
                )}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm min-w-[160px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Booking
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
