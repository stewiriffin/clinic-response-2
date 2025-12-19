'use client'

import { useEffect, useState } from 'react'
import { Power, Lock, Save, AlertTriangle, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface SystemSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
  signupLockdown: boolean
  lockdownMessage: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    maintenanceMessage: 'System is currently under maintenance. Please check back later.',
    signupLockdown: false,
    lockdownMessage: 'New signups are currently disabled.',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof SystemSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleMessageChange = (key: 'maintenanceMessage' | 'lockdownMessage', value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast.success('Settings saved successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="mt-1 text-slate-400">
            Configure system-wide controls and emergency switches
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Warning Banner */}
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <div>
            <h3 className="font-semibold text-orange-400">Emergency Controls</h3>
            <p className="mt-1 text-sm text-orange-300/70">
              These settings affect all users system-wide. Use with caution. Changes take effect immediately after saving.
            </p>
          </div>
        </div>
      </div>

      {/* System Controls */}
      <div className="space-y-6">
        {/* Maintenance Mode */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-3 ${settings.maintenanceMode ? 'bg-orange-500/10' : 'bg-slate-800'}`}>
                <Power className={`h-6 w-6 ${settings.maintenanceMode ? 'text-orange-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Maintenance Mode</h3>
                <p className="mt-1 text-sm text-slate-400">
                  When enabled, all non-admin users will be redirected to a maintenance page
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('maintenanceMode')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-orange-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Maintenance Message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Maintenance Message
            </label>
            <textarea
              value={settings.maintenanceMessage}
              onChange={(e) => handleMessageChange('maintenanceMessage', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Enter maintenance message..."
            />
          </div>

          {/* Status Badge */}
          {settings.maintenanceMode && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              MAINTENANCE MODE ACTIVE
            </div>
          )}
        </div>

        {/* Signup Lockdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-3 ${settings.signupLockdown ? 'bg-red-500/10' : 'bg-slate-800'}`}>
                <Lock className={`h-6 w-6 ${settings.signupLockdown ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Signup Lockdown</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Prevents new user registrations. Existing users can still log in.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('signupLockdown')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.signupLockdown ? 'bg-red-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.signupLockdown ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Lockdown Message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Lockdown Message
            </label>
            <textarea
              value={settings.lockdownMessage}
              onChange={(e) => handleMessageChange('lockdownMessage', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Enter lockdown message..."
            />
          </div>

          {/* Status Badge */}
          {settings.signupLockdown && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400">
              <Lock className="h-4 w-4" />
              SIGNUPS DISABLED
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-400">Security Notice</h3>
              <p className="mt-1 text-sm text-blue-300/70">
                All system setting changes are logged in the audit log. Only SuperAdmins can access this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
