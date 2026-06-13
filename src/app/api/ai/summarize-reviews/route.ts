import { NextRequest, NextResponse } from 'next/server'
import { REVIEWS } from '@/data'
import { summarizeReviews } from '@/services/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { salonId } = body

    if (!salonId || typeof salonId !== 'string') {
      return NextResponse.json(
        { error: 'salonId is required' },
        { status: 400 }
      )
    }

    const salonReviews = REVIEWS.filter((r) => r.salon_id === salonId)

    if (salonReviews.length === 0) {
      return NextResponse.json({
        summary: 'No reviews available for this salon yet.',
        sentiment: 'neutral',
        topThemes: [],
      })
    }

    const avgRating =
      salonReviews.reduce((sum, r) => sum + r.rating, 0) / salonReviews.length

    const sentiment =
      avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'mixed' : 'negative'

    const themeCounts: Record<string, number> = {}
    const themeKeywords: Record<string, string[]> = {
      service: ['service', 'staff', 'professional', 'friendly'],
      quality: ['quality', 'amazing', 'excellent', 'best', 'beautiful'],
      pricing: ['price', 'expensive', 'worth', 'value', 'affordable'],
      ambiance: ['ambiance', 'vibe', 'atmosphere', 'beautiful', 'clean'],
      waiting: ['wait', 'delay', 'time', 'late'],
      results: ['result', 'glow', 'look', 'stunning', 'love'],
    }

    for (const review of salonReviews) {
      const lower = review.comment.toLowerCase()
      for (const [theme, keywords] of Object.entries(themeKeywords)) {
        if (keywords.some((kw) => lower.includes(kw))) {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1
        }
      }
    }

    const sortedThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme)

    const themeLabels: Record<string, string> = {
      service: 'Customer Service',
      quality: 'Service Quality',
      pricing: 'Pricing & Value',
      ambiance: 'Ambiance',
      waiting: 'Wait Times',
      results: 'Results',
    }

    const topThemes = sortedThemes.map((t) => themeLabels[t] || t)

    const summary = summarizeReviews(salonId).summary

    return NextResponse.json({
      summary,
      sentiment,
      topThemes,
    })
  } catch (error) {
    console.error('Review summary error:', error)
    return NextResponse.json(
      { error: 'Failed to summarize reviews' },
      { status: 500 }
    )
  }
}
