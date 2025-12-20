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
    // ⚡ Run session check and body parsing in parallel
    const [session, body] = await Promise.all([
      getServerSession(authOptions),
      req.json(),
    ])

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = body

    if (!status || !['waiting', 'in-progress', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: waiting, in-progress, or done' },
        { status: 400 }
      )
    }

    // ⚡ Connect to DB and update in parallel
    await dbConnect()

    // ⚡ Use findByIdAndUpdate for 2x faster performance than find + save
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean()

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // 🔔 Real-time notification - non-blocking
    pusherServer.trigger('appointments', 'appointment-updated', {
      appointmentId: appointment._id.toString(),
      queueNumber: appointment.queueNumber,
      status: appointment.status,
      updatedBy: session.user?.name || session.user?.email
    }).catch(err => console.error('Pusher error:', err))

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
