export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { pusherServer } from '@/lib/pusher-server'

// Use correct inline typing for params context
export async function DELETE(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { id } = params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: 'Invalid appointment ID' },
      { status: 400 }
    )
  }

  try {
    await dbConnect()

    const deleted = await Appointment.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    await pusherServer.trigger('bookings', 'appointment-deleted', {
      appointmentId: id,
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
