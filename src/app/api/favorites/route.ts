import { NextRequest, NextResponse } from 'next/server'
import { SALONS } from '@/data'
import type { Favorite } from '@/types'
import { favoritesStore } from '@/lib/store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const userFavorites = favoritesStore
      .filter((f) => f.user_id === userId)
      .map((f) => ({
        ...f,
        salon: SALONS.find((s) => s.id === f.salon_id),
      }))

    return NextResponse.json({ favorites: userFavorites })
  } catch (error) {
    console.error('Favorites list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, salon_id } = body

    if (!user_id || !salon_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, salon_id' },
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

    const existing = favoritesStore.find(
      (f) => f.user_id === user_id && f.salon_id === salon_id
    )

    if (existing) {
      return NextResponse.json(
        { error: 'Salon already in favorites' },
        { status: 409 }
      )
    }

    const favorite: Favorite = {
      id: `fav${Date.now()}`,
      user_id,
      salon_id,
      created_at: new Date().toISOString(),
    }

    favoritesStore.push(favorite)

    return NextResponse.json(
      { ...favorite, salon },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const salonId = searchParams.get('salonId')

    if (!userId || !salonId) {
      return NextResponse.json(
        { error: 'userId and salonId are required' },
        { status: 400 }
      )
    }

    const index = favoritesStore.findIndex(
      (f) => f.user_id === userId && f.salon_id === salonId
    )

    if (index === -1) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    favoritesStore.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
