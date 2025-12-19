import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import SystemSettings, { getSystemSettings } from '@/models/SystemSettings'
import { createAuditLog } from '@/lib/auditLog'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    await dbConnect()
    const settings = await getSystemSettings()

    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      signupLockdown: settings.signupLockdown,
      lockdownMessage: settings.lockdownMessage,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const { maintenanceMode, maintenanceMessage, signupLockdown, lockdownMessage } = await req.json()

    await dbConnect()
    let settings = await SystemSettings.findOne()

    if (!settings) {
      settings = await SystemSettings.create({
        maintenanceMode,
        maintenanceMessage,
        signupLockdown,
        lockdownMessage,
        updatedBy: token.email!,
      })
    } else {
      settings.maintenanceMode = maintenanceMode
      settings.maintenanceMessage = maintenanceMessage
      settings.signupLockdown = signupLockdown
      settings.lockdownMessage = lockdownMessage
      settings.updatedBy = token.email!
      await settings.save()
    }

    // Audit log
    await createAuditLog({
      adminId: token.sub!,
      adminEmail: token.email!,
      adminName: token.name || 'Admin',
      action: 'Updated system settings',
      actionType: 'update',
      targetType: 'system',
      details: `Maintenance: ${maintenanceMode}, Signup Lockdown: ${signupLockdown}`,
      severity: 'critical',
      req
    })

    return NextResponse.json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      signupLockdown: settings.signupLockdown,
      lockdownMessage: settings.lockdownMessage,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
