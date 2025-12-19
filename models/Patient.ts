import mongoose, { Schema, Document } from 'mongoose'

export interface IPatient extends Document {
  fullName: string
  email?: string
  phone: string
  reason: string
  doctorType: string
  password?: string
  role: string
  allergies?: string[]
  bloodType?: string
  chronicConditions?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

const PatientSchema = new Schema<IPatient>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: false, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true, maxlength: 10 },
  reason: { type: String, required: true },
  doctorType: { type: String, required: true },
  role: { type: String, default: 'patient' },
  password: {
    type: String,
    required: function (this: IPatient) {
      return this.role !== 'patient'
    },
  },
  allergies: [{ type: String, trim: true }],
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
  chronicConditions: [{ type: String, trim: true }],
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true }
  }
})

// 🚀 Performance indexes for frequently queried fields
PatientSchema.index({ phone: 1 }) // Phone number lookup (queue status checks)
PatientSchema.index({ email: 1 }, { sparse: true }) // Email lookup for patient login
PatientSchema.index({ fullName: 'text' }) // Text search for patient names

const Patient =
  mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema)

export default Patient
