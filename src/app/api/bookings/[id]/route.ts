import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SALONS, SERVICES } from '@/data'
import { bookingsStore } from '@/lib/store'
import type { BookingStatus } from '@/types'
import {
  assertSameOrigin,
  badRequest,
  bookingStatusSchema,
  canAccessBooking,
  dateSchema,
  enforceDemoRateLimit,
  forbidden,
  idSchema,
  isAdmin,
  parseJsonBody,
  requireDemoUser,
  timeSchema,
} from '@/lib/api-security'

const updateBookingSchema = z
  .object({
    status: bookingStatusSchema.optional(),
    booking_date: dateSchema.optional(),
    booking_time: timeSchema.optional(),
  })
  .strict()
  .refine(
    (value) => Boolean(value.status || value.booking_date || value.booking_time),
    "Provide at least one booking field to update"
  )

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireDemoUser(_req)
    if (auth instanceof NextResponse) return auth

    const idResult = idSchema.safeParse((await params).id)
    if (!idResult.success) return badRequest('Invalid booking id')
    const id = idResult.data

    const booking = bookingsStore.find((b) => b.id === id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!canAccessBooking(auth, booking)) {
      return forbidden('You do not have access to this booking')
    }

    return NextResponse.json({
      ...booking,
      salon: SALONS.find((s) => s.id === booking.salon_id),
      service: SERVICES.find((s) => s.id === booking.service_id),
    })
  } catch (error) {
    console.error('Booking detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originError = assertSameOrigin(req)
    if (originError) return originError

    const rateLimit = enforceDemoRateLimit(req, 'bookings:update', {
      limit: 30,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const idResult = idSchema.safeParse((await params).id)
    if (!idResult.success) return badRequest('Invalid booking id')
    const id = idResult.data

    const body = await parseJsonBody(req, updateBookingSchema)
    if (body instanceof NextResponse) return body
    const { status, booking_date, booking_time } = body

    const bookingIndex = bookingsStore.findIndex((b) => b.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const validTransitions: Record<string, BookingStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'rescheduled'],
      completed: [],
      cancelled: [],
      rescheduled: ['confirmed', 'cancelled'],
    }

    const booking = bookingsStore[bookingIndex]

    if (!canAccessBooking(auth, booking)) {
      return forbidden('You do not have access to this booking')
    }

    if (auth.role === 'customer' && !isAdmin(auth)) {
      const onlyCancellingOwnBooking =
        status === 'cancelled' && !booking_date && !booking_time && booking.user_id === auth.id
      if (!onlyCancellingOwnBooking) {
        return forbidden('Customers can only cancel their own demo bookings')
      }
    }

    if (status) {
      const allowed = validTransitions[booking.status] || []
      if (!allowed.includes(status) && status !== booking.status) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${booking.status} to ${status}`,
          },
          { status: 400 }
        )
      }
      booking.status = status
    }

    if (booking_date) booking.booking_date = booking_date
    if (booking_time) booking.booking_time = booking_time
    booking.updated_at = new Date().toISOString()

    return NextResponse.json({
      ...booking,
      salon: SALONS.find((s) => s.id === booking.salon_id),
      service: SERVICES.find((s) => s.id === booking.service_id),
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
