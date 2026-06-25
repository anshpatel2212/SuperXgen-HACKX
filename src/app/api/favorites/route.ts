import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SALONS } from '@/data'
import type { Favorite } from '@/types'
import { favoritesStore } from '@/lib/store'
import {
  assertSameOrigin,
  assertUserIdMatchesRequester,
  badRequest,
  enforceDemoRateLimit,
  idSchema,
  parseJsonBody,
  requireDemoUser,
  searchParamsObject,
} from '@/lib/api-security'

const favoriteQuerySchema = z.object({
  userId: idSchema.optional(),
  salonId: idSchema.optional(),
})

const favoriteBodySchema = z
  .object({
    user_id: idSchema,
    salon_id: idSchema,
  })
  .strict()

export async function GET(req: NextRequest) {
  try {
    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const queryResult = favoriteQuerySchema.safeParse(searchParamsObject(req))
    if (!queryResult.success) {
      return badRequest(
        queryResult.error.issues[0]?.message || 'Invalid favorites query',
        queryResult.error.flatten().fieldErrors
      )
    }

    const userId = queryResult.data.userId || auth.id
    const userMismatch = assertUserIdMatchesRequester(auth, userId)
    if (userMismatch) return userMismatch

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
    const originError = assertSameOrigin(req)
    if (originError) return originError

    const rateLimit = enforceDemoRateLimit(req, 'favorites:write', {
      limit: 60,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const body = await parseJsonBody(req, favoriteBodySchema)
    if (body instanceof NextResponse) return body
    const { user_id, salon_id } = body

    const userMismatch = assertUserIdMatchesRequester(auth, user_id)
    if (userMismatch) return userMismatch

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
    const originError = assertSameOrigin(req)
    if (originError) return originError

    const rateLimit = enforceDemoRateLimit(req, 'favorites:write', {
      limit: 60,
      windowMs: 60_000,
    })
    if (rateLimit) return rateLimit

    const auth = requireDemoUser(req)
    if (auth instanceof NextResponse) return auth

    const queryResult = favoriteQuerySchema.required({ salonId: true }).safeParse(searchParamsObject(req))
    if (!queryResult.success || !queryResult.data.salonId) {
      return badRequest(
        queryResult.error?.issues[0]?.message || 'userId and salonId are required',
        queryResult.error?.flatten().fieldErrors
      )
    }

    const userId = queryResult.data.userId || auth.id
    const salonId = queryResult.data.salonId
    const userMismatch = assertUserIdMatchesRequester(auth, userId)
    if (userMismatch) return userMismatch

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
