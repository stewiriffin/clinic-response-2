import { NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production for distributed systems)
const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

/**
 * Rate limiter for API routes
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns NextResponse with 429 status if rate limit exceeded, null if allowed
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): NextResponse | null {
  const now = Date.now();
  const key = identifier;

  // Initialize or get existing record
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return null; // Allow request
  }

  // Increment count
  store[key].count++;

  // Check if limit exceeded
  if (store[key].count > config.maxRequests) {
    const resetIn = Math.ceil((store[key].resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: config.message || 'Too many requests, please try again later.',
        retryAfter: resetIn,
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetIn.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': store[key].resetTime.toString(),
        },
      }
    );
  }

  return null; // Allow request
}

/**
 * Get client identifier from request (IP address or forwarded IP)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP (not available in edge runtime)
  return 'unknown';
}

/**
 * Preset configurations for common rate limiting scenarios
 */
export const RateLimitPresets = {
  // Strict limit for authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  // Moderate limit for API endpoints
  API: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many API requests. Please slow down.',
  },
  // Strict limit for booking/appointment creation
  BOOKING: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 bookings per 5 minutes
    message: 'Too many booking attempts. Please try again later.',
  },
  // Strict limit for SMS/Email notifications
  NOTIFICATION: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10, // 10 notifications per 10 minutes
    message: 'Too many notification requests. Please try again later.',
  },
};
