import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Global middleware for security headers, maintenance mode, and request processing
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware checks for API status endpoint to avoid circular dependency
  if (pathname.startsWith('/api/system/status')) {
    return NextResponse.next()
  }

  // Check if user is authenticated and is an admin
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAdmin = token?.role === 'Admin'

  // Maintenance Mode Check (DISABLED IN DEVELOPMENT for performance)
  // Only check in production and skip API routes entirely
  if (
    process.env.NODE_ENV === 'production' &&
    !isAdmin &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') && // Skip ALL API routes
    !pathname.startsWith('/_next')
  ) {
    try {
      const baseUrl = request.nextUrl.origin
      const statusRes = await fetch(`${baseUrl}/api/system/status`, {
        next: { revalidate: 60 }, // Cache for 60 seconds instead of 5
      })

      if (statusRes.ok) {
        const { maintenanceMode } = await statusRes.json()

        if (maintenanceMode && pathname !== '/maintenance') {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      }
    } catch (error) {
      console.error('Maintenance mode check failed:', error)
    }
  }

  // Redirect admins away from maintenance page
  if (pathname === '/maintenance' && isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  const response = NextResponse.next()

  // Security Headers

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Content Security Policy (CSP)
  // Note: Adjust based on your actual needs
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  // HSTS (HTTP Strict Transport Security) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (for performance in dev)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
