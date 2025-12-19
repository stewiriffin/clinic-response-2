'use client'

import { X, User, Phone, Mail, Calendar, AlertTriangle, FileText, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PatientDrawerProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
}

export default function PatientDrawer({ isOpen, onClose, appointment }: PatientDrawerProps) {
  const [patientHistory, setPatientHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && appointment?.patient?._id) {
      fetchPatientHistory()
    }
  }, [isOpen, appointment])

  const fetchPatientHistory = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/patient/${appointment.patient._id}/history`)
      if (res.ok) {
        const data = await res.json()
        setPatientHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch patient history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 shadow-2xl z-50 overflow-y-auto border-l border-white/10">
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Patient Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {appointment?.patient?.fullName || 'Unknown Patient'}
                </h3>
                <p className="text-sm text-slate-400">
                  Queue #{appointment?.queueNumber || '-'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={appointment?.patient?.phone || 'N/A'}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={appointment?.patient?.email || 'Not provided'}
              />
              <InfoRow
                icon={<Activity className="w-4 h-4" />}
                label="Doctor Type"
                value={appointment?.patient?.doctorType || 'N/A'}
              />
            </div>
          </div>

          {/* Current Visit Reason */}
          <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-blue-300">Current Visit</h4>
            </div>
            <p className="text-white">{appointment?.patient?.reason || 'No reason provided'}</p>
          </div>

          {/* Vitals Summary */}
          {(appointment?.temperature || appointment?.bloodPressure) && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Current Vitals</h4>
              <div className="grid grid-cols-2 gap-3">
                {appointment.temperature && (
                  <VitalBadge label="Temp" value={`${appointment.temperature}°C`} />
                )}
                {appointment.bloodPressure && (
                  <VitalBadge label="BP" value={appointment.bloodPressure} />
                )}
                {appointment.pulse && (
                  <VitalBadge label="Pulse" value={`${appointment.pulse} bpm`} />
                )}
                {appointment.oxygen && (
                  <VitalBadge label="O2" value={`${appointment.oxygen}%`} />
                )}
              </div>
            </div>
          )}

          {/* Allergies Alert (Mock - would come from patient record) */}
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-300 mb-1">Allergies</h4>
                <p className="text-sm text-red-200">No known allergies on record</p>
              </div>
            </div>
          </div>

          {/* Visit History */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-white">Visit History</h4>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Loading history...</p>
            ) : patientHistory.length > 0 ? (
              <div className="space-y-3">
                {patientHistory.map((visit: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <p className="text-sm text-slate-300 font-medium">
                      {new Date(visit.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {visit.diagnosis || 'No diagnosis recorded'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No previous visits on record</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-slate-400">{icon}</div>
      <span className="text-slate-400 min-w-[80px]">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}

function VitalBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  )
}
