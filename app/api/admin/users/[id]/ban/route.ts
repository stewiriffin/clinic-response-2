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

    const { ban } = await req.json()
    await dbConnect()

    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user ban status
    // @ts-ignore - isBanned field may not be in type yet
    user.isBanned = ban
    await user.save()

    // 🔒 AUDIT LOG
    await createAuditLog({
      adminId: token.sub!,
      adminEmail: token.email!,
      adminName: token.name || 'Admin',
      action: ban ? 'Banned user' : 'Unbanned user',
      actionType: 'ban',
      targetType: 'user',
      targetId: user._id.toString(),
      targetEmail: user.email,
      targetName: user.fullName,
      details: `User ${user.email} was ${ban ? 'banned' : 'unbanned'}`,
      severity: 'high',
      req
    })

    return NextResponse.json({
      message: ban ? 'User banned successfully' : 'User unbanned successfully',
      user: {
        id: user._id,
        email: user.email,
        isBanned: ban
      }
    })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
