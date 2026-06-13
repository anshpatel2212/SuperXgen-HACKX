import { NextRequest, NextResponse } from 'next/server'
import { SALONS } from '@/data'
import type { Review } from '@/types'
import { reviewsStore } from '@/lib/store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const salonId = searchParams.get('salonId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filtered = [...reviewsStore]

    if (salonId) {
      filtered = filtered.filter((r) => r.salon_id === salonId)
    }
    if (userId) {
      filtered = filtered.filter((r) => r.user_id === userId)
    }

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    const salon = salonId
      ? SALONS.find((s) => s.id === salonId)
      : undefined

    return NextResponse.json({
      reviews: paginated,
      total,
      page,
      limit,
      averageRating: salon?.rating_avg || 0,
      totalReviews: salon?.review_count || total,
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

    if (rating < 1 || rating > 5) {
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

    const review: Review = {
      id: `r${Date.now()}`,
      user_id,
      salon_id,
      booking_id: booking_id || '',
      rating,
      title: title || '',
      comment,
      images: images || [],
      is_verified: false,
      is_reported: false,
      is_moderated: false,
      created_at: new Date().toISOString(),
      user: undefined,
    }

    reviewsStore.push(review)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
