import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // X-Request-ID for tracing
  response.headers.set('X-Request-ID', randomUUID())

  // Block external origins from hitting internal API routes
  const origin = request.headers.get('origin')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow revalidate webhook from WooCommerce (no origin check — server-to-server)
    if (request.nextUrl.pathname === '/api/revalidate') {
      return response
    }

    // Block requests with foreign origins
    if (origin && !origin.startsWith(siteUrl)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
