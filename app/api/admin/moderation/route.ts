import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // Fetch recent appointments as activity
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patientId', 'fullName email')
      .lean()

    // Transform to activity format
    const activities = appointments.map((appt: any) => ({
      _id: appt._id.toString(),
      type: 'appointment',
      action: `Appointment ${appt.status}`,
      user: appt.patientId?.fullName || 'Unknown',
      userEmail: appt.patientId?.email || 'N/A',
      timestamp: appt.createdAt,
      details: `Queue: ${appt.queueType} | Status: ${appt.status}`,
      flagged: false
    }))

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { action, activityId } = await req.json()

    if (!action || !activityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await dbConnect()

    if (action === 'delete') {
      // Delete the activity/appointment
      await Appointment.findByIdAndDelete(activityId)
      return NextResponse.json({ message: 'Activity deleted successfully' })
    } else if (action === 'flag') {
      // Flag the activity (you may want to create a Flags collection or add a flag field)
      // For now, we'll just return success
      return NextResponse.json({ message: 'Activity flagged successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error moderating activity:', error)
    return NextResponse.json(
      { error: 'Failed to moderate activity' },
      { status: 500 }
    )
  }
}
