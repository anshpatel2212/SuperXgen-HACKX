import { NextRequest, NextResponse } from 'next/server'
import { searchSalons, extractIntent, generateRecommendationReasoning } from '@/services/ai'
import { SALONS, SERVICES } from '@/data'
import type { AIIntent } from '@/types'

function generateGeneralResponse(intent: AIIntent, result: { salons: typeof SALONS; reasoning: string }): string {
  if (intent.type === 'summarize') {
    const salon = intent.services?.[0]
      ? SALONS.find((s) =>
          s.name.toLowerCase().includes(intent.services![0].toLowerCase())
        )
      : SALONS[0]
    if (salon) {
      return `I'd be happy to tell you about ${salon.name}! They're located in ${salon.area} with a ${salon.rating_avg}★ rating from ${salon.review_count} reviews. ${salon.description}`
    }
    return "I'd love to summarize a salon for you! Could you tell me which salon you're interested in?"
  }

  if (intent.type === 'insight') {
    return "I can provide personalized beauty insights! Please complete your beauty profile in your account settings so I can give you tailored recommendations based on your skin type, preferences, and booking history."
  }

  if (intent.type === 'description') {
    return "I can generate descriptions for salons and services! Which salon or service would you like me to describe?"
  }

  if (result.salons.length === 0) {
    return `I searched for "${intent.raw_query}" but couldn't find any matching salons. Try broadening your search — for example, change the area, adjust your budget, or try a different service type.`
  }

  return result.reasoning
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const intent = extractIntent(message)
    const result = searchSalons(message, {})

    let response: string
    let recommendations: typeof SALONS = []

    if (result.salons.length > 0 && intent.type !== 'summarize' && intent.type !== 'insight' && intent.type !== 'description') {
      recommendations = result.salons.slice(0, 3)

      const detailLines: string[] = [result.reasoning]

      recommendations.forEach((salon, i) => {
        const salonServices = SERVICES.filter((s) => s.salon_id === salon.id)
        const popularServices = salonServices.filter((s) => s.is_popular).slice(0, 2)
        if (popularServices.length > 0) {
          detailLines.push(
            `${i + 1}. ${salon.name} — ${popularServices.map((s) => `${s.name} (₹${s.price.toLocaleString('en-IN')})`).join(', ')}`
          )
        }
      })

      if (recommendations.length > 0) {
        const salon = recommendations[0]
        detailLines.push(
          `\nWould you like to book at ${salon.name} or explore more options? I can help you with timing, pricing, and any other questions!`
        )
      }

      response = detailLines.join('\n\n')
    } else {
      response = generateGeneralResponse(intent, result)
    }

    return NextResponse.json({
      response,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      intent,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
