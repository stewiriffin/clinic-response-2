import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token || token.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { title, message, type, targetRole } = await req.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Build query for target users
    const query = targetRole === 'all' ? {} : { role: targetRole }

    // Get target users
    const users = await User.find(query).select('email fullName').lean()

    // In a real application, you would:
    // 1. Store the alert in a database (create an Alerts collection)
    // 2. Send emails/SMS/push notifications to users
    // 3. Create in-app notifications

    // For now, we'll just log and return success
    console.log(`Broadcasting alert to ${users.length} users:`, {
      title,
      message,
      type,
      targetRole,
      recipients: users.length
    })

    // TODO: Implement actual notification sending logic here
    // - Email notifications via nodemailer or SendGrid
    // - SMS via Twilio
    // - Push notifications via Firebase Cloud Messaging
    // - Store in database for in-app display

    return NextResponse.json({
      message: 'Alert broadcast successfully',
      recipientCount: users.length,
      alert: {
        title,
        message,
        type,
        targetRole,
        sentAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error broadcasting alert:', error)
    return NextResponse.json(
      { error: 'Failed to broadcast alert' },
      { status: 500 }
    )
  }
}
