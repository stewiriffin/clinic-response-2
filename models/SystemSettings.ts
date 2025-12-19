import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISystemSettings extends Document {
  maintenanceMode: boolean
  maintenanceMessage: string
  signupLockdown: boolean
  lockdownMessage: string
  updatedBy: string // Admin email who made the change
  updatedAt: Date
}

const SystemSettingsSchema: Schema<ISystemSettings> = new Schema({
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: 'System is currently under maintenance. Please check back later.',
  },
  signupLockdown: {
    type: Boolean,
    default: false,
  },
  lockdownMessage: {
    type: String,
    default: 'New signups are currently disabled.',
  },
  updatedBy: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
})

// Ensure only one settings document exists (Singleton pattern)
SystemSettingsSchema.index({ _id: 1 }, { unique: true })

const SystemSettings: Model<ISystemSettings> =
  mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema)

export default SystemSettings

// Helper function to get or create settings
export async function getSystemSettings(): Promise<ISystemSettings> {
  let settings = await SystemSettings.findOne()

  if (!settings) {
    // Create default settings if none exist
    settings = await SystemSettings.create({
      maintenanceMode: false,
      signupLockdown: false,
    })
  }

  return settings
}
