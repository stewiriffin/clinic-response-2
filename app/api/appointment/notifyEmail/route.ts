import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { rateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rateLimiter'

export async function POST(req: NextRequest) {
  // Apply rate limiting to prevent email spam
  const identifier = getClientIdentifier(req)
  const rateLimitResponse = rateLimit(identifier, RateLimitPresets.NOTIFICATION)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { to, subject, text, html } = await req.json()
  if (!to || !subject || (!text && !html)) {
    return NextResponse.json({ error: 'Missing email fields' }, { status: 400 })
  }

  // SMTP transport settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })
    console.log('Email sent:', info.messageId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
  }
}
