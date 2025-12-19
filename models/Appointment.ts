import mongoose, { Schema } from 'mongoose'

const AppointmentSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    queueNumber: { type: Number, required: false, default: null },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'done'],
      default: 'waiting',
    },
    labTest: { type: String, default: '' }, // ✅ single string field
    prescription: { type: String, default: '' }, // ✅ single string field
    diagnosis: { type: String, default: '' }, // ✅ single string field
    doctorNote: { type: String, default: '' }, // ✅ single string field
    readyForDoctor: { type: Boolean, default: false },
    temperature: String,
    bloodPressure: String,
    pulse: String,
    oxygen: String,
    weight: String,
    height: String,
    nurseNote: String,
    triageRiskLevel: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' },
    orders: [{
      description: String,
      completed: { type: Boolean, default: false },
      completedBy: String,
      completedAt: Date,
      createdAt: { type: Date, default: Date.now }
    }],
    vitalsHistory: [{
      temperature: String,
      bloodPressure: String,
      pulse: String,
      oxygen: String,
      recordedAt: { type: Date, default: Date.now },
      recordedBy: String
    }],

    dispensed: { type: Boolean, default: false },
    pharmacistNote: { type: String },
    dispensedBy: { type: String },
    dispensedAt: { type: Date },
  },
  { timestamps: true }
)

// 🚀 Performance indexes for frequently queried fields
AppointmentSchema.index({ queueNumber: 1 }) // Unique queue number lookup
AppointmentSchema.index({ status: 1 }) // Filter by status
AppointmentSchema.index({ patient: 1 }) // Join with patient data
AppointmentSchema.index({ createdAt: -1 }) // Sort by most recent
AppointmentSchema.index({ status: 1, createdAt: -1 }) // Compound index for filtered sorting
AppointmentSchema.index({ dispensed: 1, status: 1 }) // Pharmacist queries

export default mongoose.models.Appointment ||
  mongoose.model('Appointment', AppointmentSchema)
