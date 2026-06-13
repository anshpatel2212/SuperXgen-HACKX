import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/'

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_code', req.url)
      )
    }

    const redirectUrl = new URL(next, req.url)
    redirectUrl.searchParams.set('auth_success', 'true')

    const response = NextResponse.redirect(redirectUrl)

    response.cookies.set('auth_callback_code', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', req.url)
    )
  }
}
