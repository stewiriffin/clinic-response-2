import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

/**
 * GET - Fetch patient visit history
 */
export async function GET(
  req: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  const { params } = await context
  const { id } = params

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Find all appointments for this patient
    const appointments = await Appointment.find({ patient: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('createdAt diagnosis doctorNote temperature bloodPressure pulse oxygen status')
      .lean()

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('GET /api/patient/[id]/history error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
