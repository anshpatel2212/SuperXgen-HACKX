import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchSalons } from '@/services/ai'
import { enforceDemoRateLimit, parseJsonBody } from '@/lib/api-security'

const searchSchema = z
  .object({
    query: z.string().trim().min(1).max(500),
    filters: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceDemoRateLimit(req, 'ai:search', {
      limit: 40,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const body = await parseJsonBody(req, searchSchema)
    if (body instanceof NextResponse) return body
    const { query, filters } = body

    const result = searchSalons(query, filters || {})

    return NextResponse.json({
      salons: result.salons,
      reasoning: result.reasoning,
      intent: result.intent,
    })
  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    )
  }
}
