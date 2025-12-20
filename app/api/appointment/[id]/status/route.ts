import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { pusherServer } from '@/lib/pusher-server'

/**
 * PATCH - Update appointment status
 */
export async function PATCH(
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
    const { status } = await req.json()

    if (!status || !['waiting', 'in-progress', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: waiting, in-progress, or done' },
        { status: 400 }
      )
    }

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    appointment.status = status
    await appointment.save()

    // 🔔 Real-time notification - notify all dashboards
    await pusherServer.trigger('appointments', 'appointment-updated', {
      appointmentId: appointment._id.toString(),
      queueNumber: appointment.queueNumber,
      status: appointment.status,
      updatedBy: session.user?.name || session.user?.email
    })

    return NextResponse.json({
      message: 'Status updated successfully',
      status: appointment.status
    })
  } catch (error) {
    console.error('PATCH /api/appointment/[id]/status error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
