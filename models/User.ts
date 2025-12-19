import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  role:
    | 'Admin'
    | 'Doctor'
    | 'Nurse'
    | 'Pharmacist'
    | 'Lab technician'
    | 'Receptionist'
  fullName: string
  adminRole?: 'SuperAdmin' | 'Moderator' | 'Support' // Admin sub-role for RBAC
  isBanned?: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      'Admin',
      'Doctor',
      'Nurse',
      'Pharmacist',
      'Lab technician',
      'Receptionist',
    ],
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  adminRole: {
    type: String,
    enum: ['SuperAdmin', 'Moderator', 'Support'],
    required: false,
    default: null,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
})

// 🔐 Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// 🔍 Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// 🚀 Performance indexes for frequently queried fields
// Note: email index is automatically created by unique: true
UserSchema.index({ role: 1 }) // Filter by role
UserSchema.index({ createdAt: -1 }) // Sort and filter by creation date (descending)

// 📦 Export model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
