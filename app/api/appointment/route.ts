export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Patient from '@/models/Patient'
import { rateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rateLimiter'
import { sanitizeName, sanitizePhone, sanitizeEmail, sanitizeText, isSafeInput } from '@/lib/sanitize'
import { apiLogger, logError } from '@/lib/logger'

// ✅ Optional: Define a lean interface for queueNumber
interface AppointmentLean {
  queueNumber?: number
}

// Validation schema
const appointmentSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.union([
    z.string().email('Invalid email').max(255),
    z.literal(''),
  ]).optional(),
  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason too long'),
  doctorType: z.string()
    .min(1, 'Doctor type required')
    .max(100),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(req)
    const rateLimitResponse = rateLimit(identifier, RateLimitPresets.BOOKING)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    await dbConnect()
    const data = await req.json()

    // Sanitize inputs
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

    // Validate with Zod
    const result = appointmentSchema.safeParse(sanitizedData)
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.errors },
        { status: 400 }
      )
    }

    // ✅ Save patient
    const patient = await Patient.create(result.data)

    // Destructure validated data
    const { email, phone, fullName, doctorType, reason } = result.data

    // ✅ Fix TypeScript error with typed lean()
    const last = await Appointment.findOne()
      .sort({ queueNumber: -1 })
      .lean<AppointmentLean>()
    const nextQueue = last?.queueNumber ? last.queueNumber + 1 : 1

    // ✅ Create appointment
    await Appointment.create({
      patient: patient._id,
      queueNumber: nextQueue,
    })

    // ✅ Optional email notification
    if (email) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/appointment/notifyEmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Appointment Confirmation',
            text: `Hello ${fullName}, your appointment is confirmed.\nQueue No: ${nextQueue}\nDoctor: ${doctorType}\nReason: ${reason}`,
          }),
        })
      } catch (emailErr) {
        logError(emailErr, 'Email notification', { email, queueNumber: nextQueue })
      }
    }

    // ✅ Optional SMS notification
    if (phone) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/appointment/notifySms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            body: `Hi ${fullName}, your clinic appointment is confirmed.\nQueue No: ${nextQueue}.`,
          }),
        })
      } catch (smsErr) {
        logError(smsErr, 'SMS notification', { phone, queueNumber: nextQueue })
      }
    }

    apiLogger.info({
      queueNumber: nextQueue,
      patientId: patient._id.toString(),
      doctorType,
    }, 'Appointment created')

    return NextResponse.json({ queueNumber: nextQueue }, { status: 201 })
  } catch (error) {
    logError(error, 'POST /api/appointment')
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Pagination support
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 items
    const skip = (page - 1) * limit

    const [appointments, total] = await Promise.all([
      Appointment.find()
        .populate('patient')
        .sort({ queueNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(),
    ])

    apiLogger.info({
      count: appointments.length,
      page,
      limit,
      total,
    }, 'Fetched appointments')

    return NextResponse.json({
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logError(error, 'GET /api/appointment')
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
