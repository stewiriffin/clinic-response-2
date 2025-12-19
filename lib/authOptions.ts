// lib/authOptions.ts
import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import Patient from '@/models/Patient'
import User from '@/models/User'

// Define the shape of user returned from MongoDB .lean()
type LeanUser = {
  _id: string
  fullName?: string
  email: string
  password: string
  role?: string
  adminRole?: 'SuperAdmin' | 'Moderator' | 'Support'
  isBanned?: boolean
}

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        await dbConnect()
        const { email, password, role } = credentials ?? {}
        if (!email || !password || !role) throw new Error('Missing fields')

        let user: LeanUser | null = null

        if (role === 'patient') {
          user = await Patient.findOne({ email }).lean<LeanUser>()
          if (!user) throw new Error('No patient found')
        } else {
          user = await User.findOne({ email }).lean<LeanUser>()
          if (!user) throw new Error('No user found')
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) throw new Error('Wrong password')

        // Check if user is banned
        if (user.isBanned) throw new Error('Account has been banned')

        return {
          id: user._id.toString(),
          name: user.fullName || 'User',
          email: user.email,
          role: user.role || role,
          adminRole: user.adminRole || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) Object.assign(token, user)
      return token
    },
    async session({ session, token }) {
      if (session?.user) Object.assign(session.user, token)
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
