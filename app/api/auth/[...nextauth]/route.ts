// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { rateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rateLimiter'
import type { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

// Wrap POST requests with rate limiting for login attempts
async function POST(req: NextRequest, context: { params: { nextauth: string[] } }) {
  // Apply rate limiting only to signin requests
  const url = new URL(req.url)
  if (url.pathname.includes('callback') && url.searchParams.get('signin')) {
    const identifier = getClientIdentifier(req)
    const rateLimitResponse = rateLimit(identifier, RateLimitPresets.AUTH)

    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  // @ts-ignore - NextAuth types don't match App Router exactly
  return handler(req, context)
}

async function GET(req: NextRequest, context: { params: { nextauth: string[] } }) {
  // @ts-ignore - NextAuth types don't match App Router exactly
  return handler(req, context)
}

export { GET, POST }
