export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Patient from '@/models/Patient'
import { pusherServer } from '@/lib/pusher-server'
import { rateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rateLimiter'
import { sanitizeName, sanitizePhone, sanitizeEmail, sanitizeText, isSafeInput } from '@/lib/sanitize'
import { apiLogger, logError } from '@/lib/logger'

// Enhanced schema to validate booking form input
const bookingSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string()
    .regex(/^0[17]\d{8}$/, 'Phone must be 10 digits starting with 07 or 01')
    .refine((val) => val.length === 10, 'Phone number must be 10 digits'),
  email: z.union([
    z.string().email('Invalid email address').max(255, 'Email too long'),
    z.literal(''),
  ]).optional(),
  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .trim(),
  doctorType: z.string()
    .min(1, 'Doctor type is required')
    .max(100, 'Doctor type must not exceed 100 characters')
    .refine(
      (val) => ['General Practitioner', 'Pediatrician', 'Gynecologist', 'Dentist', 'Dermatologist'].includes(val),
      'Invalid doctor type selected'
    ),
})

// GET: Fetch bookings with optional search filters
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const name = searchParams.get('name')
  const phone = searchParams.get('phone')
  const status = searchParams.get('status')

  try {
    await dbConnect()

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

    apiLogger.info({ count: filtered.length }, 'Fetched bookings successfully')
    return NextResponse.json({ data: filtered })
  } catch (error) {
    logError(error, 'GET /api/bookings', { searchParams: { name, phone, status } })
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    // Apply rate limiting to prevent booking spam
    const identifier = getClientIdentifier(request)
    const rateLimitResponse = rateLimit(identifier, RateLimitPresets.BOOKING)

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const data = await request.json()

    // Sanitize inputs before validation
    const sanitizedData = {
      fullName: sanitizeName(data.fullName),
      phone: sanitizePhone(data.phone),
      email: data.email ? sanitizeEmail(data.email) : '',
      reason: sanitizeText(data.reason),
      doctorType: sanitizeText(data.doctorType),
    }

    // Check for malicious patterns
    if (!isSafeInput(sanitizedData.fullName) ||
        !isSafeInput(sanitizedData.reason) ||
        !isSafeInput(sanitizedData.doctorType)) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    const result = bookingSchema.safeParse(sanitizedData)

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

    // Trigger real-time notification
    await pusherServer.trigger('bookings', 'new-booking', {
      message: 'New booking added',
      appointmentId: appointment._id,
      queueNumber: appointment.queueNumber,
      status: appointment.status,
      patient,
    })

    apiLogger.info({
      appointmentId: appointment._id.toString(),
      queueNumber: appointment.queueNumber,
      patientPhone: patient.phone,
    }, 'Booking created successfully')

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
    logError(error, 'POST /api/bookings')
    return NextResponse.json(
      { error: 'Server error during booking' },
      { status: 500 }
    )
  }
}
