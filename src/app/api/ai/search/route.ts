import { NextRequest, NextResponse } from 'next/server'
import { searchSalons } from '@/services/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, filters } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query string is required' },
        { status: 400 }
      )
    }

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
