// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import connectToDatabase from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/utils/jwt'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' })
  }

  const { email, password, role } = req.body

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: 'Email, password, and role are required' })
  }

  await connectToDatabase()

  const user = await User.findOne({ email, role }) // Match email + role
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or role' })
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' })
  }

  const token = signToken({ userId: user._id, role: user.role })

  res.status(200).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  })
}
