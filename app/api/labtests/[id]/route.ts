import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LabTest from '@/models/LabTest'
import { pusherServer } from '@/lib/pusher-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const body = await req.json()
    const updated = await LabTest.findByIdAndUpdate(params.id, body, {
      new: true,
    })

    // Optional: Notify doctor when result is added
    if (body.result) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/notify-doctor`, {
        method: 'POST',
        body: JSON.stringify({
          message: `Result ready for ${updated.patientName}`,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Trigger real-time update for lab test update
    await pusherServer.trigger('lab-tests', 'lab-test-updated', {
      testId: updated._id.toString(),
      patientName: updated.patientName,
      testType: updated.testType,
      status: updated.status,
      result: updated.result,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const deleted = await LabTest.findByIdAndDelete(params.id)

    if (!deleted) {
      return NextResponse.json({ error: 'Lab test not found' }, { status: 404 })
    }

    // Trigger real-time update for lab test deletion
    await pusherServer.trigger('lab-tests', 'lab-test-deleted', {
      testId: params.id,
      patientName: deleted.patientName,
      testType: deleted.testType,
    })

    return NextResponse.json({ message: 'Lab test deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    )
  }
}
