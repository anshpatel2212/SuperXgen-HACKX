"use client"

import Image from "next/image"
import { MapPin, Home } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn, formatPrice, formatDate, formatTime, getStatusColor } from "@/lib/utils"
import type { Booking } from "@/types"

const SALON_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80"

interface BookingSummaryProps {
  booking: Booking
  variant?: "default" | "compact"
}

export function BookingSummary({ booking, variant = "default" }: BookingSummaryProps) {
  const statusColor = getStatusColor(booking.status)

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
          <Image
            src={booking.salon?.logo_url || SALON_IMAGE_FALLBACK}
            alt={booking.salon?.name || "Salon"}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{booking.salon?.name}</p>
          <p className="text-xs text-gray-500">{booking.service?.name}</p>
          <p className="text-xs text-gray-400">
            {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
          </p>
        </div>
        <Badge className={cn("text-[10px]", statusColor)}>{booking.status}</Badge>
      </div>
    )
  }

  return (
    <Card className="border-gray-100 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-glowgo-pink/5 to-glowgo-lavender/5 border-b border-gray-50">
          <Image
            src={booking.salon?.logo_url || SALON_IMAGE_FALLBACK}
            alt={booking.salon?.name || "Salon"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{booking.salon?.name}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {booking.salon?.area}, {booking.salon?.city}
            </div>
          </div>
          <Badge className={cn("text-xs capitalize", statusColor)}>
            {booking.status}
          </Badge>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-gray-900">{booking.service?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">{formatDate(booking.booking_date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-900">
              {formatTime(booking.booking_time)}
            </span>
          </div>
          {booking.service_mode === "home" && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-xs">
                <Home className="w-3 h-3 mr-0.5" />
                Home Service
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold text-gray-900">{formatPrice(booking.total_price)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
