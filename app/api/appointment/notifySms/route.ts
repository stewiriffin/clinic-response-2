// app/api/appointment/notifySms/route.ts

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { rateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rateLimiter'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

// Helper to normalize phone numbers (Kenya)
function formatPhone(phone: string): string {
  if (!phone.startsWith('+')) {
    return '+254' + phone.replace(/^0/, '')
  }
  return phone
}

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting to prevent SMS spam
    const identifier = getClientIdentifier(req)
    const rateLimitResponse = rateLimit(identifier, RateLimitPresets.NOTIFICATION)

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { to, body } = await req.json()

    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing phone or message' },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      body,
      to: formatPhone(to), // Format number to international E.164 format
      from: process.env.TWILIO_PHONE_NUMBER!, // Must be a Twilio-verified number
    })

    console.log('✅ SMS sent:', message.sid)
    return NextResponse.json({ success: true, sid: message.sid })
  } catch (error: any) {
    console.error('❌ SMS error:', error)
    return NextResponse.json(
      { error: error.message || 'SMS sending failed' },
      { status: 500 }
    )
  }
}
