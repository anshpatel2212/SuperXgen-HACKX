import { NextRequest, NextResponse } from 'next/server'
import type { Booking, BookingStatus } from '@/types'
import { OFFERS, SALONS, SERVICES } from '@/data'
import { bookingsStore } from '@/lib/store'
import { createBookingSchema } from '@/lib/validation/booking'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const salonId = searchParams.get('salonId')
    const status = searchParams.get('status') as BookingStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filtered = [...bookingsStore]

    if (userId) {
      filtered = filtered.filter((b) => b.user_id === userId)
    }
    if (salonId) {
      filtered = filtered.filter((b) => b.salon_id === salonId)
    }
    if (status) {
      filtered = filtered.filter((b) => b.status === status)
    }

    filtered = filtered.map((b) => ({
      ...b,
      salon: SALONS.find((s) => s.id === b.salon_id),
      service: SERVICES.find((s) => s.id === b.service_id),
    }))

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return NextResponse.json({
      bookings: paginated,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Bookings list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = createBookingSchema.safeParse(await req.json())

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0]?.message || 'Invalid booking details',
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const {
      user_id,
      salon_id,
      service_id,
      booking_date,
      booking_time,
      service_mode,
      address_text,
      notes,
      offer_id,
    } = result.data

    const salon = SALONS.find((s) => s.id === salon_id)
    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const service = SERVICES.find((s) => s.id === service_id)
    if (!service || service.salon_id !== salon_id) {
      return NextResponse.json(
        { error: 'This service is not available at the selected salon' },
        { status: 400 }
      )
    }

    const basePrice = service.final_price || (service.price - (service.price * (service.discount_percent || 0) / 100))
    const now = Date.now()
    const offer = offer_id
      ? OFFERS.find(
          (candidate) =>
            candidate.id === offer_id &&
            candidate.salon_id === salon_id &&
            candidate.is_active &&
            new Date(candidate.valid_from).getTime() <= now &&
            new Date(candidate.valid_till).getTime() >= now
        )
      : null

    if (offer_id && !offer) {
      return NextResponse.json(
        { error: 'The selected offer is no longer valid' },
        { status: 400 }
      )
    }

    if (offer && basePrice < offer.min_purchase) {
      return NextResponse.json(
        { error: `This offer requires a minimum purchase of ₹${offer.min_purchase}` },
        { status: 400 }
      )
    }

    const discount = offer
      ? offer.discount_type === 'percentage'
        ? Math.min(basePrice * (offer.discount_value / 100), offer.max_discount || basePrice)
        : Math.min(offer.discount_value, offer.max_discount || offer.discount_value)
      : 0

    const booking: Booking = {
      id: `b${Date.now()}`,
      user_id,
      salon_id,
      service_id,
      slot_id: null,
      booking_date,
      booking_time,
      status: 'pending',
      total_price: Math.max(0, basePrice - discount),
      applied_offer_id: offer?.id || null,
      service_mode,
      address_text,
      notes,
      created_at: new Date().toISOString(),
      confirmed_at: null,
      completed_at: null,
      cancelled_at: null,
    }

    bookingsStore.push(booking)

    return NextResponse.json(
      { ...booking, salon, service },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
