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

    // Generate a temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()

    // Set new password (will be hashed by pre-save hook)
    user.password = temporaryPassword
    await user.save()

    // 🔒 AUDIT LOG
    await createAuditLog({
      adminId: token.sub!,
      adminEmail: token.email!,
      adminName: token.name || 'Admin',
      action: 'Reset user password',
      actionType: 'reset_password',
      targetType: 'user',
      targetId: user._id.toString(),
      targetEmail: user.email,
      targetName: user.fullName,
      details: `Password reset for user ${user.email}`,
      severity: 'high',
      req
    })

    return NextResponse.json({
      message: 'Password reset successfully',
      temporaryPassword,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
