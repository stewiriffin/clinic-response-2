'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Clock, CheckCircle, AlertCircle, Filter, Save,
  Trash2, Phone, User, Stethoscope, FileText, LogOut,
  ChevronDown, X, Menu
} from 'lucide-react'

type Appointment = {
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
  readyForDoctor?: boolean
  labTest?: string
  prescription?: string
  diagnosis?: string
  doctorNote?: string
  followUp?: string
}

const doctorTypes = [
  'All',
  'Surgeon',
  'Dentist',
  'Pediatrician',
  'Cardiologist',
  'Neurologist',
  'General Physician',
  'Gynecologist',
]

const statusConfig = {
  waiting: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Waiting' },
  'in-progress': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'In Progress' },
  done: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Done' },
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [edited, setEdited] = useState<Record<string, any>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    reason: '',
    doctor: 'All',
    status: 'all' as 'all' | 'waiting' | 'in-progress' | 'done'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (
      status === 'authenticated' &&
      (!session?.user?.role || session.user.role.toLowerCase() !== 'doctor')
    ) {
      router.push('/login')
    }
  }, [status, session, router])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/appointment')
      const result = await res.json()
      // Handle both paginated response and plain array for backwards compatibility
      const data = Array.isArray(result) ? result : (result.data || [])
      setAppointments(data)

      if (!isEditing) {
        const newData: Record<string, any> = {}
        data.forEach((a: any) => {
          newData[a._id] = {
            labTest: a.labTest || '',
            prescription: a.prescription || '',
            diagnosis: a.diagnosis || '',
            doctorNote: a.doctorNote || '',
            followUp: a.followUp || '',
          }
        })
        setEdited(newData)
      }
    } catch (err) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments()
      const interval = setInterval(fetchAppointments, 5000)
      return () => clearInterval(interval)
    }
  }, [status])

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

  const handleSave = async (id: string) => {
    try {
      await fetch(`/api/appointment/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edited[id]),
      })
      toast.success('Appointment updated successfully')
      setIsEditing(false)
      setExpandedId(null)
      fetchAppointments()
    } catch {
      toast.error('Failed to save appointment')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/appointment/${id}/status`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Appointment deleted')
      setDeleteConfirm(null)
      fetchAppointments()
    } catch {
      toast.error('Failed to delete appointment')
    }
  }

  const handleChange = (id: string, field: string, value: string) => {
    setIsEditing(true)
    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const filtered = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          (filters.doctor === 'All' ||
            a.patient?.doctorType?.toLowerCase() === filters.doctor.toLowerCase()) &&
          a.patient?.fullName?.toLowerCase().includes(filters.name.toLowerCase()) &&
          a.patient?.phone?.includes(filters.phone) &&
          a.patient?.reason?.toLowerCase().includes(filters.reason.toLowerCase()) &&
          (filters.status === 'all' || a.status === filters.status)
      )
      .sort((a, b) => {
        const statusOrder = { waiting: 0, 'in-progress': 1, done: 2 }
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
      })
  }, [appointments, filters])

  const stats = useMemo(() => {
    return {
      waiting: appointments.filter(a => a.status === 'waiting').length,
      inProgress: appointments.filter(a => a.status === 'in-progress').length,
      done: appointments.filter(a => a.status === 'done').length,
      total: appointments.length
    }
  }, [appointments])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 animate-pulse">
            <Stethoscope className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-xl font-semibold text-white">Loading Dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-x-hidden">
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all ${sidebarOpen ? 'bg-black/50' : 'pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`fixed left-0 top-0 w-64 h-screen bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col transition-all z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-blue-400" />
            Doctor Console
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-slate-300">Welcome,</p>
            <p className="text-lg font-semibold text-white">
              {session?.user?.name || 'Doctor'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Waiting" value={stats.waiting} icon="⏳" color="yellow" />
            <StatCard label="In Progress" value={stats.inProgress} icon="🔄" color="blue" />
            <StatCard label="Completed" value={stats.done} icon="✓" color="green" />
            <StatCard label="Total" value={stats.total} icon="📋" color="purple" />
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

      <div className="lg:ml-64">
        <div className="sticky top-0 z-50 bg-slate-800/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {filtered.length} of {appointments.length} appointments
              </span>
            </div>
          </div>
        </div>

        <div className="w-full p-6 space-y-6">
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                icon={<FileText className="w-4 h-4" />}
                placeholder="Search by reason"
                value={filters.reason}
                onChange={(value: string) => setFilters(prev => ({ ...prev, reason: value }))}
              />
              <select
                value={filters.doctor}
                onChange={(e) => setFilters(prev => ({ ...prev, doctor: e.target.value }))}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              >
                {doctorTypes.map((d) => (
                  <option key={d} value={d} className="bg-slate-800">
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="waiting" className="bg-slate-800">Waiting</option>
                <option value="in-progress" className="bg-slate-800">In Progress</option>
                <option value="done" className="bg-slate-800">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">No appointments found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filtered.map((appointment) => {
                const isDone = appointment.status === 'done'
                const isExpanded = expandedId === appointment._id

                return (
                  <div
                    key={appointment._id}
                    className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                  >
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
                            <h4 className="text-lg font-semibold text-white">
                              {appointment.patient?.fullName || 'Unknown Patient'}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                              <span>#{appointment.queueNumber || '-'}</span>
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
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {appointment.readyForDoctor && (
                        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-300 font-medium">Ready for Review</span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/5 p-6 space-y-6 bg-white/5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <VitalCard label="Temperature" value={appointment.temperature} unit="°C" />
                          <VitalCard label="BP" value={appointment.bloodPressure} unit="" />
                          <VitalCard label="Weight" value={appointment.weight} unit="kg" />
                          <VitalCard label="Height" value={appointment.height} unit="cm" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Reason for Visit
                          </label>
                          <p className="text-white bg-white/5 rounded-lg p-3 border border-white/10">
                            {appointment.patient?.reason || 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {['labTest', 'prescription', 'diagnosis', 'doctorNote'].map((field) => (
                            <div key={field}>
                              <label className="block text-sm font-semibold text-slate-300 mb-2 capitalize">
                                {field === 'labTest' ? 'Lab Test' :
                                 field === 'doctorNote' ? "Doctor's Note" :
                                 field.charAt(0).toUpperCase() + field.slice(1)}
                              </label>
                              <textarea
                                disabled={isDone}
                                className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all resize-none ${
                                  isDone ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                rows={2}
                                value={edited[appointment._id]?.[field] || ''}
                                onChange={(e) => handleChange(appointment._id, field, e.target.value)}
                              />
                            </div>
                          ))}

                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Follow-up Date
                            </label>
                            <input
                              type="date"
                              disabled={isDone}
                              className={`w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all ${
                                isDone ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              value={
                                edited[appointment._id]?.followUp
                                  ? edited[appointment._id].followUp.split('T')[0]
                                  : ''
                              }
                              onChange={(e) => handleChange(appointment._id, 'followUp', e.target.value)}
                            />
                          </div>
                        </div>

                        {!isDone && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Appointment Status
                            </label>
                            <div className="flex gap-2">
                              {['waiting', 'in-progress', 'done'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateStatus(appointment._id, status)}
                                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                                    appointment.status === status
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                  }`}
                                >
                                  {statusConfig[status as keyof typeof statusConfig].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                          <button
                            onClick={() => handleSave(appointment._id)}
                            disabled={isDone || !isEditing}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              isDone || !isEditing
                                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-green-600/80 hover:bg-green-600 text-white'
                            }`}
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(appointment._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg font-medium transition-all border border-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <Modal
          title="Delete Appointment"
          message="Are you sure you want to delete this appointment? This action cannot be undone."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          isDangerous
        />
      )}
    </div>
  )
}

const VitalCard = ({ label, value, unit }: any) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
    <p className="text-sm text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-white">
      {value || '-'} <span className="text-sm text-slate-400">{unit}</span>
    </p>
  </div>
)

const StatCard = ({ label, value, icon }: any) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center hover:border-white/20 transition-all">
    <p className="text-2xl mb-1">{icon}</p>
    <p className="text-xl font-bold text-white">{value}</p>
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
      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/20 transition-all"
    />
  </div>
)

const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-300 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-6 py-2 rounded-lg font-medium transition-all text-white ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isDangerous ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
)
