"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin, XCircle, Star, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatPrice, formatDate, formatTime, getStatusColor } from "@/lib/utils"
import type { Booking } from "@/types"

const SALON_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80"

interface BookingCardProps {
  booking: Booking
  onCancel?: (id: string) => void
  onReview?: (id: string) => void
  onReschedule?: (id: string) => void
}

export function BookingCard({ booking, onCancel, onReview, onReschedule }: BookingCardProps) {
  const statusColor = getStatusColor(booking.status)

  return (
    <Card className="border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4 border-b border-gray-50">
          <Image
            src={booking.salon?.logo_url || SALON_IMAGE_FALLBACK}
            alt={booking.salon?.name || "Salon"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{booking.salon?.name}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
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
            <span className="text-gray-500">{booking.service?.name}</span>
            <span className="font-medium text-gray-900">{formatPrice(booking.total_price)}</span>
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
              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs"
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
              className="h-7 text-xs"
              onClick={() => onReschedule(booking.id)}
            >
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Reschedule
            </Button>
          )}
          {booking.status === "completed" && onReview && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm h-7 text-xs"
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
