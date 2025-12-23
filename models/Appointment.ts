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
    labTest: { type: String, default: '' },
    prescription: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    doctorNote: { type: String, default: '' },
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

/**
 * Performance indexes for frequently queried fields
 */
AppointmentSchema.index({ queueNumber: 1 })
AppointmentSchema.index({ status: 1 })
AppointmentSchema.index({ patient: 1 })
AppointmentSchema.index({ createdAt: -1 })
AppointmentSchema.index({ status: 1, createdAt: -1 })
AppointmentSchema.index({ status: 1, queueNumber: 1 })
AppointmentSchema.index({ dispensed: 1, status: 1 })
AppointmentSchema.index({ readyForDoctor: 1, status: 1 })
AppointmentSchema.index({ patient: 1, status: 1 })

export default mongoose.models.Appointment ||
  mongoose.model('Appointment', AppointmentSchema)
