import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { createAuditLog } from '@/lib/auditLog'
import { checkAdminPermission } from '@/lib/apiPermissions'
import { Permissions } from '@/lib/permissions'
import { pusherServer } from '@/lib/pusher-server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check DELETE_USERS permission
    const permissionCheck = await checkAdminPermission(req, Permissions.DELETE_USERS)
    if (!permissionCheck.authorized) {
      return permissionCheck.response!
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    await dbConnect()

    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userInfo = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }

    // Delete user
    await User.findByIdAndDelete(params.id)

    // AUDIT LOG
    await createAuditLog({
      adminId: token.sub!,
      adminEmail: token.email!,
      adminName: token.name || 'Admin',
      action: 'Deleted user',
      actionType: 'delete',
      targetType: 'user',
      targetId: userInfo.id,
      targetEmail: userInfo.email,
      targetName: userInfo.fullName,
      details: `Deleted user ${userInfo.email} (${userInfo.role})`,
      severity: 'critical',
      req
    })

    // Real-time notification
    await pusherServer.trigger('users', 'user-deleted', {
      userId: userInfo.id,
      email: userInfo.email,
      fullName: userInfo.fullName,
      role: userInfo.role
    })

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: userInfo
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
