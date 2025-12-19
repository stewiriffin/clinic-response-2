import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { createAuditLog } from '@/lib/auditLog'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await dbConnect()

    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'Admin') {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      )
    }

    const previousRole = user.role

    // Promote to admin
    user.role = 'Admin'
    await user.save()

    // 🔒 AUDIT LOG
    await createAuditLog({
      adminId: token.sub!,
      adminEmail: token.email!,
      adminName: token.name || 'Admin',
      action: 'Promoted user to Admin',
      actionType: 'promote',
      targetType: 'user',
      targetId: user._id.toString(),
      targetEmail: user.email,
      targetName: user.fullName,
      details: `User ${user.email} promoted from ${previousRole} to Admin`,
      severity: 'critical',
      req
    })

    return NextResponse.json({
      message: 'User promoted to Admin successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error promoting user:', error)
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    )
  }
}
