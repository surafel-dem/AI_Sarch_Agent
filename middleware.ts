import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    // Refresh session if expired
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware session error:', error)
    }

    // Handle auth routes
    if (request.nextUrl.pathname.startsWith('/auth')) {
      return res
    }

    // For all other routes, ensure session exists
    if (!session) {
      // Only redirect if not already on the home page
      if (request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
