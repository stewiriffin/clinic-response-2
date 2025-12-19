import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

/**
 * POST - Add a new order/task to an appointment
 */
export async function POST(
  req: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  const { params } = await context
  const { id } = params

  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'Nurse' && session.user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { description } = await req.json()

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Order description is required' },
        { status: 400 }
      )
    }

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Add new order
    appointment.orders.push({
      description: description.trim(),
      completed: false,
      createdAt: new Date()
    })

    await appointment.save()

    return NextResponse.json({
      message: 'Order added successfully',
      order: appointment.orders[appointment.orders.length - 1]
    })
  } catch (error) {
    console.error('POST /api/nurse/[id]/orders error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update an order (mark complete/incomplete)
 */
export async function PATCH(
  req: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  const { params } = await context
  const { id } = params

  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'Nurse' && session.user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { orderId, completed, completedBy } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Find and update the order
    const order = appointment.orders.id(orderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    order.completed = completed
    if (completed) {
      order.completedBy = completedBy || session.user.name
      order.completedAt = new Date()
    } else {
      order.completedBy = undefined
      order.completedAt = undefined
    }

    await appointment.save()

    return NextResponse.json({
      message: 'Order updated successfully',
      order
    })
  } catch (error) {
    console.error('PATCH /api/nurse/[id]/orders error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
