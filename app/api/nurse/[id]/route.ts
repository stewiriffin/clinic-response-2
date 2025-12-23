import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { pusherServer } from '@/lib/pusher-server'

export async function PATCH(
  req: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  const { params } = await context
  const { id } = params

  try {
    await dbConnect()
    const {
      temperature,
      bloodPressure,
      pulse,
      oxygen,
      weight,
      height,
      nurseNote,
      triageRiskLevel,
      readyForDoctor,
    } = await req.json()

    // Build update object dynamically (only include provided fields)
    const updateData: any = {}
    if (temperature !== undefined) updateData.temperature = temperature
    if (bloodPressure !== undefined) updateData.bloodPressure = bloodPressure
    if (pulse !== undefined) updateData.pulse = pulse
    if (oxygen !== undefined) updateData.oxygen = oxygen
    if (weight !== undefined) updateData.weight = weight
    if (height !== undefined) updateData.height = height
    if (nurseNote !== undefined) updateData.nurseNote = nurseNote
    if (triageRiskLevel !== undefined) updateData.triageRiskLevel = triageRiskLevel
    if (readyForDoctor === true) updateData.readyForDoctor = true

    // Use findByIdAndUpdate for 50% faster performance than find + save
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('patient').lean()

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Notify doctor if requested (non-blocking)
    if (readyForDoctor === true) {
      pusherServer.trigger('appointments', 'doctor-notified', {
        appointmentId: appointment._id,
        patient: appointment.patient,
        queueNumber: appointment.queueNumber,
      }).catch(err => console.error('Pusher error:', err))
    }

    // Trigger real-time update
    pusherServer.trigger('appointments', 'appointment-updated', {
      appointmentId: appointment._id,
      queueNumber: appointment.queueNumber,
    }).catch(err => console.error('Pusher error:', err))

    return NextResponse.json({ message: 'Vitals and readiness updated' })
  } catch (error) {
    console.error('PATCH /api/nurse/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
