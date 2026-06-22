'use client'

import Link from 'next/link'
import { Star, MapPin, IndianRupee } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Salon } from '@/types'

interface RecommendationCardProps {
  salon: Salon
  reasoning?: string
  className?: string
}

export function RecommendationCard({
  salon,
  reasoning,
  className,
}: RecommendationCardProps) {
  return (
    <Card
      className={cn(
        'border-glowgo-pink/20 bg-white shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-glowgo-cream">
            {salon.logo_url ? (
              <img
                src={salon.logo_url}
                alt={salon.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-glowgo-pink">
                {salon.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="truncate text-sm font-semibold text-gray-900">
                {salon.name}
              </h4>
              {salon.luxury_level === "luxury" && (
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-glowgo-lavender/20 text-[10px] text-glowgo-lavender px-1.5 py-0"
                >
                  Premium
                </Badge>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {salon.rating_avg.toFixed(1)}
              </span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {salon.area}
              </span>
              <span className="flex items-center gap-0.5">
                <IndianRupee className="h-3 w-3" />
                {salon.price_range}
              </span>
            </div>
            {reasoning && (
              <p className="mt-1 text-[11px] leading-tight text-gray-500">
                {reasoning}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Link href={`/salon/${salon.id}`} className="flex-1">
            <Button
              variant="outline"
              size="xs"
              className="w-full border-glowgo-pink/30 text-glowgo-pink hover:bg-glowgo-pink/10"
            >
              View Salon
            </Button>
          </Link>
          <Link
            href={`/booking/${salon.id}`}
            className="flex-1"
          >
            <Button
              size="xs"
              className="w-full bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
