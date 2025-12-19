import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId
  adminEmail: string
  adminName: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'ban' | 'promote' | 'reset_password' | 'alert' | 'other'
  targetType: 'user' | 'appointment' | 'system' | 'content'
  targetId?: string
  targetEmail?: string
  targetName?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const AuditLogSchema: Schema<IAuditLog> = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminEmail: {
    type: String,
    required: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    enum: ['create', 'update', 'delete', 'ban', 'promote', 'reset_password', 'alert', 'other'],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['user', 'appointment', 'system', 'content'],
    required: true,
  },
  targetId: {
    type: String,
  },
  targetEmail: {
    type: String,
  },
  targetName: {
    type: String,
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
})

// Indexes for efficient querying
AuditLogSchema.index({ adminId: 1, timestamp: -1 })
AuditLogSchema.index({ actionType: 1, timestamp: -1 })
AuditLogSchema.index({ timestamp: -1 })
AuditLogSchema.index({ targetId: 1 })

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

export default AuditLog
