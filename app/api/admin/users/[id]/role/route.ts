import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { createAuditLog } from '@/lib/auditLog'
import { pusherServer } from '@/lib/pusher-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    await dbConnect()

    const { role } = await req.json()

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    const validRoles = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Technician']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const previousRole = user.role
    user.role = role
    await user.save()

    // AUDIT LOG
    await createAuditLog({
      adminId: token.sub!,
      adminEmail: token.email!,
      adminName: token.name || 'Admin',
      action: `Changed user role from ${previousRole} to ${role}`,
      actionType: role === 'Admin' ? 'promote' : 'update',
      targetType: 'user',
      targetId: user._id.toString(),
      targetEmail: user.email,
      targetName: user.fullName,
      details: `User ${user.email} role changed from ${previousRole} to ${role}`,
      severity: role === 'Admin' ? 'critical' : 'medium',
      req
    })

    // Real-time notification
    await pusherServer.trigger('users', 'user-updated', {
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      previousRole,
      updateType: 'role-change'
    })

    return NextResponse.json({
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
