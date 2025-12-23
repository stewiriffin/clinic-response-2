// pages/api/seed-users.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' })
  }

  try {
    await dbConnect()

    const users = [
      {
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'Admin',
        password: 'admin123',
      },
      {
        email: 'nurse@example.com',
        fullName: 'Nurse Jane',
        role: 'Nurse',
        password: 'nurse123',
      },
      {
        email: 'doctor@example.com',
        fullName: 'Dr. John Doe',
        role: 'Doctor',
        password: 'doctor123',
      },
      {
        email: 'pharmacist@example.com',
        fullName: 'Pharmacist Phil',
        role: 'Pharmacist',
        password: 'pharm123',
      },
      {
        email: 'labtech@example.com',
        fullName: 'Lab Tech Larry',
        role: 'Lab technician',
        password: 'lab123',
      },
      {
        email: 'reception@example.com',
        fullName: 'Receptionist Rachel',
        role: 'Receptionist',
        password: 'recep123',
      },
    ]

    for (const user of users) {
      // Optional: Remove existing user to reseed
      await User.deleteOne({ email: user.email })

      // Create new user and trigger bcrypt hash via schema
      const newUser = new User(user)
      await newUser.save()
    }

    res.status(201).json({ message: 'Users seeded successfully' })
  } catch (error) {
    console.error('Error seeding users:', error)
    res.status(500).json({ message: 'Error creating users', error })
  }
}
