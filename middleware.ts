import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { session } } = await supabase.auth.getSession()

  // Allow access to login page
  if (request.nextUrl.pathname === '/login') {
    // If user is already logged in and tries to access login page, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Special case for root route
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Configure middleware to run on all routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 