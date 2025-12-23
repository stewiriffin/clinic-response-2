'use client'

import { AlertTriangle, X, Shield } from 'lucide-react'
import { useState } from 'react'

interface AllergyWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onOverride: (password: string) => void
  medicationName: string
  allergies: string[]
  patientName: string
}

export default function AllergyWarningModal({
  isOpen,
  onClose,
  onOverride,
  medicationName,
  allergies,
  patientName
}: AllergyWarningModalProps) {
  const [overridePassword, setOverridePassword] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleOverride = () => {
    if (!overridePassword.trim()) {
      setError('Override password required')
      return
    }
    onOverride(overridePassword)
    setOverridePassword('')
    setError('')
  }

  const handleClose = () => {
    setOverridePassword('')
    setError('')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
        {/* Modal */}
        <div className="bg-gradient-to-br from-red-900/90 via-red-800/90 to-red-900/90 backdrop-blur-xl border-2 border-red-500 rounded-2xl max-w-lg w-full shadow-2xl shadow-red-500/50 animate-scaleIn">
          {/* Header */}
          <div className="p-6 border-b border-red-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  ALLERGY ALERT
                </h2>
                <p className="text-red-200 text-sm">
                  Critical safety warning - Patient has known allergy
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-300 mb-1">Patient:</p>
              <p className="text-xl font-bold text-white">{patientName}</p>
            </div>

            {/* Medication Warning */}
            <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4">
              <p className="text-sm text-yellow-300 mb-2">Attempting to administer:</p>
              <p className="text-2xl font-bold text-yellow-100">{medicationName}</p>
            </div>

            {/* Known Allergies */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-300">KNOWN ALLERGIES:</p>
              <div className="space-y-2">
                {allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/40 rounded-lg"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-white font-medium">{allergy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-100 text-sm leading-relaxed">
                <strong className="text-red-300">WARNING:</strong> This medication may cause a severe allergic reaction.
                Proceeding requires supervisor authorization and override password.
              </p>
            </div>

            {/* Override Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-red-300">
                <Shield className="w-4 h-4 inline mr-2" />
                Supervisor Override Password
              </label>
              <input
                type="password"
                value={overridePassword}
                onChange={(e) => {
                  setOverridePassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter override password"
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
              />
              {error && (
                <p className="text-sm text-yellow-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-red-500/30 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              Cancel - Do Not Administer
            </button>
            <button
              onClick={handleOverride}
              className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Override & Proceed
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
