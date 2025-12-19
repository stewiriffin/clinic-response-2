import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import AuditLog from '@/models/AuditLog'

export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const skip = (page - 1) * limit

    // Filters
    const actionType = searchParams.get('actionType')
    const severity = searchParams.get('severity')
    const adminEmail = searchParams.get('adminEmail')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    const query: any = {}
    if (actionType) query.actionType = actionType
    if (severity) query.severity = severity
    if (adminEmail) query.adminEmail = adminEmail
    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = new Date(startDate)
      if (endDate) query.timestamp.$lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ])

    // Get unique admins and action types for filters
    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          criticalActions: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          uniqueAdmins: { $addToSet: '$adminEmail' },
          actionTypes: { $addToSet: '$actionType' }
        }
      }
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        totalActions: 0,
        criticalActions: 0,
        uniqueAdmins: [],
        actionTypes: []
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
