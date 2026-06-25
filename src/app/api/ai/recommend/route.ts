import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SALONS, SERVICES } from '@/data'
import { generateRecommendationReasoning, extractIntent } from '@/services/ai'
import { enforceDemoRateLimit, parseJsonBody } from '@/lib/api-security'

const recommendationSchema = z
  .object({
    preferences: z
      .object({
        query: z.string().trim().max(500).optional(),
        service: z.string().trim().max(120).optional(),
        area: z.string().trim().max(120).optional(),
        gender: z.string().trim().max(40).optional(),
      })
      .partial()
      .optional(),
    userId: z.string().trim().max(120).optional(),
  })
  .passthrough()

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceDemoRateLimit(req, 'ai:recommend', {
      limit: 40,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const body = await parseJsonBody(req, recommendationSchema)
    if (body instanceof NextResponse) return body
    const { preferences } = body

    const query =
      preferences?.query ||
      [preferences?.service, preferences?.area, preferences?.gender]
        .filter(Boolean)
        .join(' ') ||
      ''

    const intent = extractIntent(query)

    let recommended = SALONS

    if (intent.area) {
      recommended = recommended.filter(
        (s) => s.area.toLowerCase() === intent.area!.toLowerCase()
      )
    }
    if (intent.gender) {
      recommended = recommended.filter(
        (s) => s.gender === intent.gender || s.gender === 'unisex'
      )
    }
    if (intent.is_luxury === true) {
      recommended = recommended.filter((s) => s.luxury_level === 'luxury' || s.luxury_level === 'premium')
    }
    if (intent.services && intent.services.length > 0) {
      recommended = recommended.filter((salon) => {
        const salonServices = SERVICES.filter((s) => s.salon_id === salon.id)
        return salonServices.some((s) =>
          intent.services!.some((is) =>
            s.category.toLowerCase().includes(is.toLowerCase())
          )
        )
      })
    }

    recommended = recommended.sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 5)

    let reasoning = ''
    if (recommended.length === 0) {
      reasoning = 'No recommendations available for the given preferences.'
    } else {
      const topServices = SERVICES.filter(
        (s) => s.salon_id === recommended[0].id
      )
      reasoning = `Based on your preferences, I recommend ${recommended[0].name}. ${generateRecommendationReasoning(recommended[0], topServices, intent)}`
    }

    return NextResponse.json({
      recommendations: recommended,
      reasoning,
    })
  } catch (error) {
    console.error('AI recommend error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
