import type { Booking } from '@/types'

export interface CancellationEligibility {
  allowed: boolean
  message: string
  isCorrectionWindow: boolean
  requiresWarning: boolean
  warningMessage?: string
  isLongService: boolean
}

export function getCancellationEligibility(booking: Booking, now: Date = new Date()): CancellationEligibility {
  // We parse the appointment start date and time as local time.
  const appointmentStart = new Date(`${booking.booking_date}T${booking.booking_time}:00`)
  const bookingCreatedAt = new Date(booking.created_at)

  const leadTimeMinutes = Math.round((appointmentStart.getTime() - bookingCreatedAt.getTime()) / 60000)
  const timeToAppointmentMinutes = Math.round((appointmentStart.getTime() - now.getTime()) / 60000)
  const minutesSinceBooking = Math.round((now.getTime() - bookingCreatedAt.getTime()) / 60000)

  const duration = booking.service?.duration_minutes || 0
  const category = booking.service?.category || ''
  const serviceName = booking.service?.name || ''
  
  const isLongService = duration >= 120 || 
    ['bridal', 'hair color', 'spa', 'massage', 'hair treatment'].some(keyword => 
      category.toLowerCase().includes(keyword) || 
      serviceName.toLowerCase().includes(keyword)
    )

  // 1. Past appointments
  if (timeToAppointmentMinutes <= 0) {
    return {
      allowed: false,
      message: "Past appointments cannot be cancelled.",
      isCorrectionWindow: false,
      requiresWarning: false,
      isLongService,
    }
  }

  // 2. Already cancelled
  if (booking.status === 'cancelled') {
    return {
      allowed: false,
      message: "This booking is already cancelled.",
      isCorrectionWindow: false,
      requiresWarning: false,
      isLongService,
    }
  }

  // 3. Immediate mistake grace (Correction window)
  const isCorrectionWindow = minutesSinceBooking <= 10 && timeToAppointmentMinutes > 0
  if (isCorrectionWindow) {
    return {
      allowed: true,
      message: "You are within the 10-minute booking correction window.",
      isCorrectionWindow: true,
      requiresWarning: false,
      isLongService,
    }
  }

  // 4. Advance bookings (booked > 24 hours in advance)
  if (leadTimeMinutes > 1440) {
    if (timeToAppointmentMinutes >= 1440) {
      return {
        allowed: true,
        message: "Free cancellation is available for bookings made in advance.",
        isCorrectionWindow: false,
        requiresWarning: false,
        isLongService,
      }
    } else {
      return {
        allowed: true,
        message: "This booking is inside the 24-hour window. In production, this may require salon approval or follow salon policy.",
        isCorrectionWindow: false,
        requiresWarning: true,
        warningMessage: "This booking is inside the 24-hour window. In production, this may require salon approval or follow salon policy.",
        isLongService,
      }
    }
  }

  // 5. Same-day / short-notice bookings (booked <= 24 hours in advance)
  // Lead time less than 60 minutes
  if (leadTimeMinutes < 60) {
    return {
      allowed: false,
      message: "This was a last-minute booking. Cancellation is not available because the salon has reserved immediate capacity.",
      isCorrectionWindow: false,
      requiresWarning: false,
      isLongService,
    }
  }

  // Lead time between 60 and 120 minutes
  if (leadTimeMinutes >= 60 && leadTimeMinutes < 120) {
    return {
      allowed: false,
      message: "This short-notice booking is too close to the appointment time to cancel automatically.",
      isCorrectionWindow: false,
      requiresWarning: false,
      isLongService,
    }
  }

  // Lead time >= 120 minutes but <= 24 hours (2 hours to 24 hours)
  // Allow cancellation while at least 60 minutes remain before appointment
  if (timeToAppointmentMinutes >= 60) {
    return {
      allowed: true,
      message: "Cancellation is allowed until 60 minutes before the appointment starts.",
      isCorrectionWindow: false,
      requiresWarning: false,
      isLongService,
    }
  } else {
    return {
      allowed: false,
      message: "This appointment starts in less than 60 minutes. Please contact the salon for changes.",
      isCorrectionWindow: false,
      requiresWarning: false,
      isLongService,
    }
  }
}
