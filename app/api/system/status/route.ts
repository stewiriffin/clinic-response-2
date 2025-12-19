import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { getSystemSettings } from '@/models/SystemSettings'

// This endpoint is public and heavily cached for middleware checks
export const dynamic = 'force-dynamic'
export const revalidate = 5 // Revalidate every 5 seconds

export async function GET() {
  try {
    await dbConnect()
    const settings = await getSystemSettings()

    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode,
      signupLockdown: settings.signupLockdown,
      maintenanceMessage: settings.maintenanceMessage,
      lockdownMessage: settings.lockdownMessage,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    })
  } catch (error) {
    console.error('Error fetching system status:', error)
    // Fail open - if we can't check, allow access
    return NextResponse.json({
      maintenanceMode: false,
      signupLockdown: false,
    })
  }
}
