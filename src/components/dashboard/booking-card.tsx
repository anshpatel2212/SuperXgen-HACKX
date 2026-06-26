"use client"

import { Calendar, Clock, MapPin, XCircle, Star, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlowImageFallback } from "@/components/glow-ui"
import { cn, formatPrice, formatDate, formatTime, getStatusColor } from "@/lib/utils"
import type { Booking } from "@/types"

interface BookingCardProps {
  booking: Booking
  onCancel?: (id: string) => void
  onReview?: (id: string) => void
  onReschedule?: (id: string) => void
}

export function BookingCard({ booking, onCancel, onReview, onReschedule }: BookingCardProps) {
  const statusColor = getStatusColor(booking.status)

  return (
    <Card className="overflow-hidden rounded-[1.35rem] border-[#ead8c5] bg-white/90 shadow-[0_18px_50px_rgba(45,29,24,0.06)] transition-all duration-300 hover:shadow-[0_24px_70px_rgba(45,29,24,0.10)]">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 border-b border-[#f0e1ce] p-4">
          <GlowImageFallback
            src={booking.salon?.logo_url || booking.salon?.cover_image}
            alt={booking.salon?.name || "Salon"}
            name={booking.salon?.name || "Salon"}
            className="h-11 w-11 rounded-2xl"
            sizes="44px"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold text-[#201717]">{booking.salon?.name}</h4>
            <div className="flex items-center gap-1 text-xs text-[#6f5d56]">
              <MapPin className="w-3 h-3" />
              {booking.salon?.area}, {booking.salon?.city}
            </div>
          </div>
          <Badge className={cn("text-[10px] capitalize", statusColor)}>
            {booking.status}
          </Badge>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6f5d56]">{booking.service?.name}</span>
            <span className="font-semibold text-[#201717]">{formatPrice(booking.total_price)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {formatDate(booking.booking_date)}
            <span className="mx-1">•</span>
            <Clock className="w-3 h-3" />
            {formatTime(booking.booking_time)}
          </div>
          {booking.service_mode === "home" && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <Home className="w-3 h-3" />
              Home Service
            </div>
          )}
          {booking.notes && (
            <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">&ldquo;{booking.notes}&rdquo;</p>
          )}
        </div>

        <div className="flex gap-2 p-4 pt-0">
          {(booking.status === "confirmed" || booking.status === "pending") && onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 rounded-full border-red-200 text-xs text-red-600 hover:bg-red-50"
              onClick={() => onCancel(booking.id)}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
          )}
          {(booking.status === "confirmed" || booking.status === "pending") && onReschedule && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 rounded-full text-xs"
              onClick={() => onReschedule(booking.id)}
            >
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Reschedule
            </Button>
          )}
          {booking.status === "completed" && onReview && (
            <Button
              size="sm"
              className="min-h-11 rounded-full bg-[linear-gradient(135deg,#db2777,#f43f5e_55%,#a78bfa)] text-xs text-white hover:opacity-90 shadow-sm"
              onClick={() => onReview(booking.id)}
            >
              <Star className="w-3.5 h-3.5 mr-1" />
              Write Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
