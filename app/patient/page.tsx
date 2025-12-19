'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, Activity, User, Phone, Mail, FileText,
  AlertCircle, CheckCircle2, XCircle, Loader2, Search,
  MapPin, Stethoscope, RefreshCw, ArrowRight
} from 'lucide-react'

interface Appointment {
  _id: string
  queueNumber: number
  fullName: string
  phone: string
  email?: string
  doctorType: string
  reason: string
  status: 'waiting' | 'in-progress' | 'done' | 'cancelled'
  createdAt: string
  estimatedWaitTime?: number
}

const statusConfig = {
  waiting: {
    icon: Clock,
    label: 'Waiting',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30'
  },
  'in-progress': {
    icon: Activity,
    label: 'In Progress',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30'
  },
  done: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30'
  }
}

export default function PatientPortal() {
  const { data: session } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchPhone, setSearchPhone] = useState('')
  const [searchName, setSearchName] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'in-progress' | 'done'>('all')

  useEffect(() => {
    fetchAppointments()
  }, [searchPhone, searchName])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchPhone) params.append('phone', searchPhone)
      if (searchName) params.append('name', searchName)

      const res = await fetch(`/api/bookings?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(Array.isArray(data) ? data : data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(apt =>
    activeFilter === 'all' || apt.status === activeFilter
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Patient Portal
          </h1>
          <p className="text-slate-400">Track your appointments</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => router.push('/book')}
            className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl p-6 transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold">Book Appointment</h3>
                  <p className="text-sm text-blue-100">Schedule a visit</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => router.push('/status')}
            className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 text-white rounded-2xl p-6 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold">Queue Status</h3>
                  <p className="text-sm text-slate-400">Check wait times</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-slate-400" />
            </div>
          </button>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by phone..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={fetchAppointments}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'waiting', 'in-progress', 'done'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All' : statusConfig[filter].label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Appointments</h3>
            <p className="text-slate-400 mb-6">
              {searchPhone || searchName
                ? 'Try different search terms'
                : 'Book an appointment to get started'}
            </p>
            <button
              onClick={() => router.push('/book')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAppointments.map((appointment) => {
              const StatusIcon = statusConfig[appointment.status].icon
              const config = statusConfig[appointment.status]

              return (
                <div
                  key={appointment._id}
                  className={`bg-white/5 backdrop-blur-md border ${config.border} hover:border-white/30 rounded-2xl p-6 transition-all hover:shadow-lg`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Appointment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-16 h-16 ${config.bg} rounded-xl flex items-center justify-center border ${config.border}`}>
                          <span className={`text-2xl font-black ${config.color}`}>
                            {appointment.queueNumber}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{appointment.fullName}</h3>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 ${config.bg} rounded-lg ${config.border} border mt-1`}>
                            <StatusIcon className={`w-4 h-4 ${config.color}`} />
                            <span className={`text-sm font-semibold ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Stethoscope className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">Doctor:</span>
                          <span>{appointment.doctorType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">Booked:</span>
                          <span>{new Date(appointment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">Phone:</span>
                          <span>{appointment.phone}</span>
                        </div>
                        {appointment.email && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold">Email:</span>
                            <span className="truncate">{appointment.email}</span>
                          </div>
                        )}
                      </div>

                      {appointment.reason && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-start gap-2 text-slate-300">
                            <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <span className="font-semibold">Reason:</span>
                              <p className="text-slate-400 mt-1">{appointment.reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex md:flex-col gap-2">
                      {appointment.status === 'waiting' && (
                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm">
                          View Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && appointments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-blue-400">{appointments.length}</p>
              <p className="text-sm text-slate-400">Total</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-yellow-400">
                {appointments.filter(a => a.status === 'waiting').length}
              </p>
              <p className="text-sm text-slate-400">Waiting</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-blue-400">
                {appointments.filter(a => a.status === 'in-progress').length}
              </p>
              <p className="text-sm text-slate-400">In Progress</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-green-400">
                {appointments.filter(a => a.status === 'done').length}
              </p>
              <p className="text-sm text-slate-400">Completed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
