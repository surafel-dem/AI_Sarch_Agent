import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (!code) {
      console.error('No code provided in auth callback')
      return NextResponse.redirect(
        new URL('/auth-error?error=no_code', requestUrl.origin)
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    await supabase.auth.exchangeCodeForSession(code)

    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL(`/auth-error?error=${encodeURIComponent(error.message || 'Unknown error')}`, new URL(request.url).origin)
    )
  }
}
