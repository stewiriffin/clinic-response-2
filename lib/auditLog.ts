import { NextRequest } from 'next/server'
import AuditLog from '@/models/AuditLog'
import dbConnect from '@/lib/mongodb'

interface AuditLogParams {
  adminId: string
  adminEmail: string
  adminName: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'ban' | 'promote' | 'reset_password' | 'alert' | 'other'
  targetType: 'user' | 'appointment' | 'system' | 'content'
  targetId?: string
  targetEmail?: string
  targetName?: string
  details?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  req?: NextRequest
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await dbConnect()

    // Extract IP and user agent from request if provided
    const ipAddress = params.req?.headers.get('x-forwarded-for') ||
                     params.req?.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = params.req?.headers.get('user-agent') || 'unknown'

    const auditEntry = await AuditLog.create({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      adminName: params.adminName,
      action: params.action,
      actionType: params.actionType,
      targetType: params.targetType,
      targetId: params.targetId,
      targetEmail: params.targetEmail,
      targetName: params.targetName,
      details: params.details,
      ipAddress,
      userAgent,
      severity: params.severity || 'low',
      timestamp: new Date(),
    })

    return auditEntry
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main operation
    return null
  }
}
