// models/Patient.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IPatient extends Document {
  fullName: string
  email: string
  phone: string
  reason: string
  doctorType: string
  password?: string
  role: string
}

const PatientSchema = new Schema<IPatient>({
  fullName: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  reason: { type: String, required: true },
  doctorType: { type: String, required: true },
  role: { type: String, default: 'patient' },
  password: {
    type: String,
    required: function (this: IPatient) {
      return this.role !== 'patient'
    },
  },
})

const Patient =
  mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema)

export default Patient
