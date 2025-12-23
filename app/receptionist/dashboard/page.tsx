'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useRef, useMemo, ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Trash2, Printer, Edit, LogOut, Menu, X,
  Phone, Mail, User, Stethoscope, AlertCircle,
  Calendar, Filter, Users
} from 'lucide-react'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'

interface Appointment {
  _id: string
  patient?: {
    fullName: string
    phone: string
    email?: string
    reason: string
    doctorType: string
  }
  queueNumber: number
  status: string
}

const doctorTypes = [
  'Surgeon',
  'Dentist',
  'Pediatrician',
  'Cardiologist',
  'Neurologist',
  'General Physician',
  'Gynecologist',
]

const reasons = [
  'Routine Check-up',
  'Emergency',
  'Surgery Consultation',
  'Follow-up',
  'Lab Results Review',
  'Prescription Renewal',
]

export default function ReceptionistDashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedSlip, setSelectedSlip] = useState<Appointment | null>(null)
  const printRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [rescheduleId, setRescheduleId] = useState('')
  const [rescheduleForm, setRescheduleForm] = useState({
    reason: '',
    doctorType: '',
  })

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    reason: '',
    doctorType: '',
  })

  const [filters, setFilters] = useState({
    searchName: '',
    searchPhone: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchAppointments()
    }
  }, [status, router])

  // Real-time updates: Listen for appointment changes
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
      setLoading(true)
      // Request only 50 appointments at a time for faster load
      const res = await fetch('/api/appointment?limit=50&page=1')
      const result = await res.json()
      // Handle both paginated response and plain array for backwards compatibility
      const data = Array.isArray(result) ? result : (result.data || [])
      setAppointments(data)
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.fullName || !form.phone || !form.reason || !form.doctorType) {
      toast.error('All required fields must be filled')
      return
    }
    if (form.phone.length > 10) {
      toast.error('Phone number must not exceed 10 digits')
      return
    }

    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(`Booked! Queue: ${data.queueNumber}`)
      setForm({
        fullName: '',
        phone: '',
        email: '',
        reason: '',
        doctorType: '',
      })
      fetchAppointments()
    } catch (error) {
      console.error(error)
      toast.error('Booking failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      const res = await fetch(`/api/appointment/${id}/status`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch {
      toast.error('Failed to cancel appointment')
    }
  }

  const handlePrint = (appointment: Appointment) => {
    setSelectedSlip(appointment)
    setTimeout(() => {
      window.print()
      setSelectedSlip(null)
    }, 300)
  }

  const handleReschedule = async (id: string) => {
    if (!rescheduleForm.reason || !rescheduleForm.doctorType) {
      toast.error('Please fill in both reason and doctor')
      return
    }

    try {
      const res = await fetch(`/api/appointment/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rescheduleForm),
      })
      if (!res.ok) throw new Error()
      toast.success('Appointment rescheduled')
      setRescheduleId('')
      fetchAppointments()
    } catch {
      toast.error('Failed to reschedule appointment')
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const nameMatch = !filters.searchName ||
        a.patient?.fullName?.toLowerCase().includes(filters.searchName.toLowerCase())
      const phoneMatch = !filters.searchPhone ||
        a.patient?.phone?.includes(filters.searchPhone)
      return nameMatch && phoneMatch
    })
  }, [appointments, filters])

  const stats = useMemo(() => ({
    total: appointments.length,
    today: appointments.length,
  }), [appointments])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 animate-pulse">
            <Calendar className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <p className="text-xl font-semibold text-white">Loading Receptionist Dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all ${sidebarOpen ? 'bg-black/50' : 'pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`fixed left-0 top-0 w-64 h-screen bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col transition-all z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-400" />
            Reception Desk
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-slate-300">Dashboard</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total Appointments</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Booked" value={appointments.filter(a => a.status === 'waiting').length} />
            <StatCard label="In Progress" value={appointments.filter(a => a.status === 'in-progress').length} />
            <StatCard label="Completed" value={appointments.filter(a => a.status === 'done').length} />
            <StatCard label="Today" value={appointments.length} />
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
              <h2 className="text-2xl font-bold text-white">Reception</h2>
            </div>
          </div>
        </div>

        <div className="w-full p-6 space-y-6">
          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Book New Appointment</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  icon={<User className="w-4 h-4" />}
                  placeholder="Full Name"
                  type="text"
                  value={form.fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
                <FormInput
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="Phone (Max 10)"
                  type="tel"
                  value={form.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                  required
                  maxLength={10}
                />
                <FormInput
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                />
                <FormSelect
                  icon={<AlertCircle className="w-4 h-4" />}
                  value={form.reason}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({ ...form, reason: e.target.value })}
                  options={reasons}
                  label="Select Reason"
                  required
                />
                <FormSelect
                  icon={<Stethoscope className="w-4 h-4" />}
                  value={form.doctorType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({ ...form, doctorType: e.target.value })}
                  options={doctorTypes}
                  label="Select Doctor"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Book Appointment
              </button>
            </form>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Search Appointments</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                icon={<Search className="w-4 h-4" />}
                placeholder="Search by name"
                type="text"
                value={filters.searchName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, searchName: e.target.value })}
              />
              <FormInput
                icon={<Phone className="w-4 h-4" />}
                placeholder="Search by phone"
                type="text"
                value={filters.searchPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, searchPhone: e.target.value })}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                Showing <span className="text-white font-semibold">{filteredAppointments.length}</span> of <span className="text-white font-semibold">{appointments.length}</span> appointments
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">No appointments found</p>
              </div>
            ) : (
              filteredAppointments.map(appointment => (
                <div
                  key={appointment._id}
                  className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
                          appointment.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {appointment.status}
                        </div>
                        <span className="text-sm text-slate-400">Queue #{appointment.queueNumber}</span>
                      </div>

                      <h4 className="text-lg font-semibold text-white mb-2">
                        {appointment.patient?.fullName}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-4 h-4 text-purple-400" />
                          {appointment.patient?.phone}
                        </div>
                        {appointment.patient?.email && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="w-4 h-4 text-purple-400" />
                            {appointment.patient.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-300">
                          <AlertCircle className="w-4 h-4 text-purple-400" />
                          {appointment.patient?.reason}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Stethoscope className="w-4 h-4 text-purple-400" />
                          {appointment.patient?.doctorType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handlePrint(appointment)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-all border border-green-500/20"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleId(appointment._id)
                        setRescheduleForm({
                          reason: appointment.patient?.reason || '',
                          doctorType: appointment.patient?.doctorType || '',
                        })
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg transition-all border border-yellow-500/20"
                    >
                      <Edit className="w-4 h-4" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleDelete(appointment._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>

                  {rescheduleId === appointment._id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      <h5 className="font-semibold text-white">Reschedule Appointment</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect
                          value={rescheduleForm.reason}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setRescheduleForm({
                              ...rescheduleForm,
                              reason: e.target.value,
                            })
                          }
                          options={reasons}
                          label="New Reason"
                        />
                        <FormSelect
                          value={rescheduleForm.doctorType}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setRescheduleForm({
                              ...rescheduleForm,
                              doctorType: e.target.value,
                            })
                          }
                          options={doctorTypes}
                          label="New Doctor"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReschedule(appointment._id)}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRescheduleId('')}
                          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg font-medium transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedSlip && (
        <div
          ref={printRef}
          className="hidden print:block fixed top-0 left-0 w-full h-full bg-white text-black p-12 z-50"
        >
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Appointment Confirmation</h1>

            <div className="border-2 border-black p-8 space-y-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold">{selectedSlip.patient?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Queue Number</p>
                  <p className="text-lg font-semibold">#{selectedSlip.queueNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold">{selectedSlip.patient?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{selectedSlip.patient?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="text-lg font-semibold">{selectedSlip.patient?.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doctor Type</p>
                  <p className="text-lg font-semibold">{selectedSlip.patient?.doctorType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold capitalize">{selectedSlip.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date and Time</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <p className="text-center mt-8 text-gray-600">Please keep this slip for your records</p>
          </div>
        </div>
      )}
    </div>
  )
}

const FormInput = ({ icon, placeholder, type, value, onChange, required, maxLength }: any) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      maxLength={maxLength}
      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all"
    />
  </div>
)

const FormSelect = ({ icon, value, onChange, options, label, required }: any) => (
  <div className="relative">
    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all appearance-none`}
    >
      <option value="" className="bg-slate-800">{label}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt} className="bg-slate-800">
          {opt}
        </option>
      ))}
    </select>
  </div>
)

const StatCard = ({ label, value }: any) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
)
