"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, MapPin, Heart, Sparkles, Home, Clock, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatPrice, getInitials } from "@/lib/utils"
import { computeSalonMetrics, computeTrustScoreBadge, computeResponseTimeBadge } from "@/services/calculations"
import { useAuth } from "@/lib/auth-context"
import { getLoginHref } from "@/lib/auth-routing"
import { useDemoFavorites } from "@/lib/demo-favorites"
import type { Salon } from "@/types"

interface SalonCardProps {
  salon: Salon
  variant?: "default" | "compact"
}

export function SalonCard({ salon, variant = "default" }: SalonCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { favoriteIds, toggleFavorite } = useDemoFavorites(user?.id)
  const [imgError, setImgError] = useState(false)
  const isFavorited = favoriteIds.includes(salon.id)

  const metrics = useMemo(() => computeSalonMetrics(salon.id), [salon.id])
  const trustScore = metrics.trust_score
  const trustBadge = useMemo(() => computeTrustScoreBadge(trustScore), [trustScore])
  const responseBadge = useMemo(() => computeResponseTimeBadge(metrics.avg_response_time_minutes), [metrics.avg_response_time_minutes])

  const minPrice = metrics.min_price
  const maxPrice = metrics.max_price
  const hasResponseData = Boolean(metrics.avg_response_time_minutes)

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
        "group/card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-gray-100",
        variant === "compact" && ""
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imgError ? "https://picsum.photos/seed/default/400/300" : salon.cover_url}
          alt={salon.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
          onError={() => setImgError(true)}
        />
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
        </div>

        <div className="absolute bottom-3 left-3 flex items-center">
          <Avatar className="w-8 h-8 ring-2 ring-white shadow-md">
            <AvatarImage src={salon.logo_url} alt={salon.name} />
            <AvatarFallback>{getInitials(salon.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="p-4">
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

        {salon.tagline && (
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{salon.tagline}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-50">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-900">{salon.rating_avg.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-400">({salon.review_count})</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {minPrice > 0 ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}` : salon.price_range || 'Price on request'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
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
          <Link href={`/salon/${salon.id}`}>
            <Button
              size="sm"
              className="h-7 text-xs px-3 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm"
            >
              View Salon
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
