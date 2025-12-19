'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Lock, X } from 'lucide-react'

interface SystemStatus {
  maintenanceMode: boolean
  signupLockdown: boolean
}

export function SystemStatusBanner() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/system/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching system status:', error)
    }
  }

  if (!status || dismissed) return null

  const hasActiveAlerts = status.maintenanceMode || status.signupLockdown

  if (!hasActiveAlerts) return null

  return (
    <div className="relative">
      {status.maintenanceMode && (
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Maintenance Mode Active</p>
              <p className="text-sm text-orange-100">
                All non-admin users are seeing the maintenance page
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {status.signupLockdown && !status.maintenanceMode && (
        <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5" />
            <div>
              <p className="font-semibold">Signup Lockdown Active</p>
              <p className="text-sm text-red-100">
                New user registrations are currently disabled
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
