'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Heart, Thermometer, Activity, Ruler, Weight, FileText, Bell,
  LogOut, Menu, X, Filter, AlertCircle, CheckCircle,
  Clock, Stethoscope, Phone, User
} from 'lucide-react'

interface Appointment {
  _id: string
  queueNumber?: number
  patient?: {
    fullName: string
    phone: string
    doctorType: string
    reason: string
  }
  status: 'waiting' | 'in-progress' | 'done'
  temperature?: string
  bloodPressure?: string
  weight?: string
  height?: string
  nurseNote?: string
  readyForDoctor?: boolean
}

const statusConfig = {
  waiting: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Waiting' },
  'in-progress': { color: 'bg-blue-100 text-blue-800', icon: Activity, label: 'In Progress' },
  done: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Done' },
}

export default function NurseDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    doctor: '',
    status: '' as 'waiting' | 'in-progress' | 'done' | ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchAppointments()
      const interval = setInterval(fetchAppointments, 5000)
      return () => clearInterval(interval)
    }
  }, [status, router])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/appointment')
      const data = await res.json()
      setAppointments(data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
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
      toast.success('Vitals updated successfully')
      setExpandedId(null)
      fetchAppointments()
    } catch {
      toast.error('Failed to update vitals')
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointment/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success('Status updated')
      fetchAppointments()
    } catch {
      toast.error('Failed to update status')
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
      toast.success('Doctor notified')
      fetchAppointments()
    } catch {
      toast.error('Notification failed')
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesName = !filters.name ||
        a.patient?.fullName?.toLowerCase().includes(filters.name.toLowerCase())
      const matchesPhone = !filters.phone || a.patient?.phone?.includes(filters.phone)
      const matchesDoctor = !filters.doctor ||
        a.patient?.doctorType?.toLowerCase().includes(filters.doctor.toLowerCase())
      const matchesStatus = !filters.status || a.status === filters.status

      return matchesName && matchesPhone && matchesDoctor && matchesStatus
    })
      .sort((a, b) => {
        const statusOrder = { waiting: 0, 'in-progress': 1, done: 2 }
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
      })
  }, [appointments, filters])

  const stats = useMemo(() => ({
    waiting: appointments.filter(a => a.status === 'waiting').length,
    inProgress: appointments.filter(a => a.status === 'in-progress').length,
    done: appointments.filter(a => a.status === 'done').length,
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
      <div className={`fixed left-0 top-0 w-64 h-screen bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col transition-all z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            NurseHub
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-slate-300">Welcome,</p>
            <p className="text-lg font-semibold text-white truncate">
              {session?.user?.fullName || 'Nurse'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Waiting" value={stats.waiting} color="yellow" />
            <StatCard label="In Progress" value={stats.inProgress} color="blue" />
            <StatCard label="Completed" value={stats.done} color="green" />
            <StatCard label="Ready" value={stats.readyForDoctor} color="purple" />
          </div>
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
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-slate-800/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white">Appointments</h2>
            </div>
            <span className="text-sm text-slate-400">
              {filteredAppointments.length} of {appointments.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="w-full p-6 space-y-6">
          {/* Filters */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterInput
                icon={<User className="w-4 h-4" />}
                placeholder="Search by name"
                value={filters.name}
                onChange={(value: string) => setFilters(prev => ({ ...prev, name: value }))}
              />
              <FilterInput
                icon={<Phone className="w-4 h-4" />}
                placeholder="Search by phone"
                value={filters.phone}
                onChange={(value: string) => setFilters(prev => ({ ...prev, phone: value }))}
              />
              <FilterInput
                icon={<Stethoscope className="w-4 h-4" />}
                placeholder="Search by doctor"
                value={filters.doctor}
                onChange={(value: string) => setFilters(prev => ({ ...prev, doctor: value }))}
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500/50"
              >
                <option value="" className="bg-slate-800">All Statuses</option>
                <option value="waiting" className="bg-slate-800">Waiting</option>
                <option value="in-progress" className="bg-slate-800">In Progress</option>
                <option value="done" className="bg-slate-800">Done</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">No appointments found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredAppointments.map(appointment => {
                const isEditable = appointment.status === 'waiting' || appointment.status === 'in-progress'
                const isExpanded = expandedId === appointment._id

                return (
                  <div
                    key={appointment._id}
                    className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                  >
                    {/* Header */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : appointment._id)}
                      className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${
                              appointment.status === 'waiting' ? 'bg-yellow-400' :
                              appointment.status === 'in-progress' ? 'bg-blue-400' : 'bg-green-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-semibold text-white">
                                #{appointment.queueNumber || '-'}
                              </h4>
                              <span className="text-slate-400">-</span>
                              <h4 className="text-lg font-semibold text-white">
                                {appointment.patient?.fullName || 'Unknown'}
                              </h4>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {appointment.patient?.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-4 h-4" />
                                {appointment.patient?.doctorType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusConfig[appointment.status].color}`}>
                            <Clock className="w-4 h-4" />
                            {statusConfig[appointment.status].label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-sm text-slate-300">
                          <span className="font-medium">Reason:</span> {appointment.patient?.reason}
                        </p>
                      </div>

                      {appointment.readyForDoctor && (
                        <div className="mt-3 p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center gap-2">
                          <Bell className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-purple-300 font-medium">Ready for Doctor</span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && isEditable && (
                      <div className="border-t border-white/5 p-6 space-y-6 bg-white/5">
                        <VitalsForm
                          appointmentId={appointment._id}
                          onSubmit={handleUpdateVitals}
                          currentVitals={{
                            temperature: appointment.temperature || '',
                            bloodPressure: appointment.bloodPressure || '',
                            weight: appointment.weight || '',
                            height: appointment.height || '',
                            nurseNote: appointment.nurseNote || '',
                          }}
                        />

                        {/* Status Update */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Appointment Status
                          </label>
                          <div className="flex gap-2">
                            {(['waiting', 'in-progress'] as const).map(status => (
                              <button
                                key={status}
                                onClick={() => updateStatus(appointment._id, status)}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                                  appointment.status === status
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                }`}
                              >
                                {statusConfig[status as keyof typeof statusConfig].label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notify Doctor */}
                        <button
                          onClick={() => handleNotifyDoctor(appointment._id)}
                          disabled={appointment.readyForDoctor}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            appointment.readyForDoctor
                              ? 'bg-green-600/50 text-green-300 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                          {appointment.readyForDoctor ? 'Doctor Notified' : 'Notify Doctor'}
                        </button>
                      </div>
                    )}

                    {/* Completed View */}
                    {isExpanded && appointment.status === 'done' && (
                      <div className="border-t border-white/5 p-6 bg-white/5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <VitalDisplay icon={Thermometer} label="Temperature" value={appointment.temperature} unit="°C" />
                          <VitalDisplay icon={Activity} label="BP" value={appointment.bloodPressure} unit="" />
                          <VitalDisplay icon={Weight} label="Weight" value={appointment.weight} unit="kg" />
                          <VitalDisplay icon={Ruler} label="Height" value={appointment.height} unit="cm" />
                        </div>

                        {appointment.nurseNote && (
                          <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/10">
                            <p className="text-sm text-slate-300 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">Nurse Notes</span>
                            </p>
                            <p className="text-white">{appointment.nurseNote}</p>
                          </div>
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
    </div>
  )
}

function VitalsForm({ appointmentId, onSubmit, currentVitals }: any) {
  const [form, setForm] = useState({
    temperature: currentVitals.temperature,
    bloodPressure: currentVitals.bloodPressure,
    weight: currentVitals.weight,
    height: currentVitals.height,
    nurseNote: currentVitals.nurseNote,
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.temperature || !form.bloodPressure || !form.weight || !form.height) {
      toast.error('Please fill all vital fields')
      return
    }
    onSubmit(appointmentId, form)
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Record Vitals</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <VitalInput
          icon={<Thermometer className="w-4 h-4" />}
          name="temperature"
          placeholder="Temperature (°C)"
          value={form.temperature}
          onChange={handleChange}
        />
        <VitalInput
          icon={<Heart className="w-4 h-4" />}
          name="bloodPressure"
          placeholder="Blood Pressure (120/80)"
          value={form.bloodPressure}
          onChange={handleChange}
        />
        <VitalInput
          icon={<Weight className="w-4 h-4" />}
          name="weight"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
        />
        <VitalInput
          icon={<Ruler className="w-4 h-4" />}
          name="height"
          placeholder="Height (cm)"
          value={form.height}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Observations
        </label>
        <textarea
          name="nurseNote"
          placeholder="Add any observations or notes..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/20 transition-all resize-none"
          rows={3}
          value={form.nurseNote}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
      >
        <Activity className="w-4 h-4" />
        Save Vitals
      </button>
    </div>
  )
}

const VitalInput = ({ icon, name, placeholder, value, onChange }: any) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {icon}
    </div>
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/20 transition-all"
    />
  </div>
)

const VitalDisplay = ({ icon: Icon, label, value, unit }: any) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
    <div className="flex items-center justify-center mb-1 text-green-400">
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="text-lg font-bold text-white">
      {value || '-'} <span className="text-xs text-slate-400">{unit}</span>
    </p>
  </div>
)

const StatCard = ({ label, value }: any) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all text-center">
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
)

const FilterInput = ({ icon, placeholder, value, onChange }: any) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {icon}
    </div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:bg-white/20 transition-all"
    />
  </div>
)