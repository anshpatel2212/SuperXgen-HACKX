import { NextRequest, NextResponse } from 'next/server'
import { SALONS, SERVICES } from '@/data'
import { bookingsStore } from '@/lib/store'
import type { BookingStatus } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = bookingsStore.find((b) => b.id === id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
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
    const { id } = await params
    const body = await req.json()
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
