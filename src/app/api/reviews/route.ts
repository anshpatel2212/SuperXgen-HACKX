import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SALONS } from '@/data'
import {
  createDemoReview,
  filterDemoReviews,
  getDemoReviews,
} from '@/lib/demo-reviews'
import {
  assertSameOrigin,
  assertUserIdMatchesRequester,
  badRequest,
  enforceDemoRateLimit,
  idSchema,
  isAdmin,
  parseJsonBody,
  paginationQuerySchema,
  requireDemoUser,
  searchParamsObject,
} from '@/lib/api-security'

const reviewQuerySchema = paginationQuerySchema.extend({
  salonId: idSchema.optional(),
  userId: idSchema.optional(),
})

const createReviewSchema = z
  .object({
    user_id: idSchema,
    salon_id: idSchema,
    booking_id: idSchema.optional().or(z.literal("")),
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().max(120).default(""),
    comment: z.string().trim().min(10).max(2000),
    images: z.array(z.string().url()).max(6).default([]),
  })
  .strict()

export async function GET(req: NextRequest) {
  try {
    const queryResult = reviewQuerySchema.safeParse(searchParamsObject(req))
    if (!queryResult.success) {
      return badRequest(
        queryResult.error.issues[0]?.message || 'Invalid reviews query',
        queryResult.error.flatten().fieldErrors
      )
    }

    const { salonId, userId, page, limit } = queryResult.data
    const auth = userId || !salonId ? requireDemoUser(req) : null

    if (auth instanceof NextResponse) return auth

    if (userId && auth) {
      const userMismatch = assertUserIdMatchesRequester(auth, userId)
      if (userMismatch) return userMismatch
    }

    const publicOnly = Boolean(salonId) && !userId && !auth

    const filtered = filterDemoReviews(getDemoReviews(), {
      salonId,
      userId: auth && !isAdmin(auth) ? userId || auth.id : userId,
      publicOnly,
    })

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)
    const averageRating =
      total > 0
        ? filtered.reduce((sum, review) => sum + review.rating, 0) / total
        : 0

    return NextResponse.json({
      reviews: paginated,
      total,
      page,
      limit,
      averageRating,
      totalReviews: total,
    })
  } catch (error) {
    console.error('Reviews list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const originError = assertSameOrigin(req)
    if (originError) return originError

    const rateLimit = enforceDemoRateLimit(req, 'reviews:create', {
      limit: 20,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const body = await parseJsonBody(req, createReviewSchema)
    if (body instanceof NextResponse) return body
    const { user_id, salon_id, booking_id, rating, title, comment, images } = body

    const userMismatch = assertUserIdMatchesRequester(auth, user_id)
    if (userMismatch) return userMismatch

    const salon = SALONS.find((s) => s.id === salon_id)
    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    let review
    try {
      review = createDemoReview({
        user_id,
        salon_id,
        booking_id: booking_id || '',
        rating,
        title,
        comment,
        images,
      })
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : 'Invalid review')
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
