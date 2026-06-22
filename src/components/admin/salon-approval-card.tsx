"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { getInitials } from "@/lib/utils"
import { MapPin, Star, Phone, Check, X, Sparkles } from "lucide-react"
import type { Salon } from "@/types"

interface SalonApprovalCardProps {
  salon: Salon
  ownerName?: string
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onFeature?: (id: string) => void
}

export function SalonApprovalCard({
  salon,
  ownerName,
  onApprove,
  onReject,
  onFeature,
}: SalonApprovalCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-glowgo-pink/[0.03] to-glowgo-lavender/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={salon.logo_url} alt={salon.name} />
              <AvatarFallback>{getInitials(salon.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{salon.name}</CardTitle>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {salon.area}, {salon.city}
              </div>
            </div>
          </div>
          <StatusBadge status={salon.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="size-3 text-amber-500" />
            {salon.rating_avg.toFixed(1)} ({salon.review_count} reviews)
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="size-3" />
            {salon.phone}
          </div>
          {ownerName && (
            <div className="col-span-2 text-muted-foreground">
              Owner: {ownerName}
            </div>
          )}
        </div>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {salon.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {salon.amenities.slice(0, 4).map((a) => (
            <Badge key={a} variant="secondary" className="text-[10px]">
              {a}
            </Badge>
          ))}
          {salon.amenities.length > 4 && (
            <Badge variant="secondary" className="text-[10px]">
              +{salon.amenities.length - 4}
            </Badge>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t pt-3">
          {onApprove && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onApprove(salon.id)}
            >
              <Check className="size-3.5" />
              Approve
            </Button>
          )}
          {onReject && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => onReject(salon.id)}
            >
              <X className="size-3.5" />
              Reject
            </Button>
          )}
          {onFeature && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onFeature(salon.id)}
            >
              <Sparkles className="size-3.5" />
              Feature
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
