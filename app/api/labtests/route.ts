import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LabTest from '@/models/LabTest'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { pusherServer } from '@/lib/pusher-server'

export async function GET() {
  try {
    await dbConnect()
    const tests = await LabTest.find().sort({ createdAt: -1 })
    return NextResponse.json(tests)
  } catch (error) {
    console.error('GET /api/labtests error:', error)
    return NextResponse.json({ error: 'Failed to load tests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const formData = await req.formData()
    const patientName = formData.get('patientName') as string
    const testType = formData.get('testType') as string
    const file = formData.get('file') as File | null

    if (!patientName || !testType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    let fileUrl = ''
    if (file && file.size > 0) {
      const ext = file.name.split('.').pop()
      const filename = `${uuid()}.${ext}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(uploadDir, filename), buffer)

      fileUrl = `/uploads/${filename}`
    }

    const newTest = await LabTest.create({
      patientName,
      testType,
      status: 'pending',
      fileUrl,
    })

    // Trigger real-time update for lab test creation
    await pusherServer.trigger('lab-tests', 'lab-test-created', {
      testId: newTest._id.toString(),
      patientName: newTest.patientName,
      testType: newTest.testType,
      status: newTest.status,
    })

    return NextResponse.json(newTest, { status: 201 })
  } catch (error) {
    console.error('POST /api/labtests error:', error)
    return NextResponse.json(
      { error: 'Failed to create lab test' },
      { status: 500 }
    )
  }
}
