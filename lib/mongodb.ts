import mongoose, { Mongoose } from 'mongoose'
import { dbLogger, logError } from './logger'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

declare global {
  var mongoose: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  }
}

global.mongoose = global.mongoose || { conn: null, promise: null }

const cached = global.mongoose
let eventHandlersAttached = false

function attachEventHandlers() {
  if (eventHandlersAttached) return
  eventHandlersAttached = true

  mongoose.connection.on('connected', () => {
    dbLogger.info('MongoDB connected successfully')
  })

  mongoose.connection.on('error', (err) => {
    logError(err, 'MongoDB connection error')
  })

  mongoose.connection.on('disconnected', () => {
    dbLogger.warn('MongoDB disconnected')
  })

  process.on('SIGINT', async () => {
    await mongoose.connection.close()
    dbLogger.info('MongoDB connection closed due to app termination')
    process.exit(0)
  })
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4,
      connectTimeoutMS: 5000,
      maxIdleTimeMS: 60000,
    }

    attachEventHandlers()

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        dbLogger.info({
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        }, 'MongoDB connection established')
        return mongoose
      })
      .catch((error) => {
        logError(error, 'MongoDB connection failed')
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Check if database is connected
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1
}

/**
 * Get connection status
 */
export function getConnectionStatus(): string {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  return states[mongoose.connection.readyState] || 'unknown'
}

export default dbConnect
export {}
