'use client'

import { useState } from 'react'
import { Bell, Send, Check, AlertCircle, Loader2 } from 'lucide-react'

export default function SystemAlertsPage() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetRole: 'all'
  })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.title || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    setSending(true)

    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSuccess(true)
        setFormData({
          title: '',
          message: '',
          type: 'info',
          targetRole: 'all'
        })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send alert')
      }
    } catch (error) {
      console.error('Error sending alert:', error)
      setError('An error occurred while sending the alert')
    } finally {
      setSending(false)
    }
  }

  const alertTypes = [
    { value: 'info', label: 'Information', color: 'blue' },
    { value: 'warning', label: 'Warning', color: 'orange' },
    { value: 'success', label: 'Success', color: 'green' },
    { value: 'error', label: 'Error', color: 'red' },
  ]

  const targetRoles = [
    { value: 'all', label: 'All Users' },
    { value: 'Admin', label: 'Administrators Only' },
    { value: 'Doctor', label: 'Doctors Only' },
    { value: 'Nurse', label: 'Nurses Only' },
    { value: 'Pharmacist', label: 'Pharmacists Only' },
    { value: 'Lab technician', label: 'Lab Technicians Only' },
    { value: 'Receptionist', label: 'Receptionists Only' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">System Alerts</h1>
        <p className="mt-1 text-slate-400">
          Broadcast important notifications to users
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Broadcast Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Bell className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Broadcast Alert</h2>
                <p className="text-sm text-slate-400">Send notifications to users</p>
              </div>
            </div>

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                <Check className="h-5 w-5 flex-shrink-0 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">Alert sent successfully!</p>
                  <p className="mt-1 text-sm text-green-300/80">
                    The notification has been broadcast to all targeted users.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold text-red-400">Error</p>
                  <p className="mt-1 text-sm text-red-300/80">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alert Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-2">
                  Alert Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., System Maintenance Scheduled"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  disabled={sending}
                />
              </div>

              {/* Alert Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-300 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  disabled={sending}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {formData.message.length} characters
                </p>
              </div>

              {/* Alert Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-slate-300 mb-2">
                  Alert Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  disabled={sending}
                >
                  {alertTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Role */}
              <div>
                <label htmlFor="targetRole" className="block text-sm font-semibold text-slate-300 mb-2">
                  Target Audience
                </label>
                <select
                  id="targetRole"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  disabled={sending}
                >
                  {targetRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Broadcast Alert
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview & Guidelines */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Preview
            </h3>
            <div className={`rounded-lg border p-4 ${
              formData.type === 'info' ? 'border-blue-500/20 bg-blue-500/10' :
              formData.type === 'warning' ? 'border-orange-500/20 bg-orange-500/10' :
              formData.type === 'success' ? 'border-green-500/20 bg-green-500/10' :
              'border-red-500/20 bg-red-500/10'
            }`}>
              <p className="font-semibold text-white">
                {formData.title || 'Alert Title'}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {formData.message || 'Your message will appear here...'}
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Best Practices
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <Check className="h-4 w-4 flex-shrink-0 text-green-400" />
                <span>Keep messages clear and concise</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 flex-shrink-0 text-green-400" />
                <span>Use appropriate alert type for context</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 flex-shrink-0 text-green-400" />
                <span>Target specific roles when possible</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 flex-shrink-0 text-green-400" />
                <span>Avoid excessive notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
