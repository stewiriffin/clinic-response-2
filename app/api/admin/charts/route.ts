import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Appointment from '@/models/Appointment'
import { subDays, format, startOfDay, endOfDay, subMonths } from 'date-fns'

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

    // User Growth Data (Last 30 days) - Optimized with aggregation
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 29))

    const userGrowthAggregation = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Create a map for quick lookup
    const userCountMap = new Map(
      userGrowthAggregation.map(item => [item._id, item.count])
    )

    // Fill in all 30 days (including days with 0 users)
    const userGrowthData = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateKey = format(date, 'yyyy-MM-dd')
      userGrowthData.push({
        date: format(date, 'MMM dd'),
        users: userCountMap.get(dateKey) || 0
      })
    }

    // Appointment Volume (This month vs Last month)
    const thisMonthStart = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const lastMonthStart = subMonths(thisMonthStart, 1)
    const lastMonthEnd = subDays(thisMonthStart, 1)

    const [thisMonthCount, lastMonthCount] = await Promise.all([
      Appointment.countDocuments({
        createdAt: { $gte: thisMonthStart }
      }),
      Appointment.countDocuments({
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
      })
    ])

    const appointmentVolumeData = [
      {
        month: format(lastMonthStart, 'MMM'),
        previous: lastMonthCount,
        current: 0
      },
      {
        month: format(thisMonthStart, 'MMM'),
        previous: 0,
        current: thisMonthCount
      }
    ]

    // Activity Heatmap (Appointments by hour of day) - Real data
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7))

    const activityAggregation = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Create map for quick lookup
    const activityCountMap = new Map(
      activityAggregation.map(item => [item._id, item.count])
    )

    // Fill in all 24 hours
    const activityData = []
    for (let hour = 0; hour < 24; hour++) {
      activityData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activity: activityCountMap.get(hour) || 0
      })
    }

    return NextResponse.json({
      userGrowth: userGrowthData,
      appointmentVolume: appointmentVolumeData,
      activity: activityData
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
