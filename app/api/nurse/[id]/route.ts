import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Pusher from 'pusher'

// Optional: Realtime doctor notification
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

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
      readyForDoctor, // 🆕 added
    } = await req.json()

    const appointment = await Appointment.findById(id).populate('patient')
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Update vitals if present
    if (temperature !== undefined) appointment.temperature = temperature
    if (bloodPressure !== undefined) appointment.bloodPressure = bloodPressure
    if (pulse !== undefined) appointment.pulse = pulse
    if (oxygen !== undefined) appointment.oxygen = oxygen
    if (weight !== undefined) appointment.weight = weight
    if (height !== undefined) appointment.height = height
    if (nurseNote !== undefined) appointment.nurseNote = nurseNote
    if (triageRiskLevel !== undefined) appointment.triageRiskLevel = triageRiskLevel

    // ✅ Notify doctor if requested
    if (readyForDoctor === true) {
      appointment.readyForDoctor = true

      // Optional: Notify doctor in real-time
      await pusher.trigger('appointments', 'doctor-notified', {
        appointmentId: appointment._id,
        patient: appointment.patient,
        queueNumber: appointment.queueNumber,
      })
    }

    await appointment.save()

    return NextResponse.json({ message: 'Vitals and readiness updated' })
  } catch (error) {
    console.error('PATCH /api/nurse/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
