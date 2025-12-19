'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function MaintenancePage() {
  const [message, setMessage] = useState('System is currently under maintenance. Please check back later.')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaintenanceMessage()
  }, [])

  const fetchMaintenanceMessage = async () => {
    try {
      const res = await fetch('/api/system/status')
      if (res.ok) {
        const data = await res.json()
        if (data.maintenanceMessage) {
          setMessage(data.maintenanceMessage)
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance message:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    setLoading(true)
    const res = await fetch('/api/system/status')
    if (res.ok) {
      const { maintenanceMode } = await res.json()
      if (!maintenanceMode) {
        // Maintenance is off, reload the page
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-orange-500/10 p-6">
            <AlertTriangle className="h-16 w-16 text-orange-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-4xl font-bold text-white">
          Under Maintenance
        </h1>

        {/* Message */}
        <p className="mb-8 text-lg text-slate-400">
          {message}
        </p>

        {/* Status */}
        <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-500">
            We're working hard to improve our system. We'll be back online shortly.
          </p>
        </div>

        {/* Check Status Button */}
        <button
          onClick={checkStatus}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50 mx-auto"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Check Status'}
        </button>

        {/* Footer */}
        <p className="mt-12 text-sm text-slate-600">
          Thank you for your patience
        </p>
      </div>
    </div>
  )
}
