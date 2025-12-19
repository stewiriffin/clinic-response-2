import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

/**
 * Health check endpoint for monitoring and uptime checks
 * GET /api/health
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      database: 'unknown' as 'ok' | 'error' | 'unknown',
      memory: 'ok' as 'ok' | 'warning',
    },
  }

  try {
    // Check database connection
    await dbConnect()
    const dbState = mongoose.connection.readyState

    if (dbState === 1) {
      health.checks.database = 'ok'
    } else {
      health.checks.database = 'error'
      health.status = 'degraded'
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)

    if (memoryUsageMB > memoryTotalMB * 0.9) {
      health.checks.memory = 'warning'
      health.status = 'degraded'
    }

    // Return appropriate status code
    const statusCode = health.status === 'ok' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    health.status = 'error'
    health.checks.database = 'error'

    return NextResponse.json(
      {
        ...health,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
