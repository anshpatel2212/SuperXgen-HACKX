"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home,
  Check,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Calendar,
  Tag,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  ShowerHead,
  User,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SALONS, SERVICES } from "@/data"
import { formatPrice, formatDate, formatTime, getInitials, cn, toDateInputValue, getMumbaiTodayString } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { getLoginHref } from "@/lib/auth-routing"
import { useDemoFavorites } from "@/lib/demo-favorites"
import { useDemoOffers } from "@/lib/demo-offers"
import { createDemoReview } from "@/lib/demo-reviews"
import { useDemoReviews } from "@/lib/use-demo-reviews"
import {
  getServiceAvailabilityMessage,
  getServiceAwareBookableTimes,
  getServiceBufferMinutes,
  getServiceRequiredMinutes,
  useDemoSlots,
} from "@/lib/demo-slots"
import { ReviewForm } from "@/components/salon/review-form"
import { isPublicSalon } from "@/lib/public-salons"
import { TrustPassport, TrustPassportMini } from "@/components/shared/trust-passport"
import { GlowAppShell, GlowBookingBottomSheet, GlowImageFallback } from "@/components/glow-ui"
import { cleanGlowImageUrls } from "@/lib/glow-images"
import type { Service, Review, Offer, Salon } from "@/types"

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Parking: <Car className="w-4 h-4" />,
  AC: <ShowerHead className="w-4 h-4" />,
  Refreshments: <Coffee className="w-4 h-4" />,
  "Valet Parking": <Car className="w-4 h-4" />,
  "Private Rooms": <User className="w-4 h-4" />,
  "Steam Room": <ShowerHead className="w-4 h-4" />,
  Sauna: <Dumbbell className="w-4 h-4" />,
  Cafe: <Coffee className="w-4 h-4" />,
  "TV Lounge": <Star className="w-4 h-4" />,
  "Consultation Room": <User className="w-4 h-4" />,
}

const NEXT_7_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return {
    date: toDateInputValue(d),
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    dateNum: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }),
  }
})

const DEMO_CURRENT_DATE = getMumbaiTodayString()
function getServicePrice(service: Service) {
  return service.final_price || service.discounted_price || service.price
}

function SafeImage({
  src,
  alt,
  className,
}: {
  src?: string
  alt: string
  className?: string
}) {
  return (
    <GlowImageFallback
      src={src}
      alt={alt}
      name={alt}
      className={className}
      sizes="(min-width: 1024px) 960px, 100vw"
    />
  )
}

export default function SalonDetailPage() {
  const params = useParams()
  const id = params.id as string

  const salon = SALONS.find((s) => s.id === id)
  const salonServices = SERVICES.filter((s) => s.salon_id === id && s.active)

  if (!salon) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Salon Not Found</h1>
          <p className="text-gray-500 mb-4">The salon you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/explore">
            <Button>Browse Salons</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!isPublicSalon(salon, salonServices)) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Salon Pending Verification</h1>
          <p className="text-gray-500 mb-4">
            This salon is still being verified or is not publicly available yet. Verified salons remain available in Explore.
          </p>
          <Link href="/explore">
            <Button>Browse Verified Salons</Button>
          </Link>
        </div>
      </div>
    )
  }

  return <SalonDetailContent salon={salon} services={salonServices} />
}

function SalonDetailContent({
  salon,
  services,
}: {
  salon: Salon
  services: Service[]
}) {
  const { offers: salonOffers } = useDemoOffers(salon.id)
  const { reviews: currentReviews } = useDemoReviews({ salonId: salon.id, publicOnly: true })
  const activeSalonOffers = salonOffers.filter(
    (offer) =>
      offer.is_active &&
      offer.valid_from <= DEMO_CURRENT_DATE &&
      offer.valid_till >= DEMO_CURRENT_DATE
  )
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState(NEXT_7_DAYS[0].date)
  const [selectedTime, setSelectedTime] = useState("")
  const [activeTab, setActiveTab] = useState("services")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [reviewSort, setReviewSort] = useState<"date" | "rating">("date")
  const router = useRouter()
  const liveRatingAvg = useMemo(
    () =>
      currentReviews.length > 0
        ? currentReviews.reduce((sum, review) => sum + review.rating, 0) / currentReviews.length
        : salon.rating_avg,
    [currentReviews, salon.rating_avg]
  )

  const allImages = useMemo(() => {
    const list = cleanGlowImageUrls([
      salon.cover_url || salon.cover_image,
      ...(salon.images || []),
      ...(salon.gallery || []),
    ])
    return list
  }, [salon])

  const serviceCategories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category))]
    return ["all", ...cats]
  }, [services])

  const filteredServices = useMemo(() => {
    if (serviceFilter === "all") return services
    return services.filter((s) => s.category === serviceFilter)
  }, [services, serviceFilter])

  const sortedReviews = useMemo(() => {
    const sorted = [...currentReviews]
    if (reviewSort === "date") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
      sorted.sort((a, b) => b.rating - a.rating)
    }
    return sorted
  }, [currentReviews, reviewSort])

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    currentReviews.forEach((r) => {
      const key = Math.floor(r.rating) as keyof typeof dist
      if (dist[key] !== undefined) dist[key]++
    })
    return dist
  }, [currentReviews])

  const handleServiceSelect = (service: Service) => {
    router.push(`/booking/${salon.id}?service=${service.id}`)
  }

  const showSection = (tab: string, sectionId: string) => {
    setActiveTab(tab)
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
  }

  return (
    <GlowAppShell className="pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/explore"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#ead8c5] bg-white/80 px-4 text-sm font-semibold text-[#6f5d56] transition-colors hover:text-[#201717]"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 gap-8 lg:grid-cols-3">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <GallerySection images={allImages} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />

            <SalonInfoSection
              salon={salon}
              ratingAvg={liveRatingAvg}
              reviewCount={currentReviews.length || salon.review_count}
              onShowReviews={() => showSection("reviews", "salon-reviews")}
              onShowLocation={() => showSection("about", "salon-location")}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto bg-gray-100/80 rounded-xl p-1 h-auto scrollbar-none">
                <TabsTrigger value="services" className="shrink-0 flex-1 text-xs sm:text-sm py-2">
                  Services ({services.length})
                </TabsTrigger>
                <TabsTrigger value="trust" className="shrink-0 flex-1 text-xs sm:text-sm py-2">
                  Trust
                </TabsTrigger>
                <TabsTrigger value="about" className="shrink-0 flex-1 text-xs sm:text-sm py-2">
                  About
                </TabsTrigger>
                <TabsTrigger value="reviews" className="shrink-0 flex-1 text-xs sm:text-sm py-2">
                  Reviews ({currentReviews.length})
                </TabsTrigger>
                <TabsTrigger value="offers" className="shrink-0 flex-1 text-xs sm:text-sm py-2">
                  Offers ({activeSalonOffers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="mt-6">
                <ServicesTab
                  services={filteredServices}
                  categories={serviceCategories}
                  serviceFilter={serviceFilter}
                  setServiceFilter={setServiceFilter}
                  onBook={handleServiceSelect}
                  selectedServiceId={selectedService?.id || null}
                />
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <AboutTab salon={salon} />
              </TabsContent>

              <TabsContent value="trust" className="mt-6">
                <TrustPassport salon={salon} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ReviewsTab
                  salonId={salon.id}
                  salonName={salon.name}
                  reviews={sortedReviews}
                  ratingDistribution={ratingDistribution}
                  reviewSort={reviewSort}
                  setReviewSort={setReviewSort}
                  totalReviews={currentReviews.length}
                />
              </TabsContent>

              <TabsContent value="offers" className="mt-6">
                <OffersTab offers={activeSalonOffers} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <BookingPanel
              salon={salon}
              services={services}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />

            <div className="mt-6 hidden lg:block">
              <TrustPassport salon={salon} service={selectedService} compact />
            </div>

            <div className="mt-6">
              <AIRecommendationSection salon={salon} />
            </div>
          </div>
        </div>
      </div>

      <GlowBookingBottomSheet
        label={`Book smart at ${salon.name}`}
        detail="Review services, trust status, and capacity-aware slots."
        actionLabel="Book Smart"
        onAction={() => router.push(`/booking/${salon.id}`)}
      />
    </GlowAppShell>
  )
}

function GallerySection({
  images,
  selectedImage,
  setSelectedImage,
}: {
  images: string[]
  selectedImage: number
  setSelectedImage: (i: number) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const goToImage = (delta: number) => {
    setSelectedImage((selectedImage + delta + images.length) % images.length)
  }

  useEffect(() => {
    if (!dialogOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setSelectedImage((selectedImage - 1 + images.length) % images.length)
      if (event.key === "ArrowRight") setSelectedImage((selectedImage + 1) % images.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dialogOpen, images.length, selectedImage, setSelectedImage])

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-[#ead8c5] bg-[#fff2ea] shadow-[0_24px_80px_rgba(45,29,24,0.10)] sm:aspect-[2/1]">
        <SafeImage
          src={images[selectedImage] || images[0]}
          alt="Salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent" />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="absolute bottom-4 right-3 min-h-11 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-[#201717] shadow-lg backdrop-blur-sm transition-colors hover:bg-white sm:right-4 sm:px-4">
            <span className="sm:hidden">Gallery</span>
            <span className="hidden sm:inline">View Gallery</span>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Salon Gallery</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <SafeImage
                src={images[selectedImage] || images[0]}
                alt="Salon gallery"
                className="w-full h-[70vh] object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToImage(-1)}
                    className="absolute left-4 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                    aria-label="Previous gallery image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToImage(1)}
                    className="absolute right-4 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                    aria-label="Next gallery image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "h-12 w-16 overflow-hidden rounded-xl border-2 transition-all",
                      i === selectedImage ? "border-white opacity-100" : "border-transparent opacity-60 hover:opacity-80"
                    )}
                  >
                    <SafeImage src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(i)}
            className={cn(
              "h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
              i === selectedImage ? "border-[#d7b982] ring-1 ring-[#d7b982]" : "border-[#ead8c5] hover:border-[#d7b982]"
            )}
          >
            <SafeImage src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

function SalonInfoSection({
  salon,
  ratingAvg,
  reviewCount,
  onShowReviews,
  onShowLocation,
}: {
  salon: Salon
  ratingAvg: number
  reviewCount: number
  onShowReviews: () => void
  onShowLocation: () => void
}) {
  const router = useRouter()
  const { user } = useAuth()
  const { favoriteIds, toggleFavorite } = useDemoFavorites(user?.id)
  const [shareStatus, setShareStatus] = useState("")
  const isFavorited = favoriteIds.includes(salon.id)

  const handleFavorite = () => {
    if (!user) {
      router.push(getLoginHref(`/salon/${salon.id}`))
      return
    }
    toggleFavorite(salon.id)
  }

  const handleShare = async () => {
    const shareData = {
      title: salon.name,
      text: `Check out ${salon.name} on GlowGo Mumbai`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShareStatus("Shared")
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url)
        setShareStatus("Link copied")
      } else {
        const input = document.createElement("textarea")
        input.value = shareData.url
        input.style.position = "fixed"
        input.style.opacity = "0"
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        input.remove()
        setShareStatus("Link copied")
      }
    } catch {
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable")
        await navigator.clipboard.writeText(shareData.url)
        setShareStatus("Link copied")
      } catch {
        setShareStatus("Copy unavailable")
      }
    }
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} ${salon.address} ${salon.area} ${salon.city}`)}`

  return (
    <div className="rounded-[1.35rem] border border-[#ead8c5] bg-white/88 p-5 shadow-[0_18px_60px_rgba(45,29,24,0.07)] backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold tracking-tight text-[#201717] sm:text-4xl">{salon.name}</h1>
            {salon.featured && (
              <Badge className="rounded-full border border-[#d8ccff] bg-[#f5f1ff] text-[#6550a8]">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          {salon.tagline && <p className="mt-2 text-base text-[#6f5d56]">{salon.tagline}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFavorite}
            title={user ? "Save this salon in the current demo browser" : "Sign in to save salons"}
            className={cn(
              "flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all",
              isFavorited
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-[#ead8c5] bg-white text-[#6f5d56] hover:border-[#d7b982]"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500")} />
            {isFavorited ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-[#ead8c5] bg-white px-4 text-sm font-semibold text-[#6f5d56] transition-all hover:border-[#d7b982]"
          >
            <Share2 className="w-4 h-4" />
            {shareStatus || "Share"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onShowReviews}
          className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-[#fff8dc] px-3 py-1 transition-colors hover:bg-[#fff3c2]"
          aria-label="Jump to salon reviews"
        >
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-900">{ratingAvg.toFixed(1)}</span>
          <span className="text-gray-400 text-sm">({reviewCount})</span>
        </button>

        <button
          type="button"
          onClick={onShowLocation}
          className="flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm text-[#6f5d56] transition-colors hover:bg-[#fffdf9] hover:text-[#201717]"
          aria-label="Jump to salon location"
        >
          <MapPin className="w-4 h-4 text-glowgo-pink" />
          {salon.area}, {salon.city}
        </button>

        <div className="flex min-h-10 items-center gap-1 rounded-full bg-[#fffdf9] px-3 text-sm text-[#6f5d56]">
          <Clock className="w-4 h-4 text-[#8f6b25]" />
          {salon.working_hours_json?.monday?.open && salon.working_hours_json?.monday?.close ? (
            <>{formatTime(salon.working_hours_json.monday.open)} - {formatTime(salon.working_hours_json.monday.close)}</>
          ) : (
            <span>09:00 AM - 09:00 PM</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <Badge
          className={cn(
            "border-0",
            salon.gender === "women" && "bg-pink-100 text-pink-700",
            salon.gender === "men" && "bg-blue-100 text-blue-700",
            salon.gender === "unisex" && "bg-purple-100 text-purple-700"
          )}
        >
          {salon.gender === "unisex" ? "Unisex" : salon.gender === "women" ? "Women" : "Men"}
        </Badge>
        {salon.luxury_level === "luxury" && (
          <Badge className="bg-amber-100 text-amber-700 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Luxury
          </Badge>
        )}
        {salon.offers_home_service && (
          <Badge className="bg-emerald-100 text-emerald-700 border-0">
            <Home className="w-3 h-3 mr-1" />
            Home Service
          </Badge>
        )}
      </div>

      <TrustPassportMini salon={salon} className="mt-4" />

      <div className="mt-5 rounded-2xl border border-[#f0e1ce] bg-[#fffdf9] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#201717]">Contact {salon.name}</p>
            <p className="text-xs text-[#6f5d56]">Use demo contact actions or open the address in Google Maps.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${salon.phone}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ead8c5] bg-white px-4 text-sm font-semibold text-[#4b3a36] transition-all hover:border-[#d7b982]"
            >
              <Phone className="h-4 w-4 text-glowgo-pink" />
              Call
            </a>
            <a
              href={`mailto:${salon.email}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ead8c5] bg-white px-4 text-sm font-semibold text-[#4b3a36] transition-all hover:border-[#d7b982]"
            >
              <Mail className="h-4 w-4 text-glowgo-pink" />
              Email
            </a>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#201717] px-4 text-sm font-semibold text-white transition-all hover:bg-[#352520]"
            >
              <MapPin className="h-4 w-4" />
              Open Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicesTab({
  services,
  categories,
  serviceFilter,
  setServiceFilter,
  onBook,
  selectedServiceId,
}: {
  services: Service[]
  categories: string[]
  serviceFilter: string
  setServiceFilter: (v: string) => void
  onBook: (s: Service) => void
  selectedServiceId: string | null
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setServiceFilter(cat)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
              serviceFilter === cat
                ? "bg-glowgo-pink text-white border-glowgo-pink"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {cat === "all" ? "All Services" : cat}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No services found in this category.</div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className={cn(
                "border transition-all hover:shadow-sm",
                selectedServiceId === service.id && "border-glowgo-pink ring-1 ring-glowgo-pink"
              )}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration_minutes} min
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {service.category}
                      </Badge>
                      {service.is_popular && (
                        <Badge className="bg-orange-50 text-orange-600 border-0 text-[10px]">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-gray-900">{formatPrice(getServicePrice(service))}</div>
                    {getServicePrice(service) < service.price && (
                      <div className="text-sm text-gray-400 line-through">{formatPrice(service.price)}</div>
                    )}
                    <Button
                      size="sm"
                      className="mt-2 h-8 text-xs px-4 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90"
                      onClick={() => onBook(service)}
                    >
                      Book Now
                    </Button>
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

function AboutTab({ salon }: { salon: Salon }) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} ${salon.address} ${salon.area} ${salon.city}`)}`

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-glowgo-pink/5 to-glowgo-lavender/5 border-glowgo-pink/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-glowgo-pink/10 text-glowgo-pink border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Glow AI Says
            </Badge>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">{salon.ai_description}</p>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">About</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{salon.description}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
        <div className="grid grid-cols-2 gap-2">
          {salon.amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50">
              <div className="text-glowgo-pink">{AMENITY_ICONS[amenity] || <Check className="w-4 h-4" />}</div>
              <span className="text-sm text-gray-700">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div id="salon-location" className="scroll-mt-24">
        <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
        <div className="aspect-[16/9] rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-200">
          <div className="max-w-md px-4 text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">{salon.address}</p>
            <p className="mt-1 text-xs text-gray-500">
              Live embedded maps are not connected in this demo.
            </p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-800"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewsTab({
  salonId,
  salonName,
  reviews,
  ratingDistribution,
  reviewSort,
  setReviewSort,
  totalReviews,
}: {
  salonId: string
  salonName: string
  reviews: Review[]
  ratingDistribution: Record<number, number>
  reviewSort: "date" | "rating"
  setReviewSort: (v: "date" | "rating") => void
  totalReviews: number
}) {
  const { user } = useAuth()
  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0)

  const avgRating =
    totalRatings > 0
      ? Object.entries(ratingDistribution).reduce((sum, [rating, count]) => sum + Number(rating) * count, 0) /
        totalRatings
      : 0

  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewMessage, setReviewMessage] = useState("")

  const handleSubmitReview = async (data: { rating: number; title: string; comment: string }) => {
    if (!user) throw new Error("Sign in before submitting a review.")
    const reviewUser: Review["user"] = {
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    }
    createDemoReview({
      user_id: user.id,
      salon_id: salonId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      user: reviewUser,
    })
    setReviewMessage("Review saved in this demo browser and visible to the salon owner/admin.")
    setDialogOpen(false)
  }

  return (
    <div id="salon-reviews" className="space-y-6 scroll-mt-24">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <div className="flex items-center gap-0.5 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] || 0
                const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-xs", reviewSort === "date" && "text-glowgo-pink bg-glowgo-pink/5")}
            onClick={() => setReviewSort("date")}
          >
            Most Recent
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-xs", reviewSort === "rating" && "text-glowgo-pink bg-glowgo-pink/5")}
            onClick={() => setReviewSort("rating")}
          >
            Highest Rated
          </Button>
        </div>
        {user ? (
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (open) setReviewMessage("")
            }}
          >
            <DialogTrigger className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white text-sm font-medium whitespace-nowrap hover:opacity-90 transition-all">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Write a Review
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <ReviewForm
                salonName={salonName}
                onSubmit={handleSubmitReview}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Link
            href={getLoginHref(`/salon/${salonId}`)}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-glowgo-pink/30 px-3 text-sm font-medium text-glowgo-pink"
          >
            Sign in to review
          </Link>
        )}
      </div>

      {reviewMessage && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {reviewMessage}
        </p>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No reviews yet. Be the first!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-gray-100">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={review.user?.avatar_url || ""} />
                    <AvatarFallback>{review.user ? getInitials(review.user.full_name) : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.user?.full_name || "Anonymous"}</p>
                        <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-3.5 h-3.5",
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="text-sm font-medium text-gray-700 mt-2">{review.title}</p>}
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
                    {review.is_verified && (
                      <div className="flex items-center gap-1 mt-2">
                        <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px]">
                          <Shield className="w-3 h-3 mr-0.5" />
                          Verified Booking
                        </Badge>
                      </div>
                    )}
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

function OffersTab({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">No active offers at the moment.</div>
    )
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="border-0 bg-gradient-to-r from-glowgo-pink/5 to-glowgo-lavender/5 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-glowgo-pink to-glowgo-lavender flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge className="bg-white text-gray-900 border border-dashed border-gray-300 text-xs font-mono">
                    {offer.coupon_code}
                  </Badge>
                  {offer.discount_type === "percentage" ? (
                    <span className="text-sm font-semibold text-glowgo-pink">{offer.discount_value}% OFF</span>
                  ) : (
                    <span className="text-sm font-semibold text-glowgo-pink">₹{offer.discount_value} OFF</span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Valid till {formatDate(offer.valid_till)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BookingPanel({
  salon,
  services,
  selectedService,
  setSelectedService,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: {
  salon: Salon
  services: Service[]
  selectedService: Service | null
  setSelectedService: (s: Service | null) => void
  selectedDate: string
  setSelectedDate: (d: string) => void
  selectedTime: string
  setSelectedTime: (t: string) => void
}) {
  const [showAllServices, setShowAllServices] = useState(false)
  const { slots: salonSlots } = useDemoSlots(salon.id)
  const visibleServices = showAllServices ? services : services.slice(0, 6)
  const requiredMinutes = getServiceRequiredMinutes(selectedService)
  const bufferMinutes = getServiceBufferMinutes(selectedService)
  const availableTimes = getServiceAwareBookableTimes(
    salonSlots,
    selectedDate,
    selectedService
  )
  const effectiveSelectedTime = availableTimes.includes(selectedTime)
    ? selectedTime
    : ""
  const bookingHref = selectedService
    ? `/booking/${salon.id}?service=${selectedService.id}&date=${selectedDate}&time=${effectiveSelectedTime}`
    : `/booking/${salon.id}`

  return (
    <>
          <div className="hidden min-w-0 lg:block">
        <Card className="border-gray-100 shadow-lg">
          <CardContent className="p-5 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Select Service</h3>
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {visibleServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setSelectedTime("")
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition-all border",
                      selectedService?.id === service.id
                        ? "border-glowgo-pink bg-glowgo-pink/5 text-glowgo-pink"
                        : "border-gray-100 text-gray-700 hover:border-gray-200"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{service.name}</span>
                      <span className="block truncate text-[11px] text-gray-400">
                        {service.category} · {getServiceRequiredMinutes(service)} min block
                      </span>
                    </span>
                    <span className="font-semibold shrink-0 ml-2">{formatPrice(getServicePrice(service))}</span>
                  </button>
                ))}
                {services.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllServices(true)}
                    className="w-full text-center text-xs text-glowgo-pink py-1"
                  >
                    +{services.length - 6} more services
                  </button>
                )}
              </div>
            </div>

            {selectedService && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-glowgo-pink/5 to-glowgo-lavender/5 border border-glowgo-pink/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Selected Service</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedService.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {requiredMinutes} min continuous block
                      {bufferMinutes > 0 ? ` including ${bufferMinutes} min buffer` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-glowgo-pink">{formatPrice(getServicePrice(selectedService))}</p>
                    {getServicePrice(selectedService) < selectedService.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(selectedService.price)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <TrustPassportMini salon={salon} />

            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Select Date</h3>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {NEXT_7_DAYS.map((d) => (
                  <button
                    key={d.date}
                    disabled={
                      getServiceAwareBookableTimes(
                        salonSlots,
                        d.date,
                        selectedService
                      ).length === 0
                    }
                    onClick={() => {
                      setSelectedDate(d.date)
                      setSelectedTime("")
                    }}
                    className={cn(
                      "shrink-0 flex flex-col items-center w-12 py-2 rounded-xl text-xs font-medium border transition-all",
                      selectedDate === d.date
                        ? "border-glowgo-pink bg-glowgo-pink/10 text-glowgo-pink"
                        : "border-gray-200 text-gray-500 hover:border-gray-300",
                      getServiceAwareBookableTimes(
                        salonSlots,
                        d.date,
                        selectedService
                      ).length === 0 &&
                        "cursor-not-allowed opacity-40"
                    )}
                  >
                    <span>{d.day}</span>
                    <span className="text-sm font-bold mt-0.5">{d.dateNum}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Select Time</h3>
              {selectedService && (
                <p className="mb-2 rounded-lg border border-blue-100 bg-blue-50/70 p-2 text-[11px] text-blue-800">
                  Smart scheduling checks {requiredMinutes} continuous minutes before showing a time.
                </p>
              )}
              {availableTimes.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                  {getServiceAvailabilityMessage(salonSlots, selectedDate, selectedService)}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-1.5 rounded-lg text-xs font-medium border transition-all",
                        effectiveSelectedTime === time
                          ? "border-glowgo-pink bg-glowgo-pink/10 text-glowgo-pink"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedService && effectiveSelectedTime ? (
              <Link href={bookingHref}>
                <Button className="w-full h-11 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 rounded-xl shadow-lg shadow-glowgo-pink/20">
                  <Calendar className="w-4 h-4 mr-2" />
                  Continue to Booking
                </Button>
              </Link>
            ) : (
              <Button className="w-full h-11" disabled>
                Select a service and time
              </Button>
            )}

            <div className="text-xs text-gray-400 text-center">
              {salon.cancellation_policy}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">
              {selectedService ? selectedService.name : "Select a service"}
            </p>
            <p className="text-sm font-bold text-gray-900">
              {selectedService ? formatPrice(getServicePrice(selectedService)) : "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-700">Trust Passport checked</p>
          </div>
          {selectedService && effectiveSelectedTime ? (
            <Link href={bookingHref}>
              <Button className="h-10 px-6 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 rounded-xl shadow-lg">
                Continue
              </Button>
            </Link>
          ) : (
            <Button className="h-10 px-6" disabled>
              Select service
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

function AIRecommendationSection({ salon }: { salon: Salon }) {
  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 overflow-hidden">
      <CardContent className="p-5">
        <Badge className="mb-3 px-2 py-0.5 bg-white/10 text-white border-0 text-[10px]">
          <Sparkles className="w-3 h-3 mr-1" />
          Glow AI Recommends
        </Badge>
        <p className="text-sm text-gray-300 leading-relaxed">{salon.ai_description}</p>
        <Link href="/ai-assistant">
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs"
          >
            Ask Glow AI
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
