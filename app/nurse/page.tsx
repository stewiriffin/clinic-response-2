'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Heart, Bell, LogOut, Menu, X, Search, AlertCircle,
  Clock, Phone, ChevronRight, Users, ClipboardCheck,
  Activity, TrendingUp
} from 'lucide-react'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

// Import custom nurse components
import PatientDrawer from '@/components/nurse/PatientDrawer'
import SmartTriageForm from '@/components/nurse/SmartTriageForm'
import OrdersChecklist from '@/components/nurse/OrdersChecklist'
import RiskAlert from '@/components/nurse/RiskAlert'

interface Appointment {
  _id: string
  queueNumber?: number
  patient?: {
    _id: string
    fullName: string
    phone: string
    doctorType: string
    reason: string
    email?: string
  }
  status: 'waiting' | 'in-progress' | 'done'
  temperature?: string
  bloodPressure?: string
  pulse?: string
  oxygen?: string
  weight?: string
  height?: string
  nurseNote?: string
  triageRiskLevel?: 'normal' | 'warning' | 'critical'
  readyForDoctor?: boolean
  orders?: any[]
  createdAt?: string
}

const statusConfig = {
  waiting: { color: 'bg-yellow-500', label: 'Waiting', textColor: 'text-yellow-300' },
  'in-progress': { color: 'bg-blue-500', label: 'In Vitals', textColor: 'text-blue-300' },
  done: { color: 'bg-green-500', label: 'Done', textColor: 'text-green-300' },
}

export default function NurseDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [triageMode, setTriageMode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Role check
      if (session?.user?.role !== 'Nurse' && session?.user?.role !== 'Admin') {
        toast.error('Access denied. Nurse role required.')
        router.push('/login')
        return
      }
      fetchAppointments()
    }
  }, [status, session, router])

  // 🔔 Real-time updates: Listen for appointment changes
  useRealTimeUpdates({
    channel: 'appointments',
    events: {
      'appointment-updated': fetchAppointments,
      'new-booking': fetchAppointments,
    },
    enabled: status === 'authenticated',
  })

  const fetchAppointments = async () => {
    try {
      // Request only 50 appointments at a time for faster load
      const res = await fetch('/api/appointment?limit=50&page=1')
      const result = await res.json()
      const data = Array.isArray(result) ? result : (result.data || [])
      setAppointments(data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCallPatient = async (id: string) => {
    try {
      const res = await fetch(`/api/appointment/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-progress' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Patient called - Status changed to In Vitals')
      fetchAppointments()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleUpdateVitals = async (id: string, vitals: any) => {
    try {
      const res = await fetch(`/api/nurse/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitals),
      })
      if (!res.ok) throw new Error()
      toast.success('Vitals saved to chart successfully!')
      setTriageMode(null)
      fetchAppointments()
    } catch {
      toast.error('Failed to update vitals')
    }
  }

  const handleNotifyDoctor = async (id: string) => {
    try {
      const res = await fetch(`/api/nurse/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readyForDoctor: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Doctor notified - Patient ready!')
      fetchAppointments()
    } catch {
      toast.error('Notification failed')
    }
  }

  const openPatientProfile = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDrawerOpen(true)
  }

  const openTriageForm = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setTriageMode(appointment._id)
  }

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(a => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          a.patient?.fullName?.toLowerCase().includes(query) ||
          a.patient?.phone?.includes(query) ||
          a.queueNumber?.toString().includes(query)
        )
      })
      .sort((a, b) => {
        // Priority: critical > warning > waiting > in-progress > done
        const riskOrder = { critical: 0, warning: 1, normal: 2, undefined: 3 }
        const statusOrder = { waiting: 0, 'in-progress': 1, done: 2 }

        const riskDiff = (riskOrder[a.triageRiskLevel as keyof typeof riskOrder] || 3) -
                        (riskOrder[b.triageRiskLevel as keyof typeof riskOrder] || 3)
        if (riskDiff !== 0) return riskDiff

        return statusOrder[a.status] - statusOrder[b.status]
      })
  }, [appointments, searchQuery])

  const stats = useMemo(() => ({
    waiting: appointments.filter(a => a.status === 'waiting').length,
    inVitals: appointments.filter(a => a.status === 'in-progress').length,
    critical: appointments.filter(a => a.triageRiskLevel === 'critical').length,
    readyForDoctor: appointments.filter(a => a.readyForDoctor).length,
  }), [appointments])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 animate-pulse">
            <Heart className="w-8 h-8 text-green-400 animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-white">Loading Nurse Dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all ${sidebarOpen ? 'bg-black/50' : 'pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-80 h-screen bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col transition-all z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="w-7 h-7 text-green-400" />
            Clinical Hub
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl mb-6">
          <p className="text-sm text-slate-300">Signed in as</p>
          <p className="text-lg font-semibold text-white truncate">
            {session?.user?.name || 'Nurse'}
          </p>
          <p className="text-xs text-green-400 mt-1">Role: {session?.user?.role}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Waiting" value={stats.waiting} color="yellow" icon={Clock} />
          <StatCard label="In Vitals" value={stats.inVitals} color="blue" icon={Activity} />
          <StatCard label="Critical" value={stats.critical} color="red" icon={AlertCircle} />
          <StatCard label="Ready" value={stats.readyForDoctor} color="green" icon={Bell} />
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2 flex-1">
          <NavButton
            icon={<Users className="w-5 h-5" />}
            label="My Queue"
            active
            badge={stats.waiting}
          />
          <NavButton
            icon={<ClipboardCheck className="w-5 h-5" />}
            label="Triage"
            onClick={() => {}}
          />
          <NavButton
            icon={<TrendingUp className="w-5 h-5" />}
            label="Schedule"
            onClick={() => {}}
          />
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg font-medium transition-all border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-slate-800/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients (name, phone, queue #)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 text-base"
              />
            </div>

            <span className="text-sm text-slate-400 hidden md:block">
              {filteredAppointments.length} patient{filteredAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="w-full p-6 space-y-6">
          {/* Critical Alerts Banner */}
          {stats.critical > 0 && (
            <div className="bg-red-500/20 backdrop-blur-xl border-2 border-red-500/40 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">
                    {stats.critical} CRITICAL PATIENT{stats.critical > 1 ? 'S' : ''} REQUIRE ATTENTION
                  </h3>
                  <p className="text-red-200">
                    Patients with critical vitals are highlighted below. Please prioritize assessment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Queue */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">No patients found</p>
                <p className="text-slate-500 text-sm mt-1">The queue is empty or no matches</p>
              </div>
            ) : (
              filteredAppointments.map(appointment => {
                const isTriaging = triageMode === appointment._id
                const hasVitals = appointment.temperature || appointment.bloodPressure

                return (
                  <div
                    key={appointment._id}
                    className={`bg-slate-800/30 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all ${
                      appointment.triageRiskLevel === 'critical'
                        ? 'border-red-500/50 shadow-lg shadow-red-500/20'
                        : appointment.triageRiskLevel === 'warning'
                        ? 'border-yellow-500/50'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-6">
                      <div className="flex items-start gap-4 flex-wrap">
                        {/* Status Indicator */}
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 rounded-full ${statusConfig[appointment.status].color}`} />
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-2xl font-bold text-white">
                              #{appointment.queueNumber || '-'}
                            </h3>
                            <button
                              onClick={() => openPatientProfile(appointment)}
                              className="text-xl font-bold text-white hover:text-green-400 transition-colors flex items-center gap-2"
                            >
                              {appointment.patient?.fullName || 'Unknown'}
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {appointment.patient?.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-4 h-4" />
                              {appointment.patient?.doctorType}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[appointment.status].color}/20 ${statusConfig[appointment.status].textColor}`}>
                              {statusConfig[appointment.status].label}
                            </span>
                          </div>

                          <p className="text-sm text-slate-300">
                            <span className="font-medium">Reason:</span> {appointment.patient?.reason}
                          </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          {appointment.status === 'waiting' && (
                            <button
                              onClick={() => handleCallPatient(appointment._id)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-base"
                            >
                              Call Patient
                            </button>
                          )}
                          {appointment.status === 'in-progress' && !isTriaging && (
                            <button
                              onClick={() => openTriageForm(appointment)}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-base"
                            >
                              {hasVitals ? 'Update Vitals' : 'Record Vitals'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Risk Alert */}
                      {appointment.triageRiskLevel && appointment.triageRiskLevel !== 'normal' && (
                        <div className="mt-4">
                          <RiskAlert riskLevel={appointment.triageRiskLevel} />
                        </div>
                      )}

                      {/* Ready for Doctor Badge */}
                      {appointment.readyForDoctor && (
                        <div className="mt-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center gap-2">
                          <Bell className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-purple-300 font-medium">Ready for Doctor</span>
                        </div>
                      )}
                    </div>

                    {/* Triage Form */}
                    {isTriaging && (
                      <div className="border-t border-white/5 p-6 bg-white/5">
                        <SmartTriageForm
                          appointmentId={appointment._id}
                          currentVitals={{
                            temperature: appointment.temperature,
                            bloodPressure: appointment.bloodPressure,
                            pulse: appointment.pulse,
                            oxygen: appointment.oxygen,
                            weight: appointment.weight,
                            height: appointment.height,
                            nurseNote: appointment.nurseNote,
                          }}
                          onSubmit={handleUpdateVitals}
                          onCancel={() => setTriageMode(null)}
                        />

                        {/* Orders Checklist */}
                        {appointment.orders && appointment.orders.length > 0 && (
                          <div className="mt-6">
                            <OrdersChecklist
                              appointmentId={appointment._id}
                              orders={appointment.orders}
                              nurseName={session?.user?.name || 'Nurse'}
                              onUpdate={fetchAppointments}
                            />
                          </div>
                        )}

                        {/* Notify Doctor Button */}
                        {hasVitals && (
                          <button
                            onClick={() => handleNotifyDoctor(appointment._id)}
                            disabled={appointment.readyForDoctor}
                            className={`w-full mt-6 px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                              appointment.readyForDoctor
                                ? 'bg-green-600/50 text-green-300 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                          >
                            <Bell className="w-6 h-6" />
                            {appointment.readyForDoctor ? 'Doctor Already Notified' : 'Notify Doctor - Patient Ready'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Patient Profile Drawer */}
      <PatientDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: any) {
  const colorClasses = {
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
  }

  return (
    <div className={`p-4 ${colorClasses[color as keyof typeof colorClasses]} border rounded-xl hover:scale-105 transition-all text-center`}>
      <div className="flex items-center justify-center mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  )
}

function NavButton({ icon, label, active, badge, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
        active
          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
          : 'text-slate-300 hover:bg-white/10'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-bold">
          {badge}
        </span>
      )}
    </button>
  )
}
