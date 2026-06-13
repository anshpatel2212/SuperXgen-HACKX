import { NextRequest, NextResponse } from 'next/server'
import type { Booking, BookingStatus } from '@/types'
import { SALONS, SERVICES } from '@/data'
import { bookingsStore } from '@/lib/store'

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
    const body = await req.json()
    const {
      user_id,
      salon_id,
      service_id,
      booking_date,
      booking_time,
      service_mode,
      address_text,
      notes,
    } = body

    if (!user_id || !salon_id || !service_id || !booking_date) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, salon_id, service_id, booking_date' },
        { status: 400 }
      )
    }

    const salon = SALONS.find((s) => s.id === salon_id)
    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const service = SERVICES.find((s) => s.id === service_id)
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const finalPrice = service.final_price || (service.price - (service.price * (service.discount_percent || 0) / 100))

    const booking: Booking = {
      id: `b${Date.now()}`,
      user_id,
      salon_id,
      service_id,
      slot_id: null,
      booking_date,
      booking_time: booking_time || '10:00',
      status: 'pending',
      total_price: finalPrice,
      applied_offer_id: null,
      service_mode: service_mode || 'salon',
      address_text: address_text || '',
      notes: notes || '',
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
