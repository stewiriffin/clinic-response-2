import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Appointment from '@/models/Appointment'

export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    await dbConnect()

    // Run all queries in parallel for better performance
    const [totalUsers, totalAppointments, pendingAppointments] = await Promise.all([
      User.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        status: { $in: ['pending', 'waiting'] }
      })
    ])

    // Active users in last 24 hours (simplified - you may want to add a lastActive field to User model)
    const activeToday = Math.floor(totalUsers * 0.3) // Placeholder

    // Growth calculations (placeholder - you'd compare with previous period in production)
    const userGrowth = '+12%'
    const appointmentGrowth = '+8%'

    return NextResponse.json({
      totalUsers,
      activeToday,
      totalAppointments,
      pendingAppointments,
      userGrowth,
      appointmentGrowth,
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
