/* 
@TODO UNCOMMENT THIS CODE WHEN YOU WANT TO PROTECT THE DASHBOARD ROUTE


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

/* export const config = {
  matcher: ['/dashboard/:path*'],
}
 */

export function middleware() {
    // middleware désactivé temporairement
    return
  }