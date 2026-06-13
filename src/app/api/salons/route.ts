import { NextRequest, NextResponse } from 'next/server'
import { SALONS, SERVICES, OFFERS } from '@/data'
import { parsePriceRange } from '@/lib/utils'
import type { Salon } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const area = searchParams.get('area')
    const service = searchParams.get('service')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const gender = searchParams.get('gender')
    const luxury = searchParams.get('luxury')
    const homeService = searchParams.get('homeService')
    const sortBy = searchParams.get('sortBy') as 'rating' | 'price_low' | 'price_high' | 'popularity' | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filtered = [...SALONS]

    if (area) {
      filtered = filtered.filter(
        (s) => s.area.toLowerCase() === area.toLowerCase()
      )
    }

    if (service) {
      filtered = filtered.filter((salon) => {
        const salonServices = SERVICES.filter((s) => s.salon_id === salon.id)
        return salonServices.some(
          (s) =>
            s.category.toLowerCase().includes(service.toLowerCase()) ||
            s.name.toLowerCase().includes(service.toLowerCase())
        )
      })
    }

    if (minPrice) {
      const min = parseInt(minPrice)
      filtered = filtered.filter((s) => {
        const range = parsePriceRange(s.price_range)
        return range.max >= min
      })
    }

    if (maxPrice) {
      const max = parseInt(maxPrice)
      filtered = filtered.filter((s) => {
        const range = parsePriceRange(s.price_range)
        return range.min <= max
      })
    }

    if (minRating) {
      const min = parseFloat(minRating)
      filtered = filtered.filter((s) => s.rating_avg >= min)
    }

    if (gender) {
      filtered = filtered.filter(
        (s) => s.gender === gender || s.gender === 'unisex'
      )
    }

    if (luxury === 'true') {
      filtered = filtered.filter((s) => s.luxury_level === 'luxury' || s.luxury_level === 'premium')
    } else if (luxury === 'false') {
      filtered = filtered.filter((s) => s.luxury_level === 'budget' || s.luxury_level === 'mid')
    }

    if (homeService === 'true') {
      filtered = filtered.filter((s) => s.offers_home_service)
    } else if (homeService === 'false') {
      filtered = filtered.filter((s) => !s.offers_home_service)
    }

    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating_avg - a.rating_avg)
        break
      case 'price_low':
        filtered.sort((a, b) => {
          const aRange = parsePriceRange(a.price_range)
          const bRange = parsePriceRange(b.price_range)
          return aRange.min - bRange.min
        })
        break
      case 'price_high':
        filtered.sort((a, b) => {
          const aRange = parsePriceRange(a.price_range)
          const bRange = parsePriceRange(b.price_range)
          return bRange.max - aRange.max
        })
        break
      case 'popularity':
        filtered.sort((a, b) => b.total_bookings - a.total_bookings)
        break
    }

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return NextResponse.json({
      salons: paginated,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Salons list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salons' },
      { status: 500 }
    )
  }
}
