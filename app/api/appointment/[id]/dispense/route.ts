// app/api/appointment/[id]/dispense/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // Correct typing
) {
  await dbConnect()

  const { id } = params

  try {
    const body = await request.json()

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, body, {
      new: true,
    })

    if (!updatedAppointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedAppointment, { status: 200 })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
