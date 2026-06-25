import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Booking, Offer } from '@/types'
import { OFFERS, SALONS, SERVICES } from '@/data'
import { bookingsStore } from '@/lib/store'
import { createBookingSchema } from '@/lib/validation/booking'
import {
  assertSameOrigin,
  assertUserIdMatchesRequester,
  badRequest,
  bookingStatusSchema,
  canAccessBooking,
  enforceDemoRateLimit,
  forbidden,
  isAdmin,
  isSalonOwner,
  ownedSalonIds,
  paginationQuerySchema,
  parseJsonBody,
  requireDemoUser,
  searchParamsObject,
} from '@/lib/api-security'

const bookingListQuerySchema = paginationQuerySchema.extend({
  userId: z.string().trim().min(1).max(120).optional(),
  salonId: z.string().trim().min(1).max(120).optional(),
  status: bookingStatusSchema.optional(),
})

function resolveOffer(
  offerId: string,
  salonId: string,
  demoOffer?: Offer
): Offer | null {
  const now = Date.now()
  const seededOffer = OFFERS.find(
    (candidate) =>
      candidate.id === offerId &&
      candidate.salon_id === salonId &&
      candidate.is_active &&
      new Date(candidate.valid_from).getTime() <= now &&
      new Date(candidate.valid_till).getTime() >= now
  )
  if (seededOffer) return seededOffer

  if (
    demoOffer &&
    demoOffer.id === offerId &&
    demoOffer.salon_id === salonId &&
    demoOffer.is_active &&
    new Date(demoOffer.valid_from).getTime() <= now &&
    new Date(demoOffer.valid_till).getTime() >= now
  ) {
    return demoOffer
  }

  return null
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const queryResult = bookingListQuerySchema.safeParse(searchParamsObject(req))
    if (!queryResult.success) {
      return badRequest(
        queryResult.error.issues[0]?.message || 'Invalid booking query',
        queryResult.error.flatten().fieldErrors
      )
    }

    const { userId, salonId, status, page, limit } = queryResult.data

    if (userId) {
      const userMismatch = assertUserIdMatchesRequester(auth, userId)
      if (userMismatch) return userMismatch
    }

    if (salonId && !isAdmin(auth) && !isSalonOwner(auth, salonId)) {
      return forbidden('Requested salon does not belong to the authenticated demo user')
    }

    let filtered = [...bookingsStore]

    if (auth.role === 'customer') {
      filtered = filtered.filter((b) => b.user_id === auth.id)
    } else if (auth.role === 'owner') {
      const allowedSalonIds = new Set(ownedSalonIds(auth))
      filtered = filtered.filter((b) => allowedSalonIds.has(b.salon_id))
    }

    if (userId) filtered = filtered.filter((b) => b.user_id === userId)
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
    const originError = assertSameOrigin(req)
    if (originError) return originError

    const rateLimit = enforceDemoRateLimit(req, 'bookings:create', {
      limit: 20,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const bookingInput = await parseJsonBody(req, createBookingSchema)
    if (bookingInput instanceof NextResponse) return bookingInput

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
      demo_offer,
      slot_id,
    } = bookingInput

    const userMismatch = assertUserIdMatchesRequester(auth, user_id)
    if (userMismatch) return userMismatch

    if (auth.role === 'owner') {
      return forbidden('Owners cannot create customer bookings through this endpoint')
    }

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
    const offer = offer_id ? resolveOffer(offer_id, salon_id, demo_offer as Offer | undefined) : null

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
      slot_id: slot_id || null,
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

    if (!canAccessBooking(auth, booking)) {
      return forbidden('Created booking is outside the authenticated demo user scope')
    }

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
