import { NextRequest, NextResponse } from 'next/server'
import { getSafeReturnPath } from '@/lib/auth-routing'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const safeNext = getSafeReturnPath(searchParams.get('next'))
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('error', 'oauth_unavailable')
  if (safeNext) loginUrl.searchParams.set('next', safeNext)

  return NextResponse.redirect(loginUrl)
}
