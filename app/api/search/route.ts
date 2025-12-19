import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

/**
 * GET - Global patient search
 * Searches across patient names, phone numbers, and queue numbers
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = query.trim()

    // Build search criteria
    const searchCriteria: any = {
      $or: []
    }

    // Check if query is a number (queue number or phone)
    if (/^\d+$/.test(searchTerm)) {
      searchCriteria.$or.push({ queueNumber: parseInt(searchTerm) })
    }

    // Search in populated patient data
    const appointments = await Appointment.find()
      .populate('patient')
      .lean()

    // Filter appointments based on search term
    const filtered = appointments.filter((appointment: any) => {
      const patient = appointment.patient

      if (!patient) return false

      const fullNameMatch = patient.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())

      const phoneMatch = patient.phone?.includes(searchTerm)

      const queueMatch = appointment.queueNumber?.toString() === searchTerm

      return fullNameMatch || phoneMatch || queueMatch
    })

    // Format results
    const results = filtered.slice(0, 10).map((appointment: any) => ({
      _id: appointment._id.toString(),
      type: 'appointment',
      fullName: appointment.patient?.fullName || 'Unknown',
      phone: appointment.patient?.phone || 'N/A',
      queueNumber: appointment.queueNumber,
      status: appointment.status,
      reason: appointment.patient?.reason,
      triageRiskLevel: appointment.triageRiskLevel,
      patient: {
        _id: appointment.patient?._id?.toString(),
        fullName: appointment.patient?.fullName,
        phone: appointment.patient?.phone,
        doctorType: appointment.patient?.doctorType,
        reason: appointment.patient?.reason,
        email: appointment.patient?.email,
        allergies: appointment.patient?.allergies || [],
        bloodType: appointment.patient?.bloodType,
      }
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('GET /api/search error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
