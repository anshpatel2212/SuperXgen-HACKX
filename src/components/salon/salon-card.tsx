"use client"

import { useState, useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, MapPin, Heart, Sparkles, Home, Clock, ShieldCheck, GitCompareArrows, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatPrice, getInitials } from "@/lib/utils"
import { computeSalonMetrics, computeTrustScoreBadge, computeResponseTimeBadge } from "@/services/calculations"
import { useAuth } from "@/lib/auth-context"
import { getLoginHref } from "@/lib/auth-routing"
import { useDemoFavorites } from "@/lib/demo-favorites"
import { OFFERS, SERVICES } from "@/data"
import { TrustPassportMini } from "@/components/shared/trust-passport"
import type { Salon } from "@/types"

interface SalonCardProps {
  salon: Salon
  variant?: "default" | "compact"
  compareSelected?: boolean
  onCompare?: (salon: Salon) => void
}

export function SalonCard({ salon, variant = "default", compareSelected = false, onCompare }: SalonCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { favoriteIds, toggleFavorite } = useDemoFavorites(user?.id)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )

  const isFavorited = mounted ? favoriteIds.includes(salon.id) : false

  const metrics = useMemo(() => computeSalonMetrics(salon.id, !mounted), [salon.id, mounted])
  const trustScore = metrics.trust_score
  const trustBadge = useMemo(() => computeTrustScoreBadge(trustScore), [trustScore])
  const responseBadge = useMemo(() => computeResponseTimeBadge(metrics.avg_response_time_minutes), [metrics.avg_response_time_minutes])

  const minPrice = metrics.min_price
  const maxPrice = metrics.max_price
  const hasResponseData = Boolean(metrics.avg_response_time_minutes)
  const coverImage = salon.cover_url || salon.cover_image
  const topServices = useMemo(
    () => SERVICES.filter((service) => service.salon_id === salon.id && service.active).slice(0, 3),
    [salon.id]
  )
  const activeOfferCount = useMemo(
    () => OFFERS.filter((offer) => offer.salon_id === salon.id && offer.is_active).length,
    [salon.id]
  )
  const priceLabel =
    minPrice > 0 && maxPrice > 0
      ? minPrice === maxPrice
        ? formatPrice(minPrice)
        : `${formatPrice(minPrice)}-${formatPrice(maxPrice)}`
      : salon.price_range || "Price on request"

  const handleFavorite = () => {
    if (!user) {
      const returnTo = `${window.location.pathname}${window.location.search}`
      router.push(getLoginHref(returnTo))
      return
    }
    toggleFavorite(salon.id)
  }

  return (
    <Card
      className={cn(
        "group/card premium-card flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(17,24,39,0.10)]",
        variant === "compact" && ""
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <SalonCardImageFallback salonName={salon.name} />
        {coverImage && !imgError && (
          <Image
            src={coverImage}
            alt={salon.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-all duration-500 group-hover/card:scale-110",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <button
          onClick={(e) => {
            e.preventDefault()
            handleFavorite()
          }}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn("w-4 h-4 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-gray-600")}
          />
        </button>

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {salon.featured && (
            <Badge className="bg-purple-500/90 text-white border-0 text-[10px] px-1.5 py-0.5">
              <Sparkles className="w-3 h-3 mr-0.5" />
              Featured
            </Badge>
          )}
          {(salon.luxury_level === 'luxury' || salon.luxury_level === 'premium') && (
            <Badge className="bg-amber-500/90 text-white border-0 text-[10px] px-1.5 py-0.5">
              <Sparkles className="w-3 h-3 mr-0.5" />
              {salon.luxury_level === 'luxury' ? 'Luxury' : 'Premium'}
            </Badge>
          )}
          {salon.offers_home_service && (
            <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] px-1.5 py-0.5">
              <Home className="w-3 h-3 mr-0.5" />
              Home Service
            </Badge>
          )}
          <Badge className={`${trustBadge.color} border-0 text-[10px] px-1.5 py-0.5`}>
            <ShieldCheck className="w-3 h-3 mr-0.5" />
            {trustBadge.label}
          </Badge>
          {activeOfferCount > 0 && (
            <Badge className="bg-glowgo-gold/90 text-white border-0 text-[10px] px-1.5 py-0.5">
              <Tag className="w-3 h-3 mr-0.5" />
              Offer
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center">
          <Avatar className="w-8 h-8 ring-2 ring-white shadow-md">
            <AvatarImage src={salon.logo_url} alt={salon.name} />
            <AvatarFallback>{getInitials(salon.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/salon/${salon.id}`}>
              <h3 className="font-semibold text-gray-900 truncate group-hover/card:text-glowgo-pink transition-colors">
                {salon.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 truncate">{salon.area}, {salon.city}</span>
            </div>
          </div>
        </div>

        {salon.tagline ? (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{salon.tagline}</p>
        ) : (
          <p className="text-xs text-gray-400 mt-1.5">Verified Mumbai salon</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-50">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-900">
                {salon.rating_avg > 0 ? salon.rating_avg.toFixed(1) : "New"}
              </span>
            </div>
            <span className="text-xs text-gray-400">({salon.review_count})</span>
          </div>
          <span className="max-w-[52%] truncate text-right text-sm font-semibold text-gray-900">
            {priceLabel}
          </span>
        </div>

        {topServices.length > 0 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {topServices.map((service) => (
              <span key={service.id} className="shrink-0 rounded-full bg-glowgo-soft px-2 py-1 text-[10px] font-medium text-gray-600">
                {service.name}
              </span>
            ))}
          </div>
        )}

        <TrustPassportMini salon={salon} className="mt-3" />

        <div className="mt-auto space-y-3 pt-3">
          <div className="flex items-center justify-between border-t border-glowgo-border/70 pt-3">
            <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0",
                salon.gender === "women" && "bg-pink-50 text-pink-600",
                salon.gender === "men" && "bg-blue-50 text-blue-600",
                salon.gender === "unisex" && "bg-purple-50 text-purple-600"
              )}
            >
              {salon.gender === "unisex" ? "Unisex" : salon.gender === "women" ? "Women" : "Men"}
            </Badge>
            {variant === "default" && hasResponseData && (
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {responseBadge.label}
              </span>
            )}
            </div>
            <span className="text-[10px] font-medium text-emerald-700">
              {salon.verified ? "Bookable" : "Pending"}
            </span>
          </div>

          <div className={cn("grid gap-2", onCompare ? "grid-cols-[1fr_auto]" : "grid-cols-1")}>
            <Link href={`/salon/${salon.id}`}>
              <Button
                size="sm"
                className="h-9 w-full rounded-xl text-xs premium-button"
              >
                View Salon
              </Button>
            </Link>
            {onCompare && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-xl border-glowgo-border px-3 text-xs",
                  compareSelected && "border-glowgo-pink bg-glowgo-soft text-glowgo-pink"
                )}
                onClick={() => onCompare(salon)}
                title="Compare this salon"
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                <span className="sr-only">Compare {salon.name}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SalonCardImageFallback({ salonName }: { salonName: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_28%_18%,#fff1f5,transparent_34%),linear-gradient(135deg,#fff8f5,#f7e8ff_62%,#fdf2f8)] text-gray-800"
      role="img"
      aria-label={`${salonName} image fallback`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-glowgo-pink shadow-sm">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="max-w-32 px-3 text-xs font-semibold uppercase text-gray-500">
          GlowGo salon
        </span>
      </div>
    </div>
  )
}
