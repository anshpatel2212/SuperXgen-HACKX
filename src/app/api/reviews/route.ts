import { NextRequest, NextResponse } from 'next/server'
import { SALONS } from '@/data'
import {
  createDemoReview,
  filterDemoReviews,
  getDemoReviews,
} from '@/lib/demo-reviews'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const salonId = searchParams.get('salonId')
    const userId = searchParams.get('userId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const filtered = filterDemoReviews(getDemoReviews(), {
      salonId: salonId || undefined,
      userId: userId || undefined,
      publicOnly: Boolean(salonId),
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
    const body = await req.json()
    const { user_id, salon_id, booking_id, rating, title, comment, images } = body

    if (!user_id || !salon_id || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, salon_id, rating, comment' },
        { status: 400 }
      )
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
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

    const review = createDemoReview({
      user_id,
      salon_id,
      booking_id: booking_id || '',
      rating,
      title: title || '',
      comment,
      images: images || [],
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
