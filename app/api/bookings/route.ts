export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Patient from '@/models/Patient'
import { pusherServer } from '@/lib/pusher-server'

// ✅ Schema to validate booking form input
const bookingSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  reason: z.string().min(1, 'Reason is required'),
  doctorType: z.string().min(1, 'Doctor is required'),
})

// ✅ GET: Fetch bookings with optional search filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')
    const status = searchParams.get('status')

    const allowedStatuses = ['waiting', 'in-progress', 'done']
    const filter: any = {}

    // Apply status filter if valid
    if (status && allowedStatuses.includes(status)) {
      filter.status = status
    }

    // Build populate options
    const populateOptions: any = {
      path: 'patient',
      select: 'fullName email phone reason doctorType',
    }

    // Only apply .match if filters provided
    if (name || phone) {
      populateOptions.match = {}
      if (name) {
        populateOptions.match.fullName = { $regex: name, $options: 'i' }
      }
      if (phone) {
        populateOptions.match.phone = phone
      }
    }

    // Fetch appointments and populate patient info
    const bookings = await Appointment.find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 })

    // Only include those with matched patients
    const filtered = bookings.filter((b) => b.patient)

    return NextResponse.json({ data: filtered })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// ✅ POST: Create a new booking
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = bookingSchema.safeParse(data)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.errors }, { status: 400 })
    }

    await dbConnect()

    // Create patient
    const patient = await Patient.create(result.data)

    // Determine next queue number
    const count = await Appointment.countDocuments()

    // Create appointment linked to the patient
    const appointment = await Appointment.create({
      patient: patient._id,
      queueNumber: count + 1,
      status: 'waiting',
      doctorType: result.data.doctorType,
    })

    // 🔔 Trigger real-time notification
    await pusherServer.trigger('bookings', 'new-booking', {
      message: 'New booking added',
      appointmentId: appointment._id,
      queueNumber: appointment.queueNumber,
      status: appointment.status,
      patient,
    })

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        data: {
          appointmentId: appointment._id,
          queueNumber: appointment.queueNumber,
          status: appointment.status,
          patient,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json(
      { error: 'Server error during booking' },
      { status: 500 }
    )
  }
}
