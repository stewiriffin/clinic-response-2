import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logError, logSecurityEvent } from './logger'

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string
  message?: string
  details?: any
  timestamp: string
}

/**
 * API Error class for throwing structured errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Common API errors
 */
export const ApiErrors = {
  Unauthorized: () => new ApiError(401, 'Unauthorized'),
  Forbidden: (message = 'Forbidden') => new ApiError(403, message),
  NotFound: (resource = 'Resource') => new ApiError(404, `${resource} not found`),
  BadRequest: (message = 'Bad request') => new ApiError(400, message),
  Conflict: (message = 'Resource already exists') => new ApiError(409, message),
  TooManyRequests: (retryAfter?: number) =>
    new ApiError(429, 'Too many requests', { retryAfter }),
  InternalError: (message = 'Internal server error') => new ApiError(500, message),
  ValidationError: (details: any) =>
    new ApiError(400, 'Validation failed', details),
}

/**
 * Handle and format API errors consistently
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString()

  // Handle known ApiError
  if (error instanceof ApiError) {
    logError(error, context, { statusCode: error.statusCode })

    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        timestamp,
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    logError(error, context, { type: 'validation' })

    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        timestamp,
      },
      { status: 400 }
    )
  }

  // Handle Mongoose duplicate key errors
  if (error && typeof error === 'object' && 'code' in error) {
    const mongoError = error as { code?: number; keyValue?: any }
    if (mongoError.code === 11000) {
      logError(error, context, { type: 'duplicate_key' })

      return NextResponse.json(
        {
          error: 'Resource already exists',
          details: mongoError.keyValue,
          timestamp,
        },
        { status: 409 }
      )
    }
  }

  // Handle unknown errors
  logError(error, context, { type: 'unknown' })

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error instanceof Error
      ? error.message
      : 'Unknown error'

  return NextResponse.json(
    {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? message : undefined,
      timestamp,
    },
    { status: 500 }
  )
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number
    message?: string
  }
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(options?.message && { message: options.message }),
      timestamp: new Date().toISOString(),
    },
    { status: options?.status || 200 }
  )
}

/**
 * Verify authentication and authorization
 */
export function verifyAuth(
  token: any,
  requiredRole?: string | string[]
): void {
  if (!token) {
    throw ApiErrors.Unauthorized()
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(token.role)) {
      logSecurityEvent('Unauthorized access attempt', 'medium', {
        email: token.email,
        role: token.role,
        requiredRole,
      })
      throw ApiErrors.Forbidden('Insufficient permissions')
    }
  }
}
