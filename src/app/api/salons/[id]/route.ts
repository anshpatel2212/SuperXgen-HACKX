import { NextRequest, NextResponse } from 'next/server'
import { SALONS, SERVICES, OFFERS } from '@/data'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const salon = SALONS.find((s) => s.id === id || s.slug === id)

    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const services = SERVICES.filter((s) => s.salon_id === salon.id)
    const offers = OFFERS.filter(
      (o) => o.salon_id === salon.id && o.is_active
    )

    return NextResponse.json({
      ...salon,
      services,
      offers,
    })
  } catch (error) {
    console.error('Salon detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salon details' },
      { status: 500 }
    )
  }
}
