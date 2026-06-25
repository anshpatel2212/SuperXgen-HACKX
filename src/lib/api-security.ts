import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { DEMO_ACCOUNTS } from "@/config/demo-auth"
import { SALONS } from "@/data"
import type { AuthUser, Booking } from "@/types"

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>()

export const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9_.:-]+$/, "Invalid identifier")

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")

export const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use HH:MM")

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
])

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export function searchParamsObject(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries())
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status: 400 }
  )
}

export function unauthorized(message = "Demo authentication required") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin")
  if (!origin) return null

  try {
    if (new URL(origin).origin !== req.nextUrl.origin) {
      return forbidden("Cross-origin API requests are not allowed in demo mode")
    }
  } catch {
    return forbidden("Invalid request origin")
  }

  return null
}

export async function parseJsonBody<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return badRequest("Request body must be valid JSON")
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return badRequest(
      result.error.issues[0]?.message || "Invalid request body",
      result.error.flatten().fieldErrors
    )
  }

  return result.data
}

export function getDemoUserFromRequest(req: NextRequest): AuthUser | null {
  const directHeader = req.headers.get("x-glowgo-demo-user-id")?.trim()
  const bearer = req.headers.get("authorization")?.match(/^Bearer demo:(.+)$/i)?.[1]?.trim()
  const requestedId = directHeader || bearer

  if (!requestedId) return null

  return DEMO_ACCOUNTS.find((account) => account.user.id === requestedId)?.user || null
}

export function requireDemoUser(req: NextRequest): AuthUser | NextResponse {
  const user = getDemoUserFromRequest(req)
  if (!user) {
    return unauthorized(
      "Demo API access requires x-glowgo-demo-user-id. Production must replace this with server-verified Supabase auth."
    )
  }
  return user
}

export function isAdmin(user: AuthUser) {
  return user.role === "admin"
}

export function isSalonOwner(user: AuthUser, salonId: string) {
  return SALONS.some((salon) => salon.id === salonId && salon.owner_id === user.id)
}

export function ownedSalonIds(user: AuthUser) {
  return SALONS.filter((salon) => salon.owner_id === user.id).map((salon) => salon.id)
}

export function canAccessBooking(user: AuthUser, booking: Booking) {
  return isAdmin(user) || booking.user_id === user.id || isSalonOwner(user, booking.salon_id)
}

export function assertUserIdMatchesRequester(user: AuthUser, userId: string) {
  if (isAdmin(user) || user.id === userId) return null
  return forbidden("Requested user does not match the authenticated demo user")
}

export function enforceDemoRateLimit(
  req: NextRequest,
  scope: string,
  options: { limit: number; windowMs: number }
) {
  const now = Date.now()
  const requester = getDemoUserFromRequest(req)?.id
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const key = `${scope}:${requester || forwardedFor || "anonymous"}`
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  if (bucket.count >= options.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    )
  }

  bucket.count += 1
  return null
}
